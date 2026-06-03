/**
 * Marketing images — branded photos in /public/images/marketing.
 * Unsplash URLs remain as remote fallbacks only.
 */

function u(id: string, w = 800, h = 533, q = 75) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=${q}`;
}

function face(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&h=400&crop=faces&q=80`;
}

/** Branded NextGrades photography (see /public/images/marketing). */
export const BRANDED = {
  studentsGroup3: "/images/marketing/students-group-3.png",
  studentsGroup4: "/images/marketing/students-group-4.png",
  studentsCollab: "/images/marketing/students-collab.png",
  tutoringSession: "/images/marketing/tutoring-session.png",
  studyDesk: "/images/marketing/study-desk.png",
  subjectBooks: "/images/marketing/subject-books.png",
  progressDashboard: "/images/marketing/progress-dashboard.png",
  privacySecure: "/images/marketing/privacy-secure.png",
} as const;

export const ONLINE_IMAGE_FALLBACK = BRANDED.studyDesk;
export const LOCAL_IMAGE_FALLBACK = ONLINE_IMAGE_FALLBACK;

export const ABOUT_IMAGES = {
  hero: BRANDED.studentsGroup4,
  story: BRANDED.studentsGroup3,
  mission: [
    BRANDED.studyDesk,
    BRANDED.subjectBooks,
    BRANDED.tutoringSession,
    BRANDED.progressDashboard,
  ] as const,
  promise: BRANDED.privacySecure,
} as const;

export const CONTACT_HERO_IMAGE = BRANDED.studyDesk;
export const PROGRAMS_HERO_IMAGE = BRANDED.studentsCollab;
export const CONSULTATION_HERO_IMAGE = BRANDED.tutoringSession;
export const CAREERS_HERO_IMAGE = BRANDED.studentsGroup3;
export const LOGIN_HERO_IMAGE = BRANDED.tutoringSession;
export const PRIVACY_HERO_IMAGE = BRANDED.privacySecure;
export const HOME_PLATFORM_THUMB = BRANDED.progressDashboard;
export const HOME_TESTIMONIALS_BG = BRANDED.studyDesk;

export const HOME_HERO_STUDENT_IMAGE = BRANDED.studentsGroup3;

/** Home hero carousel — rotates branded lifestyle photos. */
export const HOME_HERO_CAROUSEL_IMAGES = [
  BRANDED.studentsGroup3,
  BRANDED.studentsCollab,
  BRANDED.tutoringSession,
  BRANDED.studyDesk,
] as const;

export const HERO_STUDY_IMAGE = BRANDED.progressDashboard;
export const HERO_DESK_IMAGE = BRANDED.studyDesk;

export const PROGRAM_CARD_IMAGES = [
  BRANDED.tutoringSession,
  BRANDED.studentsGroup3,
  BRANDED.subjectBooks,
] as const;

export const PROGRAMS_PAGE_CARD_IMAGES = [
  BRANDED.tutoringSession,
  BRANDED.studentsCollab,
  BRANDED.subjectBooks,
] as const;

export const SUBJECTS_HERO_IMAGE = BRANDED.subjectBooks;

export const ABOUT_TEAM_IMAGES = [
  face("1507003211164-0a1dd7e784aa"),
  face("1494790108377-be9c29b293d2"),
  face("1560250097-0b93528c311a"),
  face("1573496359142-b8d87734a921"),
  face("1472099645785-5658abf4ff4e"),
] as const;

export const LOGIN_AVATAR_IMAGES = [
  face("1507003211164-0a1dd7e784aa"),
  face("1544005313-94ddf0286df2"),
  face("1472099645785-5658abf4ff4e"),
] as const;

const SUBJECT_CARD_PHOTO = BRANDED.subjectBooks;

export const SUBJECT_IMAGE_BY_ID: Record<string, string> = {
  math: SUBJECT_CARD_PHOTO,
  english: SUBJECT_CARD_PHOTO,
  german: SUBJECT_CARD_PHOTO,
  physics: SUBJECT_CARD_PHOTO,
  chemistry: SUBJECT_CARD_PHOTO,
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

export function normalizeSubjectKey(slugOrName?: string | null): string {
  if (!slugOrName) return "";
  const key = slugOrName.toLowerCase().replace(/\s+/g, "-");
  return SUBJECT_ALIASES[key] ?? key;
}

export const SUBJECT_CARD_IMAGES = [
  SUBJECT_IMAGE_BY_ID.math,
  SUBJECT_IMAGE_BY_ID.english,
  SUBJECT_IMAGE_BY_ID.german,
  SUBJECT_IMAGE_BY_ID.physics,
  SUBJECT_IMAGE_BY_ID.chemistry,
] as const;

export function getSubjectImage(subjectId: string, index = 0): string {
  const key = normalizeSubjectKey(subjectId);
  return SUBJECT_IMAGE_BY_ID[key] ?? SUBJECT_CARD_IMAGES[index] ?? HERO_STUDY_IMAGE;
}

export function isLocalImageSrc(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}
