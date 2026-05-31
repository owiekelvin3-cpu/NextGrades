/** Public routes used for live preview in the CMS admin. */
export const CMS_PAGE_PREVIEW_ROUTES: Record<string, string> = {
  home: "/",
  about: "/about",
  programs: "/programs",
  subjects: "/subjects",
  resources: "/resources",
  pricing: "/pricing",
  consultation: "/consultation",
  contact: "/contact",
  help: "/help",
  careers: "/careers",
  legal: "/privacy",
  global: "/",
  auth: "/login",
  misc: "/",
};

export function getPreviewUrl(pageId: string, cacheBust?: number): string {
  const base = CMS_PAGE_PREVIEW_ROUTES[pageId] ?? "/";
  if (!cacheBust) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}_cms=${cacheBust}`;
}
