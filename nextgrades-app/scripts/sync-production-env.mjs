#!/usr/bin/env node
/**
 * Push selected keys from .env.local to Vercel Production (non-interactive).
 * Does not print secret values.
 *
 * Usage: node scripts/sync-production-env.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env.local");

const ALLOWLIST = [
  "NEXT_PUBLIC_ALLOW_PUBLIC_SIGNUP",
  "AUTH_SMTP_HOST",
  "AUTH_SMTP_PORT",
  "AUTH_SMTP_USER",
  "AUTH_SMTP_PASS",
  "AUTH_SMTP_FROM",
  "REGISTRATION_SECRET",
  "AUTH_SESSION_SECRET",
  "HEALTH_OPS_TOKEN",
  "INTERNAL_OPS_TOKEN",
  "RESEND_API_KEY",
  "RESEND_SENDER_EMAIL",
  "RESEND_SENDER_NAME",
  "CONTACT_FORM_TO_EMAIL",
  "REQUIRE_EMAIL_VERIFICATION",
  "REQUIRE_SIGNUP_EMAIL_VERIFICATION",
  "REQUIRE_LOGIN_EMAIL_VERIFICATION",
  "NEXT_PUBLIC_REQUIRE_SIGNUP_EMAIL_VERIFICATION",
  "NEXT_PUBLIC_REQUIRE_LOGIN_EMAIL_VERIFICATION",
  "GROQ_API_KEY",
  "GROQ_MODEL",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_RESOURCE_MONTHLY",
  "STRIPE_PRICE_RESOURCE_YEARLY",
  "STRIPE_PRICE_GROUP_MONTHLY",
  "STRIPE_PRICE_GROUP_YEARLY",
  "STRIPE_PRICE_PREMIUM_MONTHLY",
  "STRIPE_PRICE_PREMIUM_YEARLY",
];

function parseEnvFile(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value) out[key] = value;
  }
  return out;
}

function syncKey(key, value) {
  const result = spawnSync(
    "npx",
    ["vercel", "env", "add", key, "production", "--value", value, "--yes", "--force"],
    { cwd: root, encoding: "utf8", shell: true }
  );
  if (result.status === 0) {
    console.log(`✓ ${key}`);
    return true;
  }
  const err = (result.stderr || result.stdout || "").trim();
  console.error(`✗ ${key}: ${err.split("\n")[0] || "failed"}`);
  return false;
}

const env = parseEnvFile(envPath);
if (!Object.keys(env).length) {
  console.error("No .env.local found or it is empty.");
  process.exit(1);
}

let ok = 0;
let skip = 0;
for (const key of ALLOWLIST) {
  const value = env[key];
  if (!value) {
    skip++;
    continue;
  }
  if (syncKey(key, value)) ok++;
}

console.log(`\nSynced ${ok} variable(s) to Vercel Production (${skip} skipped — not in .env.local).`);
console.log("Redeploy production for changes to take effect: npx vercel deploy --prod --yes");
