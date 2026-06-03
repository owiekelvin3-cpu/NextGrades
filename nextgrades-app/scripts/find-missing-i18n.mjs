import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      out[key] &&
      typeof out[key] === "object" &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

const deCommon = JSON.parse(readFileSync("src/locales/de/common.json", "utf8"));
const deSite = JSON.parse(readFileSync("src/locales/de/site.json", "utf8"));
const de = deepMerge(deCommon, deSite);

function get(obj, path) {
  return path.split(".").reduce((a, k) => (a && a[k] !== undefined ? a[k] : undefined), obj);
}

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

const missing = [...keys].filter((k) => get(de, k) === undefined).sort();
console.log(`Keys used in code: ${keys.size}`);
console.log(`Missing in DE bundle: ${missing.length}`);
for (const k of missing) console.log(k);
