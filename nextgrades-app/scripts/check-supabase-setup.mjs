#!/usr/bin/env node
/**
 * Verify Supabase schema for teacher CMS + publishing.
 * Usage: node scripts/check-supabase-setup.mjs
 */
import fs from "fs";
import path from "path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");

function loadEnv() {
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      })
  );
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon) {
  console.log(JSON.stringify({ ok: false, error: "Missing NEXT_PUBLIC_SUPABASE_URL or anon key in .env.local" }, null, 2));
  process.exit(1);
}

const hasServiceRole = Boolean(service && !service.includes("your_") && service.length > 20);
const key = hasServiceRole ? service : anon;

async function restQuery(path) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, Accept: "application/json" },
  });
  const text = await res.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* keep text */
  }
  return { status: res.status, ok: res.ok, body };
}

async function rest(table, select = "id") {
  return restQuery(`${table}?select=${encodeURIComponent(select)}&limit=1`);
}

async function bucketExists(name) {
  const res = await fetch(`${url}/storage/v1/object/list/${name}`, {
    method: "POST",
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: "", limit: 1 }),
  });
  return res.status === 200;
}

const materialColumns = [
  "status",
  "access_type",
  "category_id",
  "moderation_status",
  "content_type",
  "short_description",
  "difficulty_level",
  "age_range",
  "language",
  "storage_path",
];

const tables = [
  "profiles",
  "materials",
  "resource_categories",
  "resource_tags",
  "resource_analytics",
  "resource_folders",
  "resource_files",
];

const results = { project: url, hasServiceRole, tables: {}, materialColumns: {}, buckets: null, categories: null, tags: null };

for (const t of tables) {
  results.tables[t] = await rest(t);
}

for (const col of materialColumns) {
  results.materialColumns[col] = await rest("materials", col);
}

results.categories = await rest("resource_categories", "name");
results.tags = await rest("resource_tags", "name,slug");
const resourcesBucket = await bucketExists("resources");
const thumbnailsBucket = await bucketExists("resource-thumbnails");

const published = await restQuery(
  "materials?select=id,title,status,moderation_status&status=eq.published&limit=10"
);

const tableOk = (name) => results.tables[name]?.ok === true;
const colOk = (name) => results.materialColumns[name]?.ok === true;
const bucketIds = [];

const summary = {
  ok: tableOk("materials") && tableOk("resource_categories") && colOk("content_type") && resourcesBucket && thumbnailsBucket,
  apiReachable: results.tables.profiles?.status !== 0,
  cmsTables: {
    materials: tableOk("materials"),
    resource_categories: tableOk("resource_categories"),
    resource_tags: tableOk("resource_tags"),
    resource_analytics: tableOk("resource_analytics"),
    resource_folders: tableOk("resource_folders"),
    resource_files: tableOk("resource_files"),
  },
  publishingColumns: {
    content_type: colOk("content_type"),
    short_description: colOk("short_description"),
    difficulty_level: colOk("difficulty_level"),
    age_range: colOk("age_range"),
    language: colOk("language"),
    storage_path: colOk("storage_path"),
    moderation_status: colOk("moderation_status"),
  },
  seedData: {
    categoriesLoaded: Array.isArray(results.categories.body) && results.categories.body.length > 0,
    tagsLoaded: Array.isArray(results.tags.body) && results.tags.body.length > 0,
    categoryCount: Array.isArray(results.categories.body) ? results.categories.body.length : 0,
    tagCount: Array.isArray(results.tags.body) ? results.tags.body.length : 0,
  },
  storage: {
    resourcesBucket,
    thumbnailsBucket,
  },
  publishedResources: Array.isArray(published.body) ? published.body.length : 0,
  env: {
    hasServiceRole,
    hasAnonKey: Boolean(anon),
  },
  migrationsNeeded: [],
};

if (!summary.cmsTables.resource_categories) summary.migrationsNeeded.push("TEACHER_CMS.sql (00003)");
if (!summary.publishingColumns.content_type) summary.migrationsNeeded.push("TEACHER_PUBLISHING.sql (00016)");
if (!summary.storage.resourcesBucket) summary.migrationsNeeded.push("CREATE_STORAGE_BUCKETS.sql — resources bucket");
if (!summary.storage.thumbnailsBucket) summary.migrationsNeeded.push("CREATE_STORAGE_BUCKETS.sql — resource-thumbnails bucket");
if (!hasServiceRole) summary.migrationsNeeded.push("Add SUPABASE_SERVICE_ROLE_KEY to .env.local (admin bootstrap)");

console.log(JSON.stringify({ summary, details: results }, null, 2));
process.exit(summary.ok ? 0 : 1);
