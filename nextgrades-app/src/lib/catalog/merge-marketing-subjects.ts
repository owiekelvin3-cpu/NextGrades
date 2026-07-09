import { normalizeResourcesSubjectKey } from "@/lib/resources/images";

export type CatalogSubjectLike = {
  id: string;
  name: string;
  slug?: string | null;
};

export type MarketingSubjectItem = {
  id: string;
  title: string;
};

function subjectSlug(subject: CatalogSubjectLike): string {
  return normalizeResourcesSubjectKey(subject.slug || subject.id) || subject.slug || subject.id;
}

/** Subjects page order + titles, enriched with catalog rows when present. */
export function mergeMarketingSubjectsWithCatalog(
  marketingItems: MarketingSubjectItem[],
  catalogSubjects: CatalogSubjectLike[]
): CatalogSubjectLike[] {
  const catalogBySlug = new Map<string, CatalogSubjectLike>();
  for (const row of catalogSubjects) {
    catalogBySlug.set(subjectSlug(row), row);
  }

  const merged: CatalogSubjectLike[] = [];
  const seen = new Set<string>();

  for (const item of marketingItems) {
    const slug = normalizeResourcesSubjectKey(item.id) || item.id;
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);

    const existing = catalogBySlug.get(slug);
    merged.push(
      existing
        ? { ...existing, name: item.title || existing.name, slug: existing.slug || slug }
        : { id: slug, name: item.title, slug }
    );
  }

  for (const row of catalogSubjects) {
    const slug = subjectSlug(row);
    if (seen.has(slug)) continue;
    if (slug === "business" && seen.has("business-admin")) continue;
    seen.add(slug);
    merged.push({ ...row, slug: row.slug || slug });
  }

  return merged;
}
