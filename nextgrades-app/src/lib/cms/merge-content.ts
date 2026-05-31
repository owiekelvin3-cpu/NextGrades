import { getPageGroupForKey, humanizeKey } from "./constants";
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
  sort_order: number;
  pageGroup: string;
  draft: Record<EditLocale, string>;
  liveBaseline: Record<EditLocale, string>;
  isCustomized: boolean;
  isPersisted: boolean;
};

function readLocaleValue(
  row: CmsContentRow | undefined,
  seed: { valueEn: unknown; valueDe: unknown } | undefined,
  locale: EditLocale
): unknown {
  if (row?.content_json && row.content_json[locale] !== undefined) {
    return row.content_json[locale];
  }
  if (locale === "en" && row?.content_value) {
    if (row.field_type === "json") {
      try {
        return JSON.parse(row.content_value);
      } catch {
        return row.content_value;
      }
    }
    return row.content_value;
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

  const allKeys = new Set<string>([...seedMap.keys(), ...dbMap.keys()]);

  return Array.from(allKeys)
    .sort((a, b) => a.localeCompare(b))
    .map((i18nKey, index) => {
      const db = dbMap.get(i18nKey);
      const seed = seedMap.get(i18nKey);
      const pageGroup = getPageGroupForKey(i18nKey);
      const fieldType = (db?.field_type ?? seed?.fieldType ?? "text") as CmsFieldType;

      const liveBaseline = {
        en: serializeCmsValue(seed ? seed.valueEn : readLocaleValue(db, seed, "en")),
        de: serializeCmsValue(seed ? seed.valueDe : readLocaleValue(db, seed, "de")),
      };

      const draft = {
        en: serializeCmsValue(readLocaleValue(db, seed, "en")),
        de: serializeCmsValue(readLocaleValue(db, seed, "de")),
      };

      const isPersisted = Boolean(db?.id);
      const isCustomized =
        isPersisted &&
        (!valuesEqual(draft.en, liveBaseline.en) || !valuesEqual(draft.de, liveBaseline.de));

      return {
        id: db?.id ?? `local-${i18nKey}`,
        section_id: db?.section_id ?? null,
        i18n_key: i18nKey,
        field_key: db?.field_key ?? i18nKey,
        field_name: db?.field_name ?? humanizeKey(i18nKey),
        field_type: fieldType,
        content_value: db?.content_value ?? null,
        content_json: db?.content_json ?? { en: seed?.valueEn, de: seed?.valueDe },
        sort_order: db?.sort_order ?? index,
        pageGroup,
        draft,
        liveBaseline,
        isCustomized,
        isPersisted,
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
