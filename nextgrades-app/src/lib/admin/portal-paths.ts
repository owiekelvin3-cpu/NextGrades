/** Dedicated admin portal routes - isolated from student/teacher dashboards. */

export const ADMIN_PORTAL_LOGIN = "/portal/login";
export const ADMIN_PORTAL_HOME = "/portal/admin";
export const ADMIN_PORTAL_PREFIX = "/portal/admin";
/** Production CMS studio (content, pricing, media, settings). */
export const ADMIN_CMS_PREFIX = `${ADMIN_PORTAL_PREFIX}/cms`;

export function isAdminPortalPath(path: string): boolean {
  return path === ADMIN_PORTAL_LOGIN || path.startsWith(ADMIN_PORTAL_PREFIX);
}

/** Map legacy `/dashboard/admin/*` URLs to the admin portal. */
export function mapLegacyAdminPath(path: string): string {
  if (path.startsWith("/dashboard/admin")) {
    return path.replace("/dashboard/admin", ADMIN_PORTAL_PREFIX);
  }
  if (path === "/admin" || path === "/admin/") {
    return ADMIN_PORTAL_HOME;
  }
  return path;
}

export function buildAdminPortalLoginUrl(redirectTo?: string | null): string {
  const params = new URLSearchParams();
  if (redirectTo?.startsWith("/portal")) params.set("redirect", redirectTo);
  const q = params.toString();
  return q ? `${ADMIN_PORTAL_LOGIN}?${q}` : ADMIN_PORTAL_LOGIN;
}
