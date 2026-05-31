#!/usr/bin/env node
/**
 * Run one or more SQL files against the remote Supabase Postgres database.
 *
 * Requires in .env.local (do NOT paste these in chat):
 *   SUPABASE_DB_PASSWORD=your-database-password
 * or:
 *   SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@...pooler.supabase.com:6543/postgres
 *
 * Usage:
 *   node scripts/run-sql.mjs supabase/migrations/00017_pdf_alignment.sql
 *   npm run db:apply-pdf
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvFile() {
  const envPath = join(root, ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const projectRef = process.env.SUPABASE_PROJECT_REF || "pzavnfdhctsrhzesdvfd";

function getConnectionString() {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL;

  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) return null;

  const host = process.env.SUPABASE_DB_HOST || "aws-0-eu-central-1.pooler.supabase.com";
  const port = process.env.SUPABASE_DB_PORT || "6543";
  return `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@${host}:${port}/postgres`;
}

async function main() {
  const files = process.argv.slice(2).map((f) => resolve(root, f));
  if (files.length === 0) {
    console.error("Usage: node scripts/run-sql.mjs <file.sql> [file2.sql ...]");
    process.exit(1);
  }

  const connectionString = getConnectionString();
  if (!connectionString) {
    console.error(`
Missing database password.

In Supabase Dashboard → Project Settings → Database → copy the database password.
Add ONE line to .env.local (keep it local, never commit or paste in chat):

  SUPABASE_DB_PASSWORD=your-password-here

Then run again:
  npm run db:apply-pdf
`);
    process.exit(1);
  }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    console.log("Connecting to Supabase Postgres...");
    await client.connect();
    console.log("Connected.\n");

    for (const file of files) {
      if (!existsSync(file)) {
        throw new Error(`File not found: ${file}`);
      }
      console.log(`Running ${file.replace(root + "\\", "").replace(root + "/", "")}...`);
      const sql = readFileSync(file, "utf8");
      await client.query(sql);
      console.log("  Done.\n");
    }

    const { rows } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'subjects' AND column_name = 'slug'
    `);
    console.log(rows.length ? "✓ subjects.slug column exists" : "✗ subjects.slug still missing");

    const { rows: mats } = await client.query(`
      SELECT id, title, storage_path IS NOT NULL AS has_storage_path
      FROM public.materials WHERE status = 'published' LIMIT 5
    `);
    console.log("Published materials:", mats);

    console.log("\nSQL applied successfully.");
  } catch (error) {
    console.error("\nFailed:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
