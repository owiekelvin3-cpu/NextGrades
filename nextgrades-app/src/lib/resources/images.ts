/**
 * Resources-section images only — each Unsplash photo ID is unique across the site.
 * Do not reuse IDs from marketing-images.ts or inline page URLs.
 */

function u(id: string, w = 800, h = 500) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=85`;
}

export const RESOURCES_HUB_HERO = u("1503676260728-1c00da094a0b", 1920, 1080);

export const RESOURCES_UPGRADE_HERO = u("1523050854548-600962526ae0", 1920, 1080);

export const RESOURCES_DEFAULT_THUMBNAIL = u("1524995993596-b08947747391");

/** Subject heroes & tiles — not shared with /subjects page */
export const RESOURCES_SUBJECT_IMAGE_BY_ID: Record<string, string> = {
  math: u("1596495578064-82f9e4034428"),
  english: u("1457695719797-6647b2660e71"),
  german: u("1544716275-ca93ac96c17e"),
  physics: u("1636466499355-9f8ee186f12a"),
  chemistry: u("1603120375449-46255d9f3c35"),
  biology: u("1576086210839-4723677ef878"),
  business: u("1556761175-b413da4baf72"),
  "computer-science": u("1555066931-43614d8685de"),
  "technical-drawing": u("1586286861527-3ec0d6d5ae69"),
};

const SUBJECT_ALIASES: Record<string, string> = {
  mathematik: "math",
  englisch: "english",
  deutsch: "german",
  physik: "physics",
  chemie: "chemistry",
  biologie: "biology",
  wirtschaft: "business",
  informatik: "computer-science",
};

const SUBJECT_FALLBACK_ORDER = [
  RESOURCES_SUBJECT_IMAGE_BY_ID.math,
  RESOURCES_SUBJECT_IMAGE_BY_ID.english,
  RESOURCES_SUBJECT_IMAGE_BY_ID.german,
  RESOURCES_SUBJECT_IMAGE_BY_ID.physics,
  RESOURCES_SUBJECT_IMAGE_BY_ID.chemistry,
] as const;

/** Fallback thumbnails when a resource has no uploaded cover */
export const RESOURCES_CONTENT_TYPE_IMAGES: Record<string, string> = {
  video_course: u("1571171637758-47c1b0748e76"),
  mini_course: u("1563986768609-322da13575f3"),
  full_course: u("1588072432834-1101f84faa4b"),
  live_class: u("1516321497487-e544c54d2f00"),
  webinar: u("1553877525-f6e3844ae254"),
  practice_questions: u("1471107341899-ad7e0e5ab44d"),
  assignment: u("1416331108676-22c6c9da1a92"),
  workspace: u("1488190211103-e3e395f63f07"),
  guidebook: u("1543002588-bfa74002ed7e"),
  formula_sheet: u("1596496181940-445686a3a656"),
  exam_preparation: u("1606761568499-11d29da76008"),
  learning_material: u("1451187582231-0436456a162d"),
  document: u("1568667256549-98fa7ce7c1c5"),
  pdf_resource: u("1585338083537-bddcb26fc0fc"),
  presentation: u("1552664730-d307ca884978"),
  article: u("1505685793622-83910832530f"),
  video: u("1611162617474-5b21e279e81f"),
  pdf: u("1586953208448-b19554739879"),
};

export function normalizeResourcesSubjectKey(slugOrName?: string | null): string {
  if (!slugOrName) return "";
  const key = slugOrName.toLowerCase().replace(/\s+/g, "-");
  return SUBJECT_ALIASES[key] ?? key;
}

export function getResourcesSubjectImage(subjectId: string, index = 0): string {
  const key = normalizeResourcesSubjectKey(subjectId);
  return (
    RESOURCES_SUBJECT_IMAGE_BY_ID[key] ??
    SUBJECT_FALLBACK_ORDER[index] ??
    RESOURCES_DEFAULT_THUMBNAIL
  );
}

type ResourceThumbInput = {
  thumbnail_url?: string | null;
  content_type?: string | null;
  type?: string | null;
  subject?: { slug?: string | null; name?: string | null } | null;
};

/** Uploaded thumbnail → subject photo → content-type photo → generic fallback */
export function getResourceThumbnail(resource: ResourceThumbInput, contextSubject?: string): string {
  if (resource.thumbnail_url?.trim()) return resource.thumbnail_url.trim();

  const subjectKey = normalizeResourcesSubjectKey(
    contextSubject || resource.subject?.slug || resource.subject?.name
  );
  if (subjectKey && RESOURCES_SUBJECT_IMAGE_BY_ID[subjectKey]) {
    return RESOURCES_SUBJECT_IMAGE_BY_ID[subjectKey];
  }

  const contentType = resource.content_type || resource.type || "";
  if (contentType && RESOURCES_CONTENT_TYPE_IMAGES[contentType]) {
    return RESOURCES_CONTENT_TYPE_IMAGES[contentType];
  }

  return RESOURCES_DEFAULT_THUMBNAIL;
}
