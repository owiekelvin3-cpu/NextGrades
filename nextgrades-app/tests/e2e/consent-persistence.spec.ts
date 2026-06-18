import { test, expect, type Page } from "@playwright/test";

const ROUTES = ["/", "/programs", "/about", "/login", "/contact", "/pricing"];

async function clearConsent(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.removeItem("nextgrades:cookie-consent");
    localStorage.removeItem("nextgrades:consent-id");
    document.cookie = "ng_consent=;path=/;max-age=0;SameSite=Lax";
    delete document.documentElement.dataset.cookieConsent;
  });
}

async function acceptCookies(page: Page) {
  const accept = page.getByRole("button", { name: /accept all|alle akzeptieren/i });
  await expect(accept).toBeVisible({ timeout: 10_000 });
  await accept.click();
  await expect(page.locator("[data-cookie-banner]")).toHaveCount(0, { timeout: 5_000 });
}

test.describe("cookie consent persistence", () => {
  test.describe.configure({ mode: "serial", timeout: 180_000 });

  test("accept → refresh → banner stays hidden", async ({ page }) => {
    await clearConsent(page);
    await acceptCookies(page);

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    await expect(page.locator("[data-cookie-banner]")).toHaveCount(0);

    const stored = await page.evaluate(() => localStorage.getItem("nextgrades:cookie-consent"));
    expect(stored).toBeTruthy();
  });

  test("accept → navigate routes → banner stays hidden", async ({ page }) => {
    await clearConsent(page);
    await acceptCookies(page);

    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);
      await expect(page.locator("[data-cookie-banner]"), `banner on ${route}`).toHaveCount(0);
    }
  });

  test("clear storage → banner reappears", async ({ page }) => {
    await page.goto("/");
    await acceptCookies(page);
    await clearConsent(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-cookie-banner]")).toHaveCount(1, { timeout: 10_000 });
  });

  test("customize modal close without save restores banner", async ({ page }) => {
    await clearConsent(page);
    const customize = page.getByRole("button", { name: /customize|anpassen/i });
    await expect(customize).toBeVisible({ timeout: 10_000 });
    await customize.click();
    await expect(page.locator("[data-cookie-banner]")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-cookie-banner]")).toHaveCount(1, { timeout: 5_000 });
  });

  test("cookie fallback restores consent when localStorage empty", async ({ page }) => {
    await clearConsent(page);
    await acceptCookies(page);

    await page.evaluate(() => {
      localStorage.removeItem("nextgrades:cookie-consent");
    });

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    await expect(page.locator("[data-cookie-banner]")).toHaveCount(0);

    const restored = await page.evaluate(() => localStorage.getItem("nextgrades:cookie-consent"));
    expect(restored).toBeTruthy();
  });
});
