import { test, expect, type Page } from "@playwright/test";

const ROUTES = [
  "/",
  "/programs",
  "/about",
  "/pricing",
  "/contact",
  "/login",
  "/signup",
  "/resources",
  "/privacy",
  "/terms",
  "/dashboard/student",
  "/dashboard/teacher",
];

async function preparePage(page: Page) {
  await page.addInitScript(() => {
    const consent = {
      version: "1",
      consentId: "e2e-console-audit",
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

test.describe("production console audit", () => {
  test.describe.configure({ mode: "serial", timeout: 300_000 });

  for (const route of ROUTES) {
    test(`no console errors on ${route}`, async ({ page }) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      page.on("console", (msg) => {
        const text = msg.text();
        if (msg.type() === "error") errors.push(text);
        if (msg.type() === "warning") warnings.push(text);
      });

      page.on("pageerror", (err) => {
        errors.push(err.message);
      });

      await preparePage(page);
      await page.setViewportSize({ width: 390, height: 844 });
      const response = await page.goto(route, {
        waitUntil: "networkidle",
        timeout: 60_000,
      });

      expect(response?.status() ?? 0).toBeLessThan(500);
      await page.waitForTimeout(500);

      expect(errors, `Console errors on ${route}`).toEqual([]);
      expect(warnings, `Console warnings on ${route}`).toEqual([]);
    });
  }
});
