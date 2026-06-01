import { friendlySectionLabel } from "./page-meta";

export type EditorSection = {
  id: string;
  label: string;
  hint: string;
};

const HOME_SECTIONS: EditorSection[] = [
  { id: "hero", label: "Top banner", hint: "Main headline, buttons, and hero photo" },
  { id: "stats", label: "Numbers", hint: "Statistics shown under the banner" },
  { id: "features", label: "Why us", hint: "Feature cards and highlights" },
  { id: "programs", label: "Programs", hint: "Program list and card images" },
  { id: "testimonials", label: "Reviews", hint: "What families say about you" },
  { id: "cta", label: "Bottom sign-up", hint: "Final call-to-action area" },
  { id: "general", label: "Other text", hint: "Extra lines on the homepage" },
  { id: "hero-images", label: "Banner photos", hint: "Large images at the top" },
  { id: "programs-images", label: "Program photos", hint: "Small images on program cards" },
  { id: "features-images", label: "Feature photos", hint: "Images in the why-us area" },
  { id: "testimonials-images", label: "Review background", hint: "Background behind testimonials" },
  { id: "other-images", label: "Other pictures", hint: "Remaining homepage images" },
];

function homeImageSection(i18nKey: string): string {
  if (i18nKey.includes("heroStudent") || i18nKey.includes("studyBanner") || i18nKey.includes(".desk")) {
    return "hero-images";
  }
  if (i18nKey.includes("programCard")) return "programs-images";
  if (i18nKey.includes("platformThumb")) return "features-images";
  if (i18nKey.includes("testimonials")) return "testimonials-images";
  return "other-images";
}

/** Maps a CMS field to a simple section id for grouped editing. */
export function getEditorSectionId(pageId: string, i18nKey: string, fieldType: string): string {
  if (fieldType === "image" || i18nKey.startsWith("cmsImages.")) {
    if (pageId === "home" && i18nKey.startsWith("cmsImages.home.")) {
      return homeImageSection(i18nKey);
    }
    return "pictures";
  }

  if (pageId === "home" && i18nKey.startsWith("home.")) {
    const segment = i18nKey.split(".")[1] ?? "general";
    if (segment === "programsSection") return "programs";
    if (segment === "testimonials") return "testimonials";
    if (segment.includes("cta") || segment === "bottomCta") return "cta";
    if (segment === "stats") return "stats";
    if (segment === "features") return "features";
    if (
      segment.startsWith("hero") ||
      segment === "rating" ||
      segment === "reviewsFrom" ||
      segment === "floatingCardTitle" ||
      segment === "floatingCardDesc"
    ) {
      return "hero";
    }
    return "general";
  }

  const parts = i18nKey.split(".");
  const second = parts[1] ?? "general";
  return second;
}

export function getEditorSectionsForPage(
  pageId: string,
  fieldKeys: { i18n_key: string; field_type: string }[]
): EditorSection[] {
  const used = new Set(fieldKeys.map((f) => getEditorSectionId(pageId, f.i18n_key, f.field_type)));

  if (pageId === "home") {
    return HOME_SECTIONS.filter((s) => used.has(s.id));
  }

  const dynamic: EditorSection[] = [];
  for (const id of used) {
    if (id === "pictures") continue;
    dynamic.push({
      id,
      label: friendlySectionLabel(id, id.replace(/[-_]/g, " ")),
      hint: `Edit ${friendlySectionLabel(id, id).toLowerCase()}`,
    });
  }

  if (used.has("pictures")) {
    dynamic.push({ id: "pictures", label: "Pictures", hint: "Photos on this page" });
  }

  return dynamic.sort((a, b) => a.label.localeCompare(b.label));
}

export function filterFieldsBySection<T extends { i18n_key: string; field_type: string }>(
  pageId: string,
  fields: T[],
  sectionId: string | null
): T[] {
  if (!sectionId) return fields;
  return fields.filter((f) => getEditorSectionId(pageId, f.i18n_key, f.field_type) === sectionId);
}
