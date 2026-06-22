import { createClient } from "@/lib/supabase/server";
import { createServerReadClient } from "@/lib/supabase/admin";
import type { EditLocale } from "./merge-content";

export type CmsContentMap = Record<string, string>;

/**
 * Fetch published CMS content for a page as `{section_key}` keys.
 * Example: `content.hero_heading`, `content.features_subheading`.
 */
export async function getCmsContent(page: string, locale: EditLocale = "en"): Promise<CmsContentMap> {
  const content: CmsContentMap = {};

  try {
    const supabase = await createClient();
    const db = await createServerReadClient(supabase);

    const { data: section } = await db
      .from("cms_sections")
      .select("id")
      .eq("page_name", page)
      .maybeSingle();

    if (!section?.id) return content;

    const { data: rows } = await db
      .from("cms_content")
      .select("field_key, i18n_key, field_type, content_json, content_value")
      .eq("section_id", section.id);

    for (const row of rows ?? []) {
      const key = row.i18n_key ?? row.field_key;
      if (!key) continue;

      const parts = key.split(".");
      const sectionPart = parts.length > 1 ? parts[1] : "general";
      const fieldPart = parts.length > 2 ? parts.slice(2).join("_") : parts[parts.length - 1];
      const mapKey = `${sectionPart}_${fieldPart}`;

      if (row.field_type === "image") {
        const json = row.content_json as { en?: string; de?: string } | null;
        content[mapKey] = json?.en ?? json?.de ?? row.content_value ?? "";
        continue;
      }

      const json = row.content_json as Record<string, string> | null;
      content[mapKey] = json?.[locale] ?? json?.en ?? row.content_value ?? "";
    }
  } catch {
    /* CMS optional until seeded */
  }

  return content;
}
