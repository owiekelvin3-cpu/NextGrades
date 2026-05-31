#!/usr/bin/env node
/**
 * Pre-deployment checklist — run before buying domain / going live.
 * Usage: node scripts/pre-deploy-check.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

const env = { ...process.env, ...loadEnv() };
const errors = [];
const warnings = [];

function req(name, label) {
  const v = env[name]?.trim();
  if (!v || v.startsWith("your-") || v === "re_xxxxxxxx") {
    errors.push(`${label}: set ${name}`);
    return false;
  }
  return true;
}

function warn(name, label) {
  const v = env[name]?.trim();
  if (!v) warnings.push(`${label}: ${name} not set (optional but recommended)`);
}

console.log("\n=== NextGrades Pre-Deploy Check ===\n");

// Required
req("NEXT_PUBLIC_SUPABASE_URL", "Supabase URL");
req("NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase anon key");
req("SUPABASE_SERVICE_ROLE_KEY", "Supabase service role key");

const appUrl = env.NEXT_PUBLIC_APP_URL?.trim() || "";
if (!appUrl) {
  errors.push("Set NEXT_PUBLIC_APP_URL to your live domain (https://yourdomain.de)");
} else if (!appUrl.startsWith("https://") || appUrl.includes("localhost")) {
  errors.push(`NEXT_PUBLIC_APP_URL must be HTTPS production URL (current: ${appUrl})`);
}

// Email (required for signup in production)
req("RESEND_API_KEY", "Resend API key");
if (env.RESEND_SENDER_EMAIL?.includes("resend.dev")) {
  warnings.push("RESEND_SENDER_EMAIL uses resend.dev — verify your own domain before launch");
}
req("CONTACT_FORM_TO_EMAIL", "Contact form recipient");

// Auth
if (env.REQUIRE_EMAIL_VERIFICATION === "false") {
  warnings.push("REQUIRE_EMAIL_VERIFICATION=false — verification disabled (not recommended for production)");
}
if (env.ALLOW_ADMIN_BOOTSTRAP === "true") {
  warnings.push("ALLOW_ADMIN_BOOTSTRAP=true — disable after creating admin account");
}
if (env.ADMIN_BOOTSTRAP_EMAIL) {
  warnings.push("Remove ADMIN_BOOTSTRAP_EMAIL from production env after admin setup");
}

// Payments
warn("STRIPE_SECRET_KEY", "Stripe live payments");
warn("STRIPE_WEBHOOK_SECRET", "Stripe webhooks");
warn("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "Stripe checkout");

// AI
if (!env.GROQ_API_KEY && !env.OPENROUTER_API_KEY && !env.TOGETHER_API_KEY) {
  warnings.push("No AI API key — student/teacher chat will not work");
}

// Build artifacts
if (!existsSync(resolve(root, "node_modules"))) {
  errors.push("Run npm install first");
}

// SQL migrations reminder
if (!existsSync(resolve(root, "supabase/FIX_ADMIN_DELETE_USER.sql"))) {
  warnings.push("FIX_ADMIN_DELETE_USER.sql missing");
}

console.log("Manual steps before go-live:");
console.log("  1. Supabase → Authentication → URL Configuration:");
console.log("     Site URL = your NEXT_PUBLIC_APP_URL");
console.log("     Redirect URLs include: https://yourdomain.de/auth/callback");
console.log("  2. Run supabase/FIX_ADMIN_DELETE_USER.sql in Supabase SQL Editor");
console.log("  3. Apply all migrations in supabase/migrations/");
console.log("  4. Resend: verify sending domain, update RESEND_SENDER_EMAIL");
console.log("  5. Stripe: live keys + webhook pointing to /api/stripe/webhook");
console.log("  6. Zoom (optional): update ZOOM_REDIRECT_URI to production callback\n");

if (warnings.length) {
  console.log("WARNINGS:");
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  console.log("");
}

if (errors.length) {
  console.log("BLOCKERS (fix before deploy):");
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.log("");
  process.exit(1);
}

console.log("✓ No blocking issues found in environment configuration.");
console.log("  Run: npm run test && npm run build\n");
process.exit(0);
