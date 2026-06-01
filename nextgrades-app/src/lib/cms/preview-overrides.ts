import type { CmsOverrideMap } from "./types";
import { parseCmsValue } from "./flatten";
import type { CmsFieldType } from "./flatten";

type DraftField = {
  i18n_key: string;
  field_type: string;
  draft: { en: string; de: string };
};

/** Build override map from in-memory draft fields for live preview. */
export function buildPreviewOverrides(fields: DraftField[]): CmsOverrideMap {
  const map: CmsOverrideMap = {};
  for (const field of fields) {
    const fieldType = field.field_type as CmsFieldType;
    if (fieldType === "image") {
      const url = field.draft.en.trim() || field.draft.de.trim();
      if (url) {
        map[field.i18n_key] = { en: url, de: url };
      }
      continue;
    }
    try {
      map[field.i18n_key] = {
        en: parseCmsValue(field.draft.en, fieldType),
        de: parseCmsValue(field.draft.de, fieldType),
      };
    } catch {
      map[field.i18n_key] = { en: field.draft.en, de: field.draft.de };
    }
  }
  return map;
}

export const CMS_PREVIEW_READY = "nextgrades-cms-preview-ready";
export const CMS_PREVIEW_OVERRIDES = "nextgrades-cms-preview-overrides";
/** Parent ← iframe when user clicks an element with data-cms-field */
export const CMS_PREVIEW_FIELD_CLICK = "nextgrades-cms-field-click";
