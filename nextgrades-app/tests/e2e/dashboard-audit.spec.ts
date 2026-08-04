import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://www.nextgrades.at";

const STUDENT_ROUTES = [
  "/dashboard/student",
  "/dashboard/student/appointments",
  "/dashboard/student/courses",
  "/dashboard/student/live-classes",
  "/dashboard/student/progress",
  "/dashboard/student/quizzes",
  "/dashboard/student/resources",
  "/dashboard/student/settings",
];

const TEACHER_ROUTES = [
  "/dashboard/teacher",
  "/dashboard/teacher/ai-generator",
  "/dashboard/teacher/analytics",
  "/dashboard/teacher/content",
  "/dashboard/teacher/earnings",
  "/dashboard/teacher/payments",
  "/dashboard/teacher/resources",
  "/dashboard/teacher/schedule",
  "/dashboard/teacher/settings",
  "/dashboard/teacher/students",
  "/dashboard/teacher/upload",
];

const SHARED_ROUTES = ["/dashboard/chat", "/dashboard/notifications"];

const ADMIN_PORTAL_ROUTES = [
  "/portal/admin",
  "/portal/admin/analytics",
  "/portal/admin/chatbot",
  "/portal/admin/memberships",
  "/portal/admin/moderation",
  "/portal/admin/notifications",
  "/portal/admin/payments",
  "/portal/admin/quiz-monitor",
  "/portal/admin/resources",
  "/portal/admin/resources/upload",
  "/portal/admin/security",
  "/portal/admin/students",
  "/portal/admin/teachers",
  "/portal/admin/users",
  "/portal/admin/zoom",
  "/portal/admin/guest-signups",
  "/portal/admin/cookies",
  "/portal/admin/cms",
  "/portal/login",
];

const ALL_ROUTES = [
  ...STUDENT_ROUTES.map((path) => ({ path, group: "student" })),
  ...TEACHER_ROUTES.map((path) => ({ path, group: "teacher" })),
  ...SHARED_ROUTES.map((path) => ({ path, group: "shared" })),
  ...ADMIN_PORTAL_ROUTES.map((path) => ({ path, group: "admin" })),
];

async function preparePage(page: Page) {
  await page.addInitScript(() => {
    const consent = {
      version: "1",
      consentId: "e2e-dashboard-audit",
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

test.describe("dashboard audit", () => {
  test.describe.configure({ mode: "serial", timeout: 600_000 });

  for (const { path, group } of ALL_ROUTES) {
    test(`[${group}] ${path} loads without errors`, async ({ page }) => {
      const errors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(err.message));

      await preparePage(page);
      await page.setViewportSize({ width: 1280, height: 800 });

      const response = await page.goto(path, {
        waitUntil: "networkidle",
        timeout: 60_000,
      });

      const status = response?.status() ?? 0;
      expect(status, `HTTP ${status} on ${path}`).toBeLessThan(500);

      await page.waitForTimeout(400);

      const finalUrl = page.url();
      const isAuthGate =
        finalUrl.includes("/login") ||
        finalUrl.includes("/signin") ||
        finalUrl.includes("/portal/login") ||
        finalUrl.includes("/verify");

      expect(errors, `Console errors on ${path} → ${finalUrl}`).toEqual([]);
      expect(isAuthGate || finalUrl.includes(path.split("?")[0]), `${path} should render or redirect to auth`).toBeTruthy();
    });
  }
});
