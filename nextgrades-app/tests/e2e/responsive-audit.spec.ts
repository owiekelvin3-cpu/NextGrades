import { test, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const VIEWPORTS = [
  { name: "320", width: 320, height: 568 },
  { name: "375", width: 375, height: 812 },
  { name: "390", width: 390, height: 844 },
  { name: "414", width: 414, height: 896 },
  { name: "480", width: 480, height: 800 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
] as const;

const MARKETING_ROUTES = [
  { path: "/", slug: "home" },
  { path: "/programs", slug: "programs" },
  { path: "/subjects", slug: "subjects" },
  { path: "/about", slug: "about" },
  { path: "/resources", slug: "resources" },
  { path: "/pricing", slug: "pricing" },
  { path: "/contact", slug: "contact" },
  { path: "/login", slug: "login" },
  { path: "/signup", slug: "signup" },
  { path: "/signin", slug: "signin" },
  { path: "/register", slug: "register" },
  { path: "/forgot-password", slug: "forgot-password" },
  { path: "/privacy", slug: "privacy" },
  { path: "/privacy/cookies", slug: "privacy-cookies" },
  { path: "/terms", slug: "terms" },
  { path: "/help", slug: "help" },
  { path: "/consultation", slug: "consultation" },
];

const DASHBOARD_ROUTES = [
  { path: "/dashboard/student", slug: "student-dashboard" },
  { path: "/dashboard/teacher", slug: "teacher-dashboard" },
  { path: "/dashboard/admin", slug: "admin-dashboard" },
  { path: "/dashboard/student/settings", slug: "student-settings" },
  { path: "/dashboard/teacher/settings", slug: "teacher-settings" },
];

type OverflowIssue = {
  selector: string;
  scrollWidth: number;
  clientWidth: number;
  overflowPx: number;
};

type AuditIssue = {
  type: "horizontal-overflow" | "page-overflow" | "small-touch-target" | "tiny-text";
  viewport: string;
  route: string;
  slug: string;
  details: string | OverflowIssue[];
};

const REPORT_DIR = path.join(process.cwd(), "tests", "e2e", "artifacts", "responsive-audit");
const SCREENSHOT_DIR = path.join(REPORT_DIR, "screenshots");

async function preparePage(page: Page) {
  await page.addInitScript(() => {
    const consent = {
      version: "1",
      consentId: "e2e-audit-consent",
      preferences: {
        essential: true,
        analytics: false,
        marketing: false,
        functional: false,
      },
      action: "reject_non_essential",
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("nextgrades:cookie-consent", JSON.stringify(consent));
    localStorage.setItem("nextgrades:consent-id", consent.consentId);
  });
}

async function detectSmallTouchTargets(page: Page, maxWidth: number) {
  if (page.viewportSize()!.width > maxWidth) return [] as string[];

  return page.evaluate(() => {
    const small: string[] = [];
    const interactive = document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea, [role="button"]'
    );

    for (const el of interactive) {
      if (!(el instanceof HTMLElement)) continue;
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      if (parseFloat(style.opacity) === 0) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) continue;
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

      const parentLabel = el.closest("label");
      if (parentLabel instanceof HTMLElement) {
        const labelRect = parentLabel.getBoundingClientRect();
        if (Math.min(labelRect.width, labelRect.height) >= 44) continue;
      }

      const minDim = Math.min(rect.width, rect.height);
      if (minDim >= 44) continue;

      let label = el.tagName.toLowerCase();
      if (el.getAttribute("aria-label")) label += `[${el.getAttribute("aria-label")}]`;
      else if (el.textContent?.trim()) label += `: ${el.textContent.trim().slice(0, 24)}`;
      small.push(`${label} (${Math.round(rect.width)}×${Math.round(rect.height)}px)`);
    }

    return small.slice(0, 12);
  });
}

async function detectOverflow(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const pageOverflowPx = doc.scrollWidth - doc.clientWidth;
    const pageOverflow = pageOverflowPx > 1;

    const elements: OverflowIssue[] = [];
    const nodes = document.querySelectorAll("body *");

    function hasClippingAncestor(node: Element): boolean {
      let parent = node.parentElement;
      while (parent && parent !== document.body) {
        const ps = getComputedStyle(parent);
        const ox = ps.overflowX;
        if (ox === "hidden" || ox === "clip") {
          return true;
        }
        parent = parent.parentElement;
      }
      return false;
    }

    for (const el of nodes) {
      if (!(el instanceof HTMLElement)) continue;
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      if (parseFloat(style.opacity) === 0) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) continue;

      const overflowPx = el.scrollWidth - el.clientWidth;
      if (overflowPx <= 2) continue;

      if (hasClippingAncestor(el)) continue;

      const overflowX = style.overflowX;
      const allowsScroll =
        overflowX === "auto" ||
        overflowX === "scroll" ||
        overflowX === "overlay" ||
        el.classList.contains("overflow-x-auto") ||
        el.classList.contains("snap-carousel") ||
        el.classList.contains("responsive-table-wrap") ||
        el.classList.contains("scrollbar-none");

      if (allowsScroll) continue;

      let selector = el.tagName.toLowerCase();
      if (el.id) selector += `#${el.id}`;
      else if (el.className && typeof el.className === "string") {
        const cls = el.className.trim().split(/\s+/).slice(0, 2).join(".");
        if (cls) selector += `.${cls}`;
      }

      elements.push({
        selector,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        overflowPx,
      });
    }

    elements.sort((a, b) => b.overflowPx - a.overflowPx);
    return { pageOverflow, pageOverflowPx, elements: elements.slice(0, 8) };
  });
}

