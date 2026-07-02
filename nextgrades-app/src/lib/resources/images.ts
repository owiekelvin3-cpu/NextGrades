/**
 * Resources-section images — branded marketing photos.
 */

import { BRANDED, SUBJECT_ONLINE_IMAGES } from "@/lib/marketing-images";

export const RESOURCES_HUB_HERO = BRANDED.subjectBooks;
export const RESOURCES_UPGRADE_HERO = BRANDED.tutoringSession;
export const RESOURCES_DEFAULT_THUMBNAIL = BRANDED.subjectBooks;

/** Subject heroes & tiles — distinct online photo per subject */
export const RESOURCES_SUBJECT_IMAGE_BY_ID: Record<string, string> = {
  math: SUBJECT_ONLINE_IMAGES.math,
  english: SUBJECT_ONLINE_IMAGES.english,
  german: SUBJECT_ONLINE_IMAGES.german,
  french: SUBJECT_ONLINE_IMAGES.french,
  italian: SUBJECT_ONLINE_IMAGES.italian,
  latin: SUBJECT_ONLINE_IMAGES.latin,
  physics: SUBJECT_ONLINE_IMAGES.physics,
  chemistry: SUBJECT_ONLINE_IMAGES.chemistry,
  biology: SUBJECT_ONLINE_IMAGES.biology,
  accounting: SUBJECT_ONLINE_IMAGES.accounting,
  business: SUBJECT_ONLINE_IMAGES.business,
  "business-admin": SUBJECT_ONLINE_IMAGES["business-admin"],
  "computer-science": SUBJECT_ONLINE_IMAGES["computer-science"],
  "technical-drawing": SUBJECT_ONLINE_IMAGES["technical-drawing"],
};

const SUBJECT_ALIASES: Record<string, string> = {
  mathematik: "math",
  mathe: "math",
  englisch: "english",
  deutsch: "german",
  franzoesisch: "french",
  "französisch": "french",
  italienisch: "italian",
  latein: "latin",
  physik: "physics",
  chemie: "chemistry",
  biologie: "biology",
  wirtschaft: "business",
  "wirtschaft-bwl": "business-admin",
  "wirtschaft-&-bwl": "business-admin",
  "wirtschaft-und-bwl": "business-admin",
  bwl: "business-admin",
  betriebswirtschaft: "business-admin",
  rechnungswesen: "accounting",
  informatik: "computer-science",
  "technisches-zeichnen": "technical-drawing",
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
  video_course: BRANDED.tutoringSession,
  mini_course: BRANDED.tutoringSession,
  full_course: BRANDED.progressDashboard,
  live_class: BRANDED.tutoringSession,
  webinar: BRANDED.tutoringSession,
  practice_questions: BRANDED.subjectBooks,
  assignment: BRANDED.studyDesk,
  workspace: BRANDED.studyDesk,
  guidebook: BRANDED.subjectBooks,
  formula_sheet: BRANDED.subjectBooks,
  exam_preparation: BRANDED.tutoringSession,
  learning_material: BRANDED.subjectBooks,
  document: BRANDED.subjectBooks,
  pdf_resource: BRANDED.subjectBooks,
  presentation: BRANDED.progressDashboard,
  article: BRANDED.studyDesk,
  video: BRANDED.tutoringSession,
  pdf: BRANDED.subjectBooks,
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
