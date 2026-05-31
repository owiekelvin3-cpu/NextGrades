#!/usr/bin/env node
/**
 * Fix legacy materials that still point at public storage URLs.
 * Uses SUPABASE_SERVICE_ROLE_KEY only — no database password needed.
 *
 * Usage: npm run db:backfill-storage
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
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

loadEnv();

function pathFromUrl(url) {
  const match = url?.match(/\/storage\/v1\/object\/(?:public|sign)\/resources\/(.+?)(?:\?|$)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { data: materials, error } = await admin
    .from("materials")
    .select("id, title, url, storage_path")
    .not("url", "is", null);

  if (error) {
    console.error("Failed to load materials:", error.message);
    process.exit(1);
  }

  let updated = 0;
  for (const row of materials ?? []) {
    if (row.storage_path) continue;
    const storagePath = pathFromUrl(row.url);
    if (!storagePath) continue;

    const { error: updateError } = await admin
      .from("materials")
      .update({ storage_path: storagePath })
      .eq("id", row.id);

    if (updateError) {
      console.error(`  ✗ ${row.title}: ${updateError.message}`);
      continue;
    }

    console.log(`  ✓ ${row.title} → ${storagePath}`);
    updated += 1;

    const { data: signed, error: signError } = await admin.storage
      .from("resources")
      .createSignedUrl(storagePath, 60);
    if (signError) {
      console.warn(`    warning: signed URL test failed — ${signError.message}`);
    } else {
      console.log("    signed URL OK");
    }
  }

  console.log(`\nDone. Updated ${updated} material(s).`);
}

main();
