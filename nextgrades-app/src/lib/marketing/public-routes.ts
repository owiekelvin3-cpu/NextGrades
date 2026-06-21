/** Public marketing pages use German-only UI per owner change list (G-06). */
export function isPublicMarketingPath(pathname: string): boolean {
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/admin")
  ) {
    return false;
  }
  return true;
}
