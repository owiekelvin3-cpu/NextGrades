/** Official NextGrades brand assets in /public */

import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";

export const BRAND_LOGO = {
  /** Gold mark on dark — navbar/footer in dark theme, navy marketing sections */
  dark: "/logo-dark.png",
  /** Mark for light backgrounds — navbar/footer in light theme */
  light: "/logo-light.png",
  icon192: "/icon-192.png",
  icon512: "/icon-512.png",
  appleTouch: "/apple-touch-icon.png",
  favicon: "/favicon.png",
} as const;

export function brandLogoForSurface(theme: "light" | "dark", onDarkBackground = false): string {
  return theme === "dark" || onDarkBackground ? BRAND_LOGO.dark : BRAND_LOGO.light;
}

/** Opposite logo for hover preview (light ↔ dark). */
export function brandLogoHoverForSurface(theme: "light" | "dark", onDarkBackground = false): string {
  const isDarkSurface = theme === "dark" || onDarkBackground;
  return isDarkSurface ? BRAND_LOGO.light : BRAND_LOGO.dark;
}

export function brandLogoUrl(appUrl: string, theme: "light" | "dark" = "light"): string {
  const base = appUrl.replace(/\/$/, "");
  return `${base}${theme === "dark" ? BRAND_LOGO.dark : BRAND_LOGO.light}`;
}

export function dashboardHomeForRole(role: "student" | "teacher" | "admin"): string {
  if (role === "admin") return ADMIN_PORTAL_HOME;
  return `/dashboard/${role}`;
}
