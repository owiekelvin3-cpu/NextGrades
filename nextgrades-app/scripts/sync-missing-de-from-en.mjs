import { readFileSync, writeFileSync } from "fs";

const enCommon = JSON.parse(readFileSync("src/locales/en/common.json", "utf8"));
const enSite = JSON.parse(readFileSync("src/locales/en/site.json", "utf8"));
const deCommon = JSON.parse(readFileSync("src/locales/de/common.json", "utf8"));
const deSite = JSON.parse(readFileSync("src/locales/de/site.json", "utf8"));

const en = { ...enCommon, ...enSite };
const de = { ...deCommon, ...deSite };

function get(obj, path) {
  return path.split(".").reduce((a, k) => (a && a[k] !== undefined ? a[k] : undefined), obj);
}

function setNested(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur[k] || typeof cur[k] !== "object" || Array.isArray(cur[k])) cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function keyInCommon(path) {
  const root = path.split(".")[0];
  return root in enCommon;
}

// Import missing keys list from find script logic
import { readdirSync, statSync } from "fs";
import { join } from "path";

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (!name.includes("node_modules") && name !== ".next") walk(p, files);
    } else if (/\.(tsx|ts)$/.test(name)) files.push(p);
  }
  return files;
}

const keyRe = /\bt\s*\(\s*["'`]([^"'`]+)["'`]/g;
const keys = new Set();
for (const file of walk("src")) {
  const src = readFileSync(file, "utf8");
  let m;
  while ((m = keyRe.exec(src))) keys.add(m[1]);
}

const missing = [...keys].filter((k) => !k.includes("${") && get(de, k) === undefined);

let added = 0;
for (const path of missing) {
  const val = get(en, path);
  if (val === undefined) continue;
  if (keyInCommon(path)) setNested(deCommon, path, val);
  else setNested(deSite, path, val);
  added++;
}

writeFileSync("src/locales/de/common.json", JSON.stringify(deCommon, null, 2) + "\n");
writeFileSync("src/locales/de/site.json", JSON.stringify(deSite, null, 2) + "\n");
console.log(`Synced ${added} keys from EN (German translation pass still required).`);
