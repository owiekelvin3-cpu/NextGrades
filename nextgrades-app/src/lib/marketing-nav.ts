/** Public marketing routes that show mobile bottom navigation (not app/dashboard). */
export function isMarketingRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  const excludedPrefixes = [
    "/dashboard",
    "/portal",
    "/login",
    "/signup",
    "/signin",
    "/register",
    "/reset-password",
    "/admin-access",
    "/checkout",
    "/forgot-password",
    "/verify",
    "/choose-role",
  ];
  return !excludedPrefixes.some((p) => pathname.startsWith(p));
}

export const MARKETING_OPEN_MENU_EVENT = "nextgrades:marketing-open-menu";

export function openMarketingMenu(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MARKETING_OPEN_MENU_EVENT));
  }
}
