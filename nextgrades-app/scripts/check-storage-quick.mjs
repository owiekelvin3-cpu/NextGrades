import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sr = env.SUPABASE_SERVICE_ROLE_KEY;
const hasSr = sr && !sr.includes("your_");
const key = hasSr ? sr : anon;

console.log("key:", hasSr ? "service_role" : "anon");

for (const b of ["resources", "resource-thumbnails"]) {
  const meta = await fetch(`${url}/storage/v1/bucket/${b}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const list = await fetch(`${url}/storage/v1/object/list/${b}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: "", limit: 5 }),
  });
  console.log(`\n${b}:`);
  console.log("  metadata:", meta.status, await meta.text());
  console.log("  list:", list.status, await list.text());
}

const pub = await fetch(
  `${url}/rest/v1/materials?select=id,title,status,moderation_status,thumbnail_url,url&status=eq.published&order=created_at.desc&limit=5`,
  { headers: { apikey: anon, Authorization: `Bearer ${anon}` } }
);
console.log("\npublished (anon):", pub.status, await pub.text());

if (hasSr) {
  const all = await fetch(
    `${url}/rest/v1/materials?select=id,title,status,moderation_status&order=created_at.desc&limit=10`,
    { headers: { apikey: sr, Authorization: `Bearer ${sr}` } }
  );
  console.log("\nall materials (service):", all.status, await all.text());
}
