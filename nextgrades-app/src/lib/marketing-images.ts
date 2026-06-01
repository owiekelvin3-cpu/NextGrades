/**
 * Marketing images — CDN-hosted (Unsplash). No local content photos.
 * Brand logos remain in /public via @/lib/brand.ts only.
 */

function u(id: string, w = 800, h = 533, q = 75) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=${q}`;
}

function face(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&h=400&crop=faces&q=80`;
}

export const ONLINE_IMAGE_FALLBACK = u("1524178232363-1fb2b075b655", 1280, 720);
export const LOCAL_IMAGE_FALLBACK = ONLINE_IMAGE_FALLBACK;

export const ABOUT_IMAGES = {
  hero: u("1523240795612-9a054b0db644", 1200, 800),
  story: u("1497366216548-37526070297c", 1000, 700),
  mission: [
    u("1488190211103-e3e395f63f07", 700, 450),
    u("1456513080510-7bf3a84b82f8", 700, 450),
    u("1517486808906-6ca784374367", 700, 450),
    u("1524995993596-b08947747391", 700, 450),
  ] as const,
  promise: u("1581091215396-f3f4f1032d35", 1000, 700),
} as const;

export const CONTACT_HERO_IMAGE = u("1423666639047-7ec4463a33e8", 1200, 900);
export const PROGRAMS_HERO_IMAGE = u("1523050854548-600962526ae0", 1200, 800);
export const CONSULTATION_HERO_IMAGE = u("1606761568499-11d29da76008", 900, 1100);
export const CAREERS_HERO_IMAGE = u("1522071820081-009f0129c71c", 1200, 800);
export const LOGIN_HERO_IMAGE = u("1524178232363-1fb2b075b655", 1200, 900);
export const HOME_PLATFORM_THUMB = u("1513258496099-48168024aec0", 200, 200);
export const HOME_TESTIMONIALS_BG = u("1460925895917-afdab827c52f", 1280, 720);

export const HOME_HERO_STUDENT_IMAGE = u("1523240795612-9a054b0db644", 960, 720, 70);
export const HERO_STUDY_IMAGE = u("1524178232363-1fb2b075b655", 1280, 720);
export const HERO_DESK_IMAGE = u("1497366811353-6870744d04b2", 1280, 720);

export const PROGRAM_CARD_IMAGES = [
  u("1509062522246-3755977927d7", 800, 600),
  u("1427504494785-3a9ca7044f45", 800, 600),
  u("1516321318423-f06f85e504b3", 800, 600),
] as const;

export const PROGRAMS_PAGE_CARD_IMAGES = [
  u("1522071820081-009f0129c71c", 600, 400),
  u("1523240795612-9a054b0db644", 600, 400),
  u("1516321318423-f06f85e504b3", 600, 400),
] as const;

export const SUBJECTS_HERO_IMAGE = u("1522202176988-66273c2fd55f", 1200, 800);

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

export const SUBJECT_IMAGE_BY_ID: Record<string, string> = {
  math: u("1635070041078-e363dbe005cb", 800, 500),
  english: u("1517245386807-bb43f82c33c4", 800, 500),
  german: u("1481627834876-b7833e8f5570", 800, 500),
  physics: u("1532094349884-543bc11b234d", 800, 500),
  chemistry: u("1582719478250-c89cae4dc85b", 800, 500),
  biology: u("1530026405186-ed142f37545b", 800, 500),
  business: u("1454165804606-c3d57bc86b40", 800, 500),
  "computer-science": u("1517694712202-14dd9538aa97", 800, 500),
  "technical-drawing": u("1503387762-592deb58ef4e", 800, 500),
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
