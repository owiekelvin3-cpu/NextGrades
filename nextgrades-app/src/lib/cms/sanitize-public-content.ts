/** Columns safe for unauthenticated / public CMS reads (excludes draft_json). */
export const CMS_CONTENT_PUBLIC_SELECT =
  "id, section_id, field_key, field_name, field_type, content_value, content_json, is_required, placeholder, help_text, sort_order, i18n_key, published_at, updated_at, created_at";

type CmsRow = Record<string, unknown>;

/** Strip draft fields from CMS rows returned to non-admin clients. */
export function stripCmsDraftFields<T extends CmsRow>(rows: T[]): T[] {
  return rows.map((row) => {
    const { draft_json: _draft, ...published } = row;
    return published as T;
  });
}
