import { CMS_EXCLUDED_PREFIXES, getPageGroupForKey } from "./constants";

export type CmsFieldType = "text" | "textarea" | "json" | "image" | "url";

export type FlatLocaleEntry = {
  i18nKey: string;
  pageGroup: string;
  fieldType: CmsFieldType;
  valueEn: unknown;
  valueDe: unknown;
};

function isLeaf(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value !== "object") return true;
  if (Array.isArray(value)) return true;
  return false;
}

function inferFieldType(value: unknown): CmsFieldType {
  if (Array.isArray(value)) return "json";
  if (typeof value === "object" && value !== null) return "json";
  if (typeof value === "string" && value.length > 160) return "textarea";
  return "text";
}

function shouldIncludeKey(key: string): boolean {
  return !CMS_EXCLUDED_PREFIXES.some((prefix) => key === prefix || key.startsWith(`${prefix}.`));
}

export function flattenLocale(
  en: Record<string, unknown>,
  de: Record<string, unknown>,
  prefix = ""
): FlatLocaleEntry[] {
  const entries: FlatLocaleEntry[] = [];

  const walk = (obj: Record<string, unknown>, deObj: Record<string, unknown>, path: string) => {
    for (const [key, valueEn] of Object.entries(obj)) {
      const i18nKey = path ? `${path}.${key}` : key;
      if (!shouldIncludeKey(i18nKey)) continue;

      const valueDe = deObj?.[key];

      if (isLeaf(valueEn)) {
        entries.push({
          i18nKey,
          pageGroup: getPageGroupForKey(i18nKey),
          fieldType: inferFieldType(valueEn),
          valueEn,
          valueDe: valueDe ?? valueEn,
        });
      } else if (typeof valueEn === "object" && valueEn !== null && !Array.isArray(valueEn)) {
        walk(
          valueEn as Record<string, unknown>,
          (valueDe && typeof valueDe === "object" && !Array.isArray(valueDe)
            ? (valueDe as Record<string, unknown>)
            : {}) as Record<string, unknown>,
          i18nKey
        );
      } else {
        entries.push({
          i18nKey,
          pageGroup: getPageGroupForKey(i18nKey),
          fieldType: inferFieldType(valueEn),
          valueEn,
          valueDe: valueDe ?? valueEn,
        });
      }
    }
  };

  walk(en, de, prefix);
  return entries;
}

export function mergeLocale(common: Record<string, unknown>, site: Record<string, unknown>) {
  return { ...common, ...site };
}

export function serializeCmsValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export function parseCmsValue(raw: string, fieldType: CmsFieldType): unknown {
  if (fieldType === "json") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    return JSON.parse(trimmed) as unknown;
  }
  return raw;
}
