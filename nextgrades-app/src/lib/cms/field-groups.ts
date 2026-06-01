import { humanizeKey } from "./constants";
import { friendlySectionLabel } from "./page-meta";

export type CmsFieldGroup = {
  id: string;
  label: string;
  fieldKeys: string[];
};

/** Group i18n keys into readable sections for the page editor. */
export function groupFieldsBySection(i18nKeys: string[]): CmsFieldGroup[] {
  const buckets = new Map<string, { label: string; fieldKeys: string[] }>();

  for (const key of i18nKeys) {
    const parts = key.split(".");
    let sectionId: string;
    let label: string;

    if (key.startsWith("cmsImages.")) {
      sectionId = `images-${parts[1] ?? "general"}`;
      label = `${humanizeKey(parts[1] ?? "general")} images`;
    } else if (parts.length <= 1) {
      sectionId = "general";
      label = "General";
    } else {
      sectionId = parts[1];
      label = humanizeKey(parts[1]);
    }

    const bucket = buckets.get(sectionId) ?? { label, fieldKeys: [] };
    bucket.fieldKeys.push(key);
    buckets.set(sectionId, bucket);
  }

  return Array.from(buckets.entries())
    .map(([id, { label, fieldKeys }]) => ({
      id,
      label: friendlySectionLabel(id, label),
      fieldKeys: fieldKeys.sort(),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
