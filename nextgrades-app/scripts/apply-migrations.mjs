#!/usr/bin/env node
/**
 * Apply pending Supabase migrations to the remote database.
 *
 * Set one of:
 *   SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 *   SUPABASE_DB_PASSWORD=your-database-password
 *
 * Optional: SUPABASE_PROJECT_REF (default: pzavnfdhctsrhzesdvfd)
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const migrationsDir = join(root, "supabase", "migrations");

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
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const projectRef = process.env.SUPABASE_PROJECT_REF || "pzavnfdhctsrhzesdvfd";

function getConnectionString() {
  if (process.env.SUPABASE_DB_URL) {
    return process.env.SUPABASE_DB_URL;
  }

  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) {
    return null;
  }

  const host =
    process.env.SUPABASE_DB_HOST ||
    `aws-0-eu-central-1.pooler.supabase.com`;
  const port = process.env.SUPABASE_DB_PORT || "6543";

  return `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@${host}:${port}/postgres`;
}

function loadMigrations() {
  const pending = [
    "00007_schema_columns.sql",
    "00003_teacher_cms.sql",
    "00004_ai_quiz_system.sql",
    "00008_quiz_performance.sql",
    "00009_chatbot.sql",
    "00010_materials_public_read.sql",
    "00011_rls_helpers_and_policy_fix.sql",
  ];

  return pending.map((file) => ({
    file,
    sql: readFileSync(join(migrationsDir, file), "utf8"),
  }));
}

async function verify(client) {
  const checks = [
    { table: "subjects", expect: "ok" },
    { table: "cms_content", expect: "ok" },
    { table: "generated_quizzes", expect: "optional" },
  ];

  for (const { table, expect } of checks) {
    try {
      await client.query(`SELECT 1 FROM public.${table} LIMIT 1`);
      console.log(`  ✓ ${table}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (expect === "optional") {
        console.log(`  · ${table} (not created yet)`);
      } else {
        console.log(`  ✗ ${table}: ${message}`);
      }
    }
  }
}

async function main() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    console.error(`
Missing database credentials.

Add to .env.local (never commit the password):
  SUPABASE_DB_PASSWORD=your-database-password

Or set the full connection string:
  SUPABASE_DB_URL=postgresql://postgres.${projectRef}:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

Find the password in Supabase Dashboard → Project Settings → Database.
Then run: npm run db:setup
`);
    process.exit(1);
  }

  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    console.log("Connecting to Supabase Postgres...");
    await client.connect();
    console.log("Connected.\n");

    const migrations = loadMigrations();
    for (const { file, sql } of migrations) {
      console.log(`Applying ${file}...`);
      await client.query(sql);
      console.log(`  Done.\n`);
    }

    console.log("Verifying tables...");
    await verify(client);
    console.log("\nDatabase setup complete.");
  } catch (error) {
    console.error("\nMigration failed:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
