import enCommon from "@/locales/en/common.json";
import enSite from "@/locales/en/site.json";
import deCommon from "@/locales/de/common.json";
import deSite from "@/locales/de/site.json";
import { CMS_PAGE_GROUPS } from "./constants";
import { flattenLocale, mergeLocale } from "./flatten";
import type { FlatLocaleEntry } from "./flatten";
import { buildMarketingImageEntries } from "./marketing-images-registry";

export function buildSeedEntries(): FlatLocaleEntry[] {
  const en = mergeLocale(enCommon as Record<string, unknown>, enSite as Record<string, unknown>);
  const de = mergeLocale(deCommon as Record<string, unknown>, deSite as Record<string, unknown>);
  const localeEntries = flattenLocale(en, de);
  const imageEntries = buildMarketingImageEntries();
  return [...localeEntries, ...imageEntries];
}

export function buildSectionRows() {
  return CMS_PAGE_GROUPS.map((group, index) => ({
    section_key: `page-${group.id}`,
    section_name: group.label,
    page_name: group.id,
    description: `Editable content for the ${group.label} section of the website`,
    sort_order: index + 1,
    is_active: true,
  }));
}

export function contentRowsFromEntries(
  entries: FlatLocaleEntry[],
  sectionIdByPage: Record<string, string>
) {
  return entries.map((entry, index) => ({
    section_id: sectionIdByPage[entry.pageGroup] ?? null,
    i18n_key: entry.i18nKey,
    field_key: entry.i18nKey,
    field_name: entry.i18nKey.split(".").slice(-2).join(" · "),
    field_type: entry.fieldType,
    content_value: typeof entry.valueEn === "string" ? entry.valueEn : null,
    content_json: { en: entry.valueEn, de: entry.valueDe },
    sort_order: index + 1,
    is_required: false,
  }));
}
