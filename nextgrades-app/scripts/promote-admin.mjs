#!/usr/bin/env node
/**
 * Promote an account to admin (or create + promote).
 * Usage (PowerShell):
 *   $env:ADMIN_SETUP_EMAIL="you@example.com"
 *   $env:ADMIN_SETUP_PASSWORD="your-password"   # optional — only if creating a new auth user
 *   node scripts/promote-admin.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
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

const email = (process.env.ADMIN_SETUP_EMAIL || process.env.ADMIN_BOOTSTRAP_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_SETUP_PASSWORD || "";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!email) {
  console.error("Set ADMIN_SETUP_EMAIL (or ADMIN_BOOTSTRAP_EMAIL) before running.");
  process.exit(1);
}
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  let page = 1;
  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === targetEmail);
    if (match) return match;
    if (data.users.length < 200) break;
    page++;
  }
  return null;
}

async function main() {
  console.log(`Looking up: ${email}`);

  let user = await findUserByEmail(email);

  if (!user) {
    if (!password) {
      console.error("User not found. Set ADMIN_SETUP_PASSWORD to create the account, or register first at /register");
      process.exit(1);
    }
    console.log("Creating auth user…");
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "NextGrades Admin",
        role: "admin",
      },
    });
    if (error) throw error;
    user = data.user;
    console.log("Created user:", user.id);
  } else {
    console.log("Found user:", user.id);
    if (password) {
      const { error } = await admin.auth.admin.updateUserById(user.id, { password });
      if (error) console.warn("Could not update password:", error.message);
      else console.log("Password updated.");
    }
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      role: "admin",
      email,
      full_name: user.user_metadata?.full_name || "NextGrades Admin",
      email_verified: true,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    const { error: insertError } = await admin.from("profiles").insert({
      id: user.id,
      email,
      full_name: "NextGrades Admin",
      role: "admin",
      email_verified: true,
      is_active: true,
    });
    if (insertError) throw profileError;
  }

  const { data: profile } = await admin.from("profiles").select("id, email, role").eq("id", user.id).single();

  console.log("\nSuccess! Admin account ready:");
  console.log(JSON.stringify(profile, null, 2));
  console.log("\nSign in at /login then open /dashboard/admin");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
