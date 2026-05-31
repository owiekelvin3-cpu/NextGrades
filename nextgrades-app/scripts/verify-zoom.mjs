#!/usr/bin/env node
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
    process.env[key] = value;
  }
}

loadEnvFile();

const oauthEnv = (() => {
  const env = process.env.ZOOM_OAUTH_ENV?.trim().toLowerCase();
  if (env === "development" || env === "dev") return "development";
  if (env === "production" || env === "prod") return "production";
  return process.env.NODE_ENV === "production" ? "production" : "development";
})();

const clientId = process.env.ZOOM_CLIENT_ID;
const clientSecret = process.env.ZOOM_CLIENT_SECRET;
const redirectUri = process.env.ZOOM_REDIRECT_URI || "http://localhost:3000/api/zoom/callback";

async function refreshToken(refreshTokenValue) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshTokenValue,
    }).toString(),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text };
}

async function zoomMe(accessToken) {
  const res = await fetch("https://api.zoom.us/v2/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text };
}

async function main() {
  console.log("=== Zoom configuration ===");
  console.log("oauthEnv:", oauthEnv);
  console.log("multiUserReady:", oauthEnv === "production");
  console.log("clientId:", clientId ? `${clientId.slice(0, 6)}…` : "(missing)");
  console.log("clientSecret:", clientSecret ? "set" : "(missing)");
  console.log("redirectUri:", redirectUri);

  if (!clientId || !clientSecret) {
    console.log("\n❌ Zoom OAuth not configured in .env.local");
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.log("\n⚠ Cannot check DB — Supabase keys missing");
    process.exit(0);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: connections, error } = await admin
    .from("teacher_zoom_connections")
    .select("teacher_id, zoom_email, expires_at, scopes, connected_at, access_token, refresh_token");

  if (error) {
    console.log("\n❌ DB error:", error.message);
    process.exit(1);
  }

  console.log("\n=== Teacher connections ===");
  if (!connections?.length) {
    console.log("No teachers connected yet — click Connect Zoom in teacher settings.");
    process.exit(0);
  }

  for (const row of connections) {
    const profile = await admin.from("profiles").select("full_name, email").eq("id", row.teacher_id).maybeSingle();
    const name = profile.data?.full_name || profile.data?.email || row.teacher_id;
    console.log(`\nTeacher: ${name}`);
    console.log(`  zoomEmail: ${row.zoom_email}`);
    console.log(`  connectedAt: ${row.connected_at}`);
    console.log(`  expiresAt: ${row.expires_at}`);
    console.log(`  scopes: ${row.scopes || "(none stored)"}`);

    const expired = new Date(row.expires_at).getTime() < Date.now();
    let token = row.access_token;

    if (expired || new Date(row.expires_at).getTime() - Date.now() < 5 * 60 * 1000) {
      console.log("  token: expired or near expiry — refreshing…");
      const refreshed = await refreshToken(row.refresh_token);
      if (refreshed.ok) {
        const parsed = JSON.parse(refreshed.body);
        token = parsed.access_token;
        console.log("  refresh: OK");
      } else {
        console.log(`  refresh: FAILED (${refreshed.status})`);
        console.log(`  detail: ${refreshed.body.slice(0, 200)}`);
        console.log("  → Teacher must Disconnect + Reconnect Zoom (old token was likely issued with Development credentials).");
        continue;
      }
    } else {
      console.log("  token: valid (not expired)");
    }

    const me = await zoomMe(token);
    if (me.ok) {
      const user = JSON.parse(me.body);
      console.log(`  Zoom API /users/me: OK (${user.email})`);
    } else {
      console.log(`  Zoom API /users/me: FAILED (${me.status})`);
      console.log(`  detail: ${me.body.slice(0, 200)}`);
    }
  }

  const { count: lessonCount } = await admin
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .not("zoom_meeting_id", "is", null);

  console.log(`\n=== Meetings ===`);
  console.log(`Lessons with Zoom meetings: ${lessonCount ?? 0}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
