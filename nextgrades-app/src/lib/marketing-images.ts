/** Verified Unsplash URLs used across marketing pages (404-checked). */

/** Student studying — homepage hero card (right column) */
export const HOME_HERO_STUDENT_IMAGE =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&h=900&q=85";

/** Full-width study scene — platform preview / hero backgrounds */
export const HERO_STUDY_IMAGE =
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80";

export const PROGRAM_CARD_IMAGES = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
] as const;

export const HERO_DESK_IMAGE =
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80";

export const SUBJECTS_HERO_IMAGE =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&h=800&q=85";

/** Subject card photos — order: math, english, german, physics, chemistry */
export const SUBJECT_IMAGE_BY_ID: Record<string, string> = {
  math: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&h=500&q=85",
  english: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&h=500&q=85",
  german: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&h=500&q=85",
  physics: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&h=500&q=85",
  chemistry: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&h=500&q=85",
  business: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&h=500&q=85",
  "computer-science": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&h=500&q=85",
  "technical-drawing": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&h=500&q=85",
};

export const SUBJECT_CARD_IMAGES = [
  SUBJECT_IMAGE_BY_ID.math,
  SUBJECT_IMAGE_BY_ID.english,
  SUBJECT_IMAGE_BY_ID.german,
  SUBJECT_IMAGE_BY_ID.physics,
  SUBJECT_IMAGE_BY_ID.chemistry,
] as const;

export function getSubjectImage(subjectId: string, index: number): string {
  return SUBJECT_IMAGE_BY_ID[subjectId] ?? SUBJECT_CARD_IMAGES[index] ?? SUBJECT_CARD_IMAGES[0];
}
