/** Locale subject ids (from site.json) map to DB sort_order when slug column is missing. */
export const SUBJECT_SLUG_BY_SORT_ORDER: Record<number, string> = {
  1: "math",
  2: "english",
  3: "german",
  4: "physics",
  5: "chemistry",
  6: "business",
  7: "computer-science",
  8: "technical-drawing",
};

export const SUBJECT_SORT_ORDER_BY_SLUG: Record<string, number> = Object.fromEntries(
  Object.entries(SUBJECT_SLUG_BY_SORT_ORDER).map(([order, slug]) => [slug, Number(order)])
);

export type CatalogSubjectRow = {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  icon?: string | null;
  sort_order?: number | null;
};

export function enrichSubject(row: CatalogSubjectRow) {
  const sortOrder = row.sort_order ?? null;
  const slug =
    row.slug ??
    (sortOrder != null ? SUBJECT_SLUG_BY_SORT_ORDER[sortOrder] : null) ??
    null;
  return { ...row, slug };
}

export function sortOrderForSlug(slug: string): number | null {
  return SUBJECT_SORT_ORDER_BY_SLUG[slug] ?? null;
}

export function storagePathFromLegacyUrl(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/resources\/(.+?)(?:\?|$)/);
  if (!match) return null;
  return decodeURIComponent(match[1]);
}
