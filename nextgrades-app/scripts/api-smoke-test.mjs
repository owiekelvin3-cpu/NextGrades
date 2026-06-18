#!/usr/bin/env node
/**
 * Smoke-test public API routes — fails on unexpected 5xx.
 * Usage: node scripts/api-smoke-test.mjs [baseUrl]
 * Default base: NEXT_PUBLIC_APP_URL or https://www.nextgrades.at
 */

const base = (process.argv[2] || process.env.NEXT_PUBLIC_APP_URL || "https://www.nextgrades.at").replace(/\/$/, "");

const publicGets = [
  "/api/health",
  "/api/cms/faqs",
  "/api/cms/programs",
  "/api/cms/subjects",
  "/api/cms/testimonials",
  "/api/cms/team",
  "/api/cms/theme",
  "/api/cms/pricing-plans",
  "/api/cms/navigation?location=header",
  "/api/cms/marketing-resources",
  "/api/cms/overrides",
  "/api/cms/sections?page=home",
  "/api/resources/public?limit=1",
  "/api/catalog",
  "/api/consent/settings",
  "/api/notifications/push/vapid",
  "/api/auth/login/status",
];

const postChecks = [
  {
    path: "/api/contact",
    body: {},
    expect: [400],
    label: "contact validation",
  },
  {
    path: "/api/auth/check-email",
    body: { email: "smoke-test@example.com" },
    expect: [200],
    label: "check-email",
  },
  {
    path: "/api/auth/signup",
    body: { email: "bad", password: "x", fullName: "T", role: "student", confirmPassword: "x" },
    expect: [400, 403],
    label: "signup validation (400 when enabled, 403 when invite-only)",
  },
  {
    path: "/api/auth/send-otp",
    body: {},
    expect: [400],
    label: "send-otp validation",
  },
  {
    path: "/api/consent",
    body: {},
    expect: [400],
    label: "consent validation",
  },
];

const protectedGets = [
  { path: "/api/profile", expect: [401] },
  { path: "/api/admin/users", expect: [401] },
  { path: "/api/notifications", expect: [401] },
  { path: "/api/chat", expect: [401] },
  { path: "/api/teacher/resources", expect: [401] },
];

let passed = 0;
let failed = 0;

async function request(method, path, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  const text = await res.text();
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json };
}

function ok(label, detail = "") {
  passed++;
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail) {
  failed++;
  console.error(`  ✗ ${label} — ${detail}`);
}

console.log(`\n=== API smoke test: ${base} ===\n`);

for (const path of publicGets) {
  try {
    const { status } = await request("GET", path);
    if (status >= 500) fail(`GET ${path}`, `status ${status}`);
    else ok(`GET ${path}`, String(status));
  } catch (err) {
    fail(`GET ${path}`, err instanceof Error ? err.message : String(err));
  }
}

for (const check of postChecks) {
  try {
    const { status } = await request("POST", check.path, check.body);
    if (status >= 500) fail(`POST ${check.path}`, `status ${status}`);
    else if (!check.expect.includes(status)) fail(`POST ${check.path}`, `expected ${check.expect.join("|")}, got ${status}`);
    else ok(`POST ${check.path} (${check.label})`, String(status));
  } catch (err) {
    fail(`POST ${check.path}`, err instanceof Error ? err.message : String(err));
  }
}

for (const check of protectedGets) {
  try {
    const { status } = await request("GET", check.path);
    if (status >= 500) fail(`GET ${check.path}`, `status ${status}`);
    else if (!check.expect.includes(status)) fail(`GET ${check.path}`, `expected ${check.expect.join("|")}, got ${status}`);
    else ok(`GET ${check.path} (auth gate)`, String(status));
  } catch (err) {
    fail(`GET ${check.path}`, err instanceof Error ? err.message : String(err));
  }
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
