/** Routes that use the public marketing shell (navbar, footer, CMS pages). */
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
