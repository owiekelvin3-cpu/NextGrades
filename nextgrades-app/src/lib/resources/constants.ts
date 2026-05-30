export const CONTENT_TYPES = [
  { value: "video_course", label: "Video Course" },
  { value: "full_course", label: "Full Course" },
  { value: "mini_course", label: "Mini Course" },
  { value: "live_class", label: "Live Class" },
  { value: "learning_material", label: "Learning Material" },
  { value: "guidebook", label: "Guidebook" },
  { value: "formula_sheet", label: "Formula Sheet" },
  { value: "exam_preparation", label: "Exam Preparation" },
  { value: "practice_questions", label: "Practice Questions" },
  { value: "assignment", label: "Assignment" },
  { value: "workspace", label: "Workspace" },
  { value: "pdf_resource", label: "PDF Resource" },
  { value: "presentation", label: "Presentation (PPT)" },
  { value: "document", label: "Document" },
  { value: "article", label: "Article" },
  { value: "workshop", label: "Workshop" },
  { value: "webinar", label: "Webinar" },
  { value: "other", label: "Other" },
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number]["value"];

export const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export const AGE_RANGES = [
  { value: "all_ages", label: "All Ages" },
  { value: "6_10", label: "6–10" },
  { value: "11_13", label: "11–13" },
  { value: "14_17", label: "14–17" },
  { value: "18_plus", label: "18+" },
] as const;

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "other", label: "Other" },
] as const;

export const LEGACY_TYPE_MAP: Record<ContentType, string> = {
  video_course: "video",
  full_course: "video",
  mini_course: "video",
  live_class: "video",
  webinar: "video",
  workshop: "video",
  learning_material: "pdf",
  guidebook: "pdf",
  formula_sheet: "pdf",
  exam_preparation: "pdf",
  practice_questions: "pdf",
  assignment: "pdf",
  workspace: "other",
  pdf_resource: "pdf",
  presentation: "pdf",
  document: "pdf",
  article: "other",
  other: "other",
};

export const DEFAULT_THUMBNAIL = "/img-001.png";

export function contentTypeLabel(value: string): string {
  return CONTENT_TYPES.find((c) => c.value === value)?.label ?? value.replace(/_/g, " ");
}
