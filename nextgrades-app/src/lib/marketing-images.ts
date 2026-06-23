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
  /** Three students with branded NextGrades hoodies — shared hero (Start, Programme, Fächer) */
  heroStudentsBranded: "/images/marketing/hero-students-nextgrades.png",
  /** Three students collaborating with laptop — legacy marketing hero */
  heroStudentsCollab: "/images/marketing/hero-students-collab.png",
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

/** Shared hero photo — Start (home), Programme, Fächer */
export const SHARED_PAGE_HERO_IMAGE = BRANDED.heroStudentsBranded;

export const CONTACT_HERO_IMAGE = BRANDED.studyDesk;
export const PROGRAMS_HERO_IMAGE = SHARED_PAGE_HERO_IMAGE;
export const CONSULTATION_HERO_IMAGE = BRANDED.tutoringSession;
export const CAREERS_HERO_IMAGE = BRANDED.studentsGroup4;
export const HELP_HERO_IMAGE = BRANDED.platformLaptop;
export const RESOURCES_HERO_IMAGE = BRANDED.studentsGroup3;
export const LOGIN_HERO_IMAGE = BRANDED.tutoringSession;
export const PRIVACY_HERO_IMAGE = BRANDED.privacySecure;
export const HOME_PLATFORM_THUMB = BRANDED.progressDashboard;
export const HOME_TESTIMONIALS_BG = BRANDED.studentsCollab;

/** Primary homepage hero — branded students collaborating */
export const HOME_HERO_STUDENT_IMAGE = SHARED_PAGE_HERO_IMAGE;

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

export const PRICING_HERO_IMAGE = BRANDED.platformLaptop;

export const PRICING_PLAN_IMAGES = PROGRAMS_PAGE_CARD_IMAGES;

export const SUBJECTS_HERO_IMAGE = SHARED_PAGE_HERO_IMAGE;

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

const SUBJECT_PHOTO_PARAMS = "auto=format&fit=crop&w=800&h=500&q=80";

/** Curated Unsplash photos — one distinct image per subject on /subjects */
function subjectPhoto(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?${SUBJECT_PHOTO_PARAMS}`;
}

export const SUBJECT_ONLINE_IMAGES = {
  math: subjectPhoto("photo-1635070041078-e363dbe005cb"),
  german: subjectPhoto("photo-1456513080510-7bf3a84b82f8"),
  english: subjectPhoto("photo-1544716278-ca5e3f4abd8c"),
  french: subjectPhoto("photo-1502602898657-3e91760cbb34"),
  italian: subjectPhoto("photo-1552832230-c0197dd311b5"),
  latin: subjectPhoto("photo-1551882547-ff40c63fe5fa"),
  chemistry: subjectPhoto("photo-1532094349884-543bc11b234d"),
  physics: subjectPhoto("photo-1567427017947-545c5f8d16ad"),
  biology: subjectPhoto("photo-1582719471384-894fbb16e074"),
  accounting: subjectPhoto("photo-1554224155-6726b3ff858f"),
  business: subjectPhoto("photo-1556761175-5973dc0f32e7"),
  "business-admin": subjectPhoto("photo-1460925895917-afdab827c52f"),
  "computer-science": subjectPhoto("photo-1517694712202-14dd9538aa97"),
  "technical-drawing": subjectPhoto("photo-1503387762-592deb58ef4e"),
} as const;

export const SUBJECT_IMAGE_BY_ID: Record<string, string> = {
  ...SUBJECT_ONLINE_IMAGES,
};

const SUBJECT_ALIASES: Record<string, string> = {
  mathematik: "math",
  englisch: "english",
  deutsch: "german",
  physik: "physics",
  chemie: "chemistry",
  biologie: "biology",
  wirtschaft: "business",
  franzoesisch: "french",
  französisch: "french",
  italienisch: "italian",
  latein: "latin",
  rechnungswesen: "accounting",
  betriebswirtschaft: "business-admin",
  bwl: "business-admin",
  informatik: "computer-science",
};

export function normalizeSubjectKey(slugOrName?: string | null): string {
  if (!slugOrName) return "";
  const key = slugOrName.toLowerCase().replace(/\s+/g, "-");
  return SUBJECT_ALIASES[key] ?? key;
}

export const SUBJECT_CARD_IMAGES = [
  SUBJECT_ONLINE_IMAGES.math,
  SUBJECT_ONLINE_IMAGES.english,
  SUBJECT_ONLINE_IMAGES.german,
  SUBJECT_ONLINE_IMAGES.physics,
  SUBJECT_ONLINE_IMAGES.chemistry,
] as const;

export function getSubjectImage(subjectId: string, index = 0): string {
  const key = normalizeSubjectKey(subjectId);
  return SUBJECT_IMAGE_BY_ID[key] ?? SUBJECT_CARD_IMAGES[index] ?? HERO_STUDY_IMAGE;
}

export function isLocalImageSrc(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//");
}
