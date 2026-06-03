import { getPageGroupForKey, humanizeKey, isCmsEditableKey } from "./constants";
import type { CmsFieldType } from "./flatten";
import { serializeCmsValue } from "./flatten";
import { buildSeedEntries } from "./seed";
import type { CmsContentRow } from "./types";

export type EditLocale = "en" | "de";

export type MergedCmsField = {
  id: string;
  section_id: string | null;
  i18n_key: string;
  field_key: string;
  field_name: string;
  field_type: CmsFieldType | string;
  content_value: string | null;
  content_json: { en?: unknown; de?: unknown } | null;
  draft_json: { en?: unknown; de?: unknown } | null;
  sort_order: number;
  pageGroup: string;
  draft: Record<EditLocale, string>;
  published: Record<EditLocale, string>;
  liveBaseline: Record<EditLocale, string>;
  isCustomized: boolean;
  isPersisted: boolean;
  hasUnpublishedChanges: boolean;
};

function readLocaleValue(
  row: CmsContentRow | undefined,
  seed: { valueEn: unknown; valueDe: unknown } | undefined,
  locale: EditLocale,
  source: "published" | "draft"
): unknown {
  if (row) {
    const json =
      source === "draft"
        ? row.draft_json ?? row.content_json
        : row.content_json;
    if (json && json[locale] !== undefined && json[locale] !== null && json[locale] !== "") {
      return json[locale];
    }
    const useContentValue =
      row.content_value &&
      (row.field_type === "image" ||
        row.field_type === "url" ||
        row.field_type === "text" ||
        row.field_type === "textarea" ||
        locale === "en");
    if (useContentValue && row.content_value && (source === "published" || !row.draft_json)) {
      const raw = row.content_value;
      if (row.field_type === "json") {
        try {
          return JSON.parse(raw);
        } catch {
          return raw;
        }
      }
      if (row.field_type === "image" || row.field_type === "url") {
        return raw;
      }
      if (locale === "en") {
        return raw;
      }
    }
  }
  if (seed) {
    return locale === "de" ? seed.valueDe : seed.valueEn;
  }
  return "";
}

function valuesEqual(a: string, b: string): boolean {
  return a.trim() === b.trim();
}

export function mergeCmsFields(dbRows: CmsContentRow[]): MergedCmsField[] {
  const seedEntries = buildSeedEntries();
  const seedMap = new Map(seedEntries.map((e) => [e.i18nKey, e]));
  const dbMap = new Map<string, CmsContentRow>();

  for (const row of dbRows) {
    const key = row.i18n_key || row.field_key;
    if (key) dbMap.set(key, { ...row, i18n_key: key });
  }

  const allKeys = new Set<string>(
    [...seedMap.keys(), ...dbMap.keys()].filter((key) => isCmsEditableKey(key))
  );

  return Array.from(allKeys)
    .sort((a, b) => a.localeCompare(b))
    .map((i18nKey, index) => {
      const db = dbMap.get(i18nKey);
      const seed = seedMap.get(i18nKey);
      const pageGroup = getPageGroupForKey(i18nKey);
      const fieldType = (db?.field_type ?? seed?.fieldType ?? "text") as CmsFieldType;

      const liveBaseline = {
        en: serializeCmsValue(seed ? seed.valueEn : readLocaleValue(db, seed, "en", "published")),
        de: serializeCmsValue(seed ? seed.valueDe : readLocaleValue(db, seed, "de", "published")),
      };

      const published = {
        en: serializeCmsValue(readLocaleValue(db, seed, "en", "published")),
        de: serializeCmsValue(readLocaleValue(db, seed, "de", "published")),
      };

      const draft = {
        en: serializeCmsValue(readLocaleValue(db, seed, "en", "draft")),
        de: serializeCmsValue(readLocaleValue(db, seed, "de", "draft")),
      };

      const isPersisted = Boolean(db?.id);
      const isCustomized =
        isPersisted &&
        (!valuesEqual(published.en, liveBaseline.en) || !valuesEqual(published.de, liveBaseline.de));

      const hasUnpublishedChanges =
        isPersisted &&
        (!valuesEqual(draft.en, published.en) || !valuesEqual(draft.de, published.de));

      return {
        id: db?.id ?? `local-${i18nKey}`,
        section_id: db?.section_id ?? null,
        i18n_key: i18nKey,
        field_key: db?.field_key ?? i18nKey,
        field_name: db?.field_name ?? humanizeKey(i18nKey),
        field_type: fieldType,
        content_value: db?.content_value ?? null,
        content_json: db?.content_json ?? { en: seed?.valueEn, de: seed?.valueDe },
        draft_json: db?.draft_json ?? null,
        sort_order: db?.sort_order ?? index,
        pageGroup,
        draft,
        published,
        liveBaseline,
        isCustomized,
        isPersisted,
        hasUnpublishedChanges,
      };
    });
}

export function countPageStats(fields: MergedCmsField[]) {
  const byPage = new Map<string, { total: number; customized: number }>();
  for (const f of fields) {
    const cur = byPage.get(f.pageGroup) ?? { total: 0, customized: 0 };
    cur.total += 1;
    if (f.isCustomized) cur.customized += 1;
    byPage.set(f.pageGroup, cur);
  }
  return byPage;
}
