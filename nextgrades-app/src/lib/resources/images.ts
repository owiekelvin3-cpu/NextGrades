/**
 * Resources-section images — branded marketing photos.
 */

import { BRANDED } from "@/lib/marketing-images";

export const RESOURCES_HUB_HERO = BRANDED.subjectBooks;
export const RESOURCES_UPGRADE_HERO = BRANDED.tutoringSession;
export const RESOURCES_DEFAULT_THUMBNAIL = BRANDED.subjectBooks;

/** Subject heroes & tiles */
export const RESOURCES_SUBJECT_IMAGE_BY_ID: Record<string, string> = {
  math: BRANDED.subjectBooks,
  english: BRANDED.studyDesk,
  german: BRANDED.subjectBooks,
  physics: BRANDED.tutoringSession,
  chemistry: BRANDED.studyDesk,
  biology: BRANDED.studyDesk,
  business: BRANDED.progressDashboard,
  "computer-science": BRANDED.tutoringSession,
  "technical-drawing": BRANDED.studyDesk,
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