async function blockHeavyAssets(page: Page) {
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (
      url.includes("images.unsplash.com") ||
      url.includes("/_next/image") ||
      /\.(mp4|webm|woff2?)(\?|$)/i.test(url)
    ) {
      return route.abort();
    }
    return route.continue();
  });
}

async function scanRoutes(page: Page, routes: typeof MARKETING_ROUTES, issues: AuditIssue[]) {
  for (const route of routes) {
    for (const vp of VIEWPORTS) {
      await preparePage(page);
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const response = await page.goto(route.path, {
        waitUntil: "domcontentloaded",
        timeout: 45_000,
      });

      await page.waitForTimeout(200);

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${route.slug}__${vp.name}.png`),
        fullPage: true,
      });

      const overflow = await detectOverflow(page);

      if (overflow.pageOverflow) {
        issues.push({
          type: "page-overflow",
          viewport: vp.name,
          route: route.path,
          slug: route.slug,
          details: `Document scrollWidth exceeds viewport by ${overflow.pageOverflowPx}px`,
        });
      }

      if (overflow.elements.length > 0) {
        issues.push({
          type: "horizontal-overflow",
          viewport: vp.name,
          route: route.path,
          slug: route.slug,
          details: overflow.elements,
        });
      }

      const smallTargets = await detectSmallTouchTargets(page, 480);
      if (smallTargets.length > 0) {
        issues.push({
          type: "small-touch-target",
          viewport: vp.name,
          route: route.path,
          slug: route.slug,
          details: smallTargets.join("; "),
        });
      }

      if (response && response.status() >= 500) {
        issues.push({
          type: "page-overflow",
          viewport: vp.name,
          route: route.path,
          slug: route.slug,
          details: `HTTP ${response.status()}`,
        });
      }
    }
  }
}

function writeReport(issues: AuditIssue[]) {
  const reportPath = path.join(REPORT_DIR, "report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        issueCount: issues.length,
        issues,
      },
      null,
      2
    )
  );
  return reportPath;
}

test.describe("responsive audit", () => {
  test.describe.configure({ mode: "serial", timeout: 600_000 });

  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test("marketing pages", async ({ page }) => {
    await blockHeavyAssets(page);
    const issues: AuditIssue[] = [];
    await scanRoutes(page, MARKETING_ROUTES, issues);
    const reportPath = writeReport(issues);
    console.log(`Marketing scan: ${issues.length} issues → ${reportPath}`);
    const critical = issues.filter(
      (i) =>
        i.type === "page-overflow" ||
        i.type === "horizontal-overflow" ||
        i.type === "small-touch-target"
    );
    expect(critical).toEqual([]);
  });

  test("dashboard pages", async ({ page }) => {
    await blockHeavyAssets(page);
    const issues: AuditIssue[] = [];
    await scanRoutes(page, DASHBOARD_ROUTES, issues);
    const priorPath = path.join(REPORT_DIR, "report.json");
    let prior: AuditIssue[] = [];
    if (fs.existsSync(priorPath)) {
      prior = JSON.parse(fs.readFileSync(priorPath, "utf8")).issues ?? [];
    }
    const merged = [...prior, ...issues];
    const reportPath = writeReport(merged);
    console.log(`Dashboard scan: ${issues.length} issues → ${reportPath}`);
    const critical = merged.filter(
      (i) => i.type === "page-overflow" || i.type === "horizontal-overflow"
    );
    expect(critical).toEqual([]);
  });
});
