/**
 * Marketing images — branded NextGrades photography in /public/images/marketing.
 */

/** Branded NextGrades photography (see /public/images/marketing). */
export const BRANDED = {
  /** Girl studying at desk — primary lifestyle hero */
  studyDesk: "/images/marketing/study-desk.png",
  /** 1:1 online tutoring session on laptop */
  tutoringSession: "/images/marketing/tutoring-session.png",
  /** Branded subject textbooks + notes */
  subjectBooks: "/images/marketing/subject-books.png",
  /** Laptop: “Deine Daten in sicheren Händen.” */
  privacySecure: "/images/marketing/privacy-secure.png",
  /** Laptop with NextGrades platform tagline UI */
  progressDashboard: "/images/marketing/progress-dashboard.png",
  /** Fortschritt dashboard close-up on desk */
  platformLaptop: "/images/marketing/platform-laptop.png",
  /** Four students collaborating */
  studentsGroup4: "/images/marketing/students-group-4.png",
  /** Three students with laptop */
  studentsGroup3: "/images/marketing/students-group-3.png",
  studentsCollab: "/images/marketing/students-collab.png",
} as const;

export const ONLINE_IMAGE_FALLBACK = BRANDED.studyDesk;
export const LOCAL_IMAGE_FALLBACK = ONLINE_IMAGE_FALLBACK;

export const ABOUT_IMAGES = {
  hero: BRANDED.studentsGroup4,
  story: BRANDED.studyDesk,
  mission: [
    BRANDED.tutoringSession,
    BRANDED.subjectBooks,
    BRANDED.platformLaptop,
    BRANDED.privacySecure,
  ] as const,
  promise: BRANDED.privacySecure,
} as const;

export const CONTACT_HERO_IMAGE = BRANDED.studyDesk;
export const PROGRAMS_HERO_IMAGE = BRANDED.studentsCollab;
export const CONSULTATION_HERO_IMAGE = BRANDED.tutoringSession;
export const CAREERS_HERO_IMAGE = BRANDED.studentsGroup4;
export const HELP_HERO_IMAGE = BRANDED.platformLaptop;
export const RESOURCES_HERO_IMAGE = BRANDED.studentsGroup3;
export const LOGIN_HERO_IMAGE = BRANDED.tutoringSession;
export const PRIVACY_HERO_IMAGE = BRANDED.privacySecure;
export const HOME_PLATFORM_THUMB = BRANDED.platformLaptop;
export const HOME_TESTIMONIALS_BG = BRANDED.studentsCollab;

/** Primary homepage hero — 1:1 tutoring session */
export const HOME_HERO_STUDENT_IMAGE = BRANDED.tutoringSession;

/** Home hero carousel — all branded lifestyle photos */
export const HOME_HERO_CAROUSEL_IMAGES = [
  BRANDED.studyDesk,
  BRANDED.tutoringSession,
  BRANDED.studentsCollab,
  BRANDED.studentsGroup4,
  BRANDED.subjectBooks,
  BRANDED.platformLaptop,
  BRANDED.progressDashboard,
  BRANDED.privacySecure,
] as const;

export const HERO_STUDY_IMAGE = BRANDED.platformLaptop;
export const HERO_DESK_IMAGE = BRANDED.studyDesk;

export const PROGRAM_CARD_IMAGES = [
  BRANDED.tutoringSession,
  BRANDED.studentsCollab,
  BRANDED.subjectBooks,
  BRANDED.platformLaptop,
] as const;

export const PROGRAMS_PAGE_CARD_IMAGES = [
  BRANDED.tutoringSession,
  BRANDED.studentsCollab,
  BRANDED.subjectBooks,
  BRANDED.platformLaptop,
] as const;

export const SUBJECTS_HERO_IMAGE = BRANDED.subjectBooks;

/** Team portrait fallbacks when CMS has no photo — branded lifestyle shots */
export const ABOUT_TEAM_IMAGES = [
  BRANDED.tutoringSession,
  BRANDED.studentsGroup4,
  BRANDED.platformLaptop,
  BRANDED.studyDesk,
  BRANDED.studentsGroup3,
] as const;

/** Login page social-proof avatars — cropped branded photos */
export const LOGIN_AVATAR_IMAGES = [
  BRANDED.studentsGroup3,
  BRANDED.studentsCollab,
  BRANDED.studentsGroup4,
] as const;

const SUBJECT_CARD_PHOTO = BRANDED.subjectBooks;

export const SUBJECT_IMAGE_BY_ID: Record<string, string> = {
  math: SUBJECT_CARD_PHOTO,
  english: SUBJECT_CARD_PHOTO,
  german: SUBJECT_CARD_PHOTO,
  physics: SUBJECT_CARD_PHOTO,
  chemistry: SUBJECT_CARD_PHOTO,
  biology: BRANDED.studyDesk,
  business: BRANDED.platformLaptop,
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
