#!/usr/bin/env node
/**
 * Local speed audit — Lighthouse scores for key marketing routes.
 * Usage: node scripts/speed-audit.mjs
 */
import { spawn } from "child_process";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const PORT = 3099;
const BASE = `http://localhost:${PORT}`;

const ROUTES = ["/", "/about", "/programs", "/pricing", "/resources", "/contact"];

const THRESHOLDS = {
  performance: 75,
  accessibility: 90,
  "best-practices": 90,
  seo: 90,
};

function run(cmd, args, opts = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: true, ...opts });
    child.on("close", (code) => (code === 0 ? resolvePromise() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function waitForServer(ms = 60000) {
  const start = Date.now();
  return new Promise(async (resolvePromise, reject) => {
    while (Date.now() - start < ms) {
      try {
        const res = await fetch(`${BASE}/`);
        if (res.ok) return resolvePromise();
      } catch {
        // retry
      }
      await new Promise((r) => setTimeout(r, 800));
    }
    reject(new Error("Server did not start in time"));
  });
}

async function auditRoute(route, attempt = 1) {
  const url = `${BASE}${route}`;
  const out = resolve(root, `.speed-audit${route.replace(/\//g, "-") || "-home"}.json`);

  try {
    await run("npx", [
      "lighthouse",
      url,
      "--quiet",
      "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
      `--output=json`,
      `--output-path=${out}`,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--preset=desktop",
    ]);
  } catch (err) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 2000));
      return auditRoute(route, attempt + 1);
    }
    throw err;
  }

  const report = JSON.parse(await import("fs").then((fs) => fs.readFileSync(out, "utf8")));
  const scores = {};
  for (const [cat, data] of Object.entries(report.categories)) {
    scores[cat] = Math.round((data.score ?? 0) * 100);
  }
  return {
    route,
    scores,
    lcp: report.audits["largest-contentful-paint"]?.displayValue,
    tbt: report.audits["total-blocking-time"]?.displayValue,
  };
}

async function main() {
  if (!existsSync(resolve(root, ".next"))) {
    console.log("Building production bundle…");
    await run("npm", ["run", "build"], { cwd: root });
  }

  console.log(`Starting server on port ${PORT}…`);
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: root,
    stdio: "ignore",
    shell: true,
  });

  try {
    await waitForServer();
    console.log("\n=== NextGrades Speed Audit ===\n");

    const results = [];
    for (const route of ROUTES) {
      process.stdout.write(`Auditing ${route}… `);
      const result = await auditRoute(route);
      results.push(result);
      console.log(`Perf ${result.scores.performance} | LCP ${result.lcp ?? "—"} | TBT ${result.tbt ?? "—"}`);
      await new Promise((r) => setTimeout(r, 1500));
    }

    console.log("\n--- Summary ---");
    let failed = false;
    for (const { route, scores } of results) {
      const line = Object.entries(scores)
        .map(([k, v]) => `${k}: ${v}`)
        .join("  ");
      console.log(`${route.padEnd(12)} ${line}`);
      for (const [cat, min] of Object.entries(THRESHOLDS)) {
        if ((scores[cat] ?? 0) < min) {
          console.log(`  ✗ ${route} ${cat} below ${min} (${scores[cat]})`);
          failed = true;
        }
      }
    }

    if (failed) {
      console.log("\nSome scores are below target — review Lighthouse reports in .speed-audit*.json\n");
      process.exitCode = 1;
    } else {
      console.log("\n✓ All audited routes meet speed targets.\n");
    }
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
