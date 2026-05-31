import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = join(__dirname, "../src/locales");
const enCommonPath = join(localesDir, "en/common.json");
const enSitePath = join(localesDir, "en/site.json");
const deCommonPath = join(localesDir, "de/common.json");
const deSitePath = join(localesDir, "de/site.json");

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], source[key]);
    } else if (target[key] === undefined) {
      target[key] = source[key];
    }
  }
  return target;
}

const enCommon = JSON.parse(readFileSync(enCommonPath, "utf8"));
const enSite = JSON.parse(readFileSync(enSitePath, "utf8"));

for (const { commonPath, sitePath, label } of [
  { commonPath: deCommonPath, sitePath: deSitePath, label: "de" },
]) {
  const currentCommon = JSON.parse(readFileSync(commonPath, "utf8"));
  const mergedCommon = deepMerge({ ...currentCommon }, enCommon);
  writeFileSync(commonPath, JSON.stringify(mergedCommon, null, 2) + "\n", "utf8");

  let currentSite = {};
  if (existsSync(sitePath)) {
    currentSite = JSON.parse(readFileSync(sitePath, "utf8"));
  }
  const mergedSite = deepMerge({ ...currentSite }, enSite);
  writeFileSync(sitePath, JSON.stringify(mergedSite, null, 2) + "\n", "utf8");

  console.log(`Synced ${label} (common + site) — new keys copied from English; review German translations.`);
}
