import type { CmsFieldType } from "./flatten";
import { parseCmsValue } from "./flatten";

export type CmsSavePayload = {
  id?: string;
  i18n_key: string;
  pageGroup: string;
  field_name: string;
  field_type: string;
  content_json?: { en?: unknown; de?: unknown };
  draft_json?: { en?: unknown; de?: unknown };
  content_value?: string | null;
  mode?: "draft" | "publish";
};

function buildJsonFromDraft(draft: { en: string; de: string }, fieldType: CmsFieldType) {
  return {
    en: parseCmsValue(draft.en, fieldType),
    de: parseCmsValue(draft.de, fieldType),
  };
}

export function buildSavePayloads(
  fields: Array<{
    id: string;
    i18n_key: string;
    pageGroup: string;
    field_name: string;
    field_type: string;
    draft: { en: string; de: string };
  }>,
  mode: "draft" | "publish" = "publish"
): CmsSavePayload[] {
  return fields.map((field) => {
    const fieldType = field.field_type as CmsFieldType;
    const parsed = buildJsonFromDraft(field.draft, fieldType);
    return {
      id: field.id.startsWith("local-") ? undefined : field.id,
      i18n_key: field.i18n_key,
      pageGroup: field.pageGroup,
      field_name: field.field_name,
      field_type: field.field_type,
      mode,
      ...(mode === "draft"
        ? { draft_json: parsed }
        : {
            content_json: parsed,
            draft_json: parsed,
            content_value:
              fieldType === "text" || fieldType === "textarea" || fieldType === "image" || fieldType === "url"
                ? field.draft.en
                : JSON.stringify(parsed.en),
          }),
    };
  });
}

export function getDirtyFields<
  T extends { draft: { en: string; de: string }; published: { en: string; de: string } }
>(fields: T[]): T[] {
  return fields.filter(
    (f) => f.draft.en.trim() !== f.published.en.trim() || f.draft.de.trim() !== f.published.de.trim()
  );
}

export function getDraftDirtyFields<
  T extends { draft: { en: string; de: string }; published: { en: string; de: string } }
>(fields: T[]): T[] {
  return getDirtyFields(fields);
}
