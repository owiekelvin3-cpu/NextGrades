import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.log(JSON.stringify({ ok: false, error: "Missing .env.local" }));
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      const key = line.slice(0, i);
      let val = line.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      return [key, val];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon) {
  console.log(JSON.stringify({ ok: false, error: "Missing Supabase URL or anon key" }));
  process.exit(1);
}

const useService = service && service !== "your-service-role-key";
const key = useService ? service : anon;

const listRes = await fetch(`${url}/storage/v1/bucket`, {
  headers: { Authorization: `Bearer ${key}`, apikey: key },
});
const listText = await listRes.text();
let allBuckets = null;
try {
  allBuckets = JSON.parse(listText);
} catch {
  allBuckets = listText;
}

const bucketRes = await fetch(`${url}/storage/v1/bucket/avatars`, {
  headers: { Authorization: `Bearer ${key}`, apikey: key },
});

const bucketText = await bucketRes.text();
let bucket = null;
try {
  bucket = JSON.parse(bucketText);
} catch {
  bucket = bucketText;
}

const listObjectsRes = await fetch(`${url}/storage/v1/object/list/avatars`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    apikey: key,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ prefix: "", limit: 1 }),
});

const avatarsInList = Array.isArray(allBuckets)
  ? allBuckets.some((b) => b.id === "avatars" || b.name === "avatars")
  : false;

const result = {
  ok: bucketRes.ok || listObjectsRes.ok || avatarsInList,
  bucketExists: bucketRes.status === 200 || avatarsInList,
  listBucketsStatus: listRes.status,
  avatarsInList,
  getBucketStatus: bucketRes.status,
  listObjectsStatus: listObjectsRes.status,
  keyType: useService ? "service_role" : "anon",
  allBucketIds: Array.isArray(allBuckets) ? allBuckets.map((b) => b.id) : allBuckets,
  bucket,
  listObjects: listObjectsRes.ok ? await listObjectsRes.json().catch(() => null) : await listObjectsRes.text(),
};

if (bucketRes.ok || avatarsInList || listObjectsRes.ok) {
  const profileRes = await fetch(`${url}/rest/v1/profiles?select=bio,timezone,phone&limit=1`, {
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      Accept: "application/json",
    },
  });
  result.profileColumnsOk = profileRes.ok;
  if (!profileRes.ok) {
    result.profileColumnsError = await profileRes.text();
  }
}

if (!result.bucketExists && !avatarsInList) {
  result.hint =
    "SQL may have run on a different Supabase project. Confirm dashboard URL contains pzavnfdhctsrhzesdvfd, then check Storage → Buckets for 'avatars'.";
}

console.log(JSON.stringify(result, null, 2));
