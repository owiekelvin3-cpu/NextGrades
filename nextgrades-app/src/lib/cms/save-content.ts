import type { CmsFieldType } from "./flatten";
import { parseCmsValue } from "./flatten";

export type CmsSavePayload = {
  id?: string;
  i18n_key: string;
  pageGroup: string;
  field_name: string;
  field_type: string;
  content_json?: { en?: unknown; de?: unknown };
  content_value?: string | null;
};

export function buildSavePayloads(
  fields: Array<{
    id: string;
    i18n_key: string;
    pageGroup: string;
    field_name: string;
    field_type: string;
    draft: { en: string; de: string };
  }>
): CmsSavePayload[] {
  return fields.map((field) => {
    const fieldType = field.field_type as CmsFieldType;
    let content_json: { en?: unknown; de?: unknown };
    try {
      content_json = {
        en: parseCmsValue(field.draft.en, fieldType),
        de: parseCmsValue(field.draft.de, fieldType),
      };
    } catch {
      throw new Error(`Invalid JSON in field: ${field.i18n_key}`);
    }
    return {
      id: field.id.startsWith("local-") ? undefined : field.id,
      i18n_key: field.i18n_key,
      pageGroup: field.pageGroup,
      field_name: field.field_name,
      field_type: field.field_type,
      content_json,
      content_value:
        fieldType === "text" || fieldType === "textarea" || fieldType === "image" || fieldType === "url"
          ? field.draft.en
          : JSON.stringify(content_json.en),
    };
  });
}

export function getDirtyFields<
  T extends { draft: { en: string; de: string }; liveBaseline: { en: string; de: string } }
>(fields: T[]): T[] {
  return fields.filter(
    (f) => f.draft.en.trim() !== f.liveBaseline.en.trim() || f.draft.de.trim() !== f.liveBaseline.de.trim()
  );
}
