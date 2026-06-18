/** Official NextGrades brand assets in /public */

import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";

export const BRAND_LOGO = {
  /** Dark mode / navy backgrounds — `when website on dark mode.png` */
  dark: "/logo-dark.png",
  /** Light mode / white backgrounds — `when website on light mode.png` */
  light: "/logo-light.png",
  icon192: "/icon-192.png",
  icon512: "/icon-512.png",
  appleTouch: "/apple-touch-icon.png",
  favicon: "/favicon.png",
} as const;

export function brandLogoForSurface(theme: "light" | "dark", onDarkBackground = false): string {
  return theme === "dark" || onDarkBackground ? BRAND_LOGO.dark : BRAND_LOGO.light;
}

export function brandLogoUrl(appUrl: string, theme: "light" | "dark" = "light"): string {
  const base = appUrl.replace(/\/$/, "");
  return `${base}${theme === "dark" ? BRAND_LOGO.dark : BRAND_LOGO.light}`;
}

export function dashboardHomeForRole(role: "student" | "teacher" | "admin"): string {
  if (role === "admin") return ADMIN_PORTAL_HOME;
  return `/dashboard/${role}`;
}
