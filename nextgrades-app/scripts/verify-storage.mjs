#!/usr/bin/env node
/**
 * Verify Supabase storage buckets for teacher uploads.
 * Creates/syncs buckets when SUPABASE_SERVICE_ROLE_KEY is set.
 *
 * Usage: npm run storage:verify
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const REQUIRED = ["resources", "resource-thumbnails", "avatars"];

async function main() {
  if (!url) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
    process.exit(1);
  }

  if (!serviceKey) {
    console.error(`
Missing SUPABASE_SERVICE_ROLE_KEY — teacher file uploads will fail.

Add to .env.local:
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

Find it in Supabase Dashboard → Settings → API → service_role (secret).
`);
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Syncing storage buckets...\n");

  const specs = [
    {
      id: "resources",
      public: false,
      fileSizeLimit: 52428800,
      allowedMimeTypes: [
        "application/pdf", "video/mp4", "video/webm", "video/quicktime",
        "image/jpeg", "image/png", "image/webp",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ],
    },
    {
      id: "resource-thumbnails",
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    },
    {
      id: "avatars",
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    },
  ];

  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) {
    console.error("Failed to list buckets:", listError.message);
    process.exit(1);
  }

  const existing = new Set((buckets ?? []).map((b) => b.id));
  let ok = true;

  for (const spec of specs) {
    const options = {
      public: spec.public,
      fileSizeLimit: spec.fileSizeLimit,
      allowedMimeTypes: spec.allowedMimeTypes,
    };

    if (!existing.has(spec.id)) {
      const { error } = await admin.storage.createBucket(spec.id, options);
      if (error) {
        console.log(`  ✗ ${spec.id}: create failed — ${error.message}`);
        ok = false;
      } else {
        console.log(`  ✓ ${spec.id}: created`);
      }
    } else {
      const { error } = await admin.storage.updateBucket(spec.id, options);
      if (error) {
        console.log(`  ✗ ${spec.id}: sync failed — ${error.message}`);
        ok = false;
      } else {
        console.log(`  ✓ ${spec.id}: synced`);
      }
    }
  }

  const { data: after } = await admin.storage.listBuckets();
  const have = new Set((after ?? []).map((b) => b.id));
  for (const id of REQUIRED) {
    if (!have.has(id)) {
      console.log(`  ✗ ${id}: still missing`);
      ok = false;
    }
  }

  console.log("");
  if (ok) {
    console.log("Storage ready for teacher uploads.");
    process.exit(0);
  }

  console.error("Storage verification failed. Check Supabase project permissions.");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
