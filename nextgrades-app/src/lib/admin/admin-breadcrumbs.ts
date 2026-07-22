import { ADMIN_NAV_SECTIONS } from "@/lib/admin/admin-nav";
import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";

export type AdminBreadcrumb = {
  href: string;
  labelKey: string;
};

/** Resolve breadcrumb trail from the current admin pathname. */
export function resolveAdminBreadcrumbs(pathname: string): AdminBreadcrumb[] {
  const crumbs: AdminBreadcrumb[] = [{ href: ADMIN_PORTAL_HOME, labelKey: "adminNav.dashboard" }];

  if (pathname === ADMIN_PORTAL_HOME) return crumbs;

  const navItems = ADMIN_NAV_SECTIONS.flatMap((section) => section.items);
  let best: AdminBreadcrumb | null = null;

  for (const item of navItems) {
    if (item.href === ADMIN_PORTAL_HOME) continue;
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      if (!best || item.href.length > best.href.length) {
        best = { href: item.href, labelKey: item.labelKey };
      }
    }
  }

  if (best) crumbs.push(best);
  return crumbs;
}
