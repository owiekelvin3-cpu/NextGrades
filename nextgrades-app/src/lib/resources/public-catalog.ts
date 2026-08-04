/** Escape user input for PostgREST ilike patterns. */
export function escapeIlikePattern(raw: string): string {
  return raw.replace(/[\\%_]/g, "\\$&");
}

/** Build a PostgREST `.or()` filter for full-text-ish search on material fields. */
export function buildMaterialTextSearchOr(search: string): string | null {
  const trimmed = search.trim();
  if (!trimmed) return null;
  const pattern = `%${escapeIlikePattern(trimmed)}%`;
  return [
    `title.ilike.${pattern}`,
    `short_description.ilike.${pattern}`,
    `full_description.ilike.${pattern}`,
    `description.ilike.${pattern}`,
    `file_name.ilike.${pattern}`,
  ].join(",");
}

type TagRelation = {
  resource_tags?: { name?: string | null; slug?: string | null } | { name?: string | null; slug?: string | null }[] | null;
};

type SearchableMaterial = {
  title?: string | null;
  description?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  file_name?: string | null;
  category?: { name?: string | null } | null;
  subject?: { name?: string | null } | null;
  class?: { name?: string | null } | null;
  resource_tag_relations?: TagRelation[] | null;
};

function tagNames(relations: TagRelation[] | null | undefined): string[] {
  if (!relations?.length) return [];
  const names: string[] = [];
  for (const rel of relations) {
    const tags = rel.resource_tags;
    if (!tags) continue;
    const list = Array.isArray(tags) ? tags : [tags];
    for (const tag of list) {
      if (tag?.name) names.push(tag.name);
      if (tag?.slug) names.push(tag.slug.replace(/-/g, " "));
    }
  }
  return names;
}

/** Client-side match for tags/category/subject names (fields not in ilike OR). */
export function materialMatchesExtendedSearch(item: SearchableMaterial, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    item.title,
    item.description,
    item.short_description,
    item.full_description,
    item.file_name,
    item.category?.name,
    item.subject?.name,
    item.class?.name,
    ...tagNames(item.resource_tag_relations),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}
