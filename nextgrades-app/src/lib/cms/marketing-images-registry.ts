import {
  ABOUT_IMAGES,
  ABOUT_TEAM_IMAGES,
  CONTACT_HERO_IMAGE,
  PROGRAMS_HERO_IMAGE,
  PROGRAMS_PAGE_CARD_IMAGES,
  CONSULTATION_HERO_IMAGE,
  LOGIN_HERO_IMAGE,
  HOME_PLATFORM_THUMB,
  HOME_TESTIMONIALS_BG,
  HOME_HERO_STUDENT_IMAGE,
  HERO_STUDY_IMAGE,
  HERO_DESK_IMAGE,
  PROGRAM_CARD_IMAGES,
  SUBJECTS_HERO_IMAGE,
  SUBJECT_IMAGE_BY_ID,
} from "@/lib/marketing-images";
import type { FlatLocaleEntry } from "./flatten";

export type CmsImageRegistryItem = {
  key: string;
  label: string;
  pageGroup: string;
  defaultUrl: string;
};

export const CMS_IMAGE_REGISTRY: CmsImageRegistryItem[] = [
  { key: "cmsImages.home.heroStudent", label: "Home — Hero student photo", pageGroup: "home", defaultUrl: HOME_HERO_STUDENT_IMAGE },
  { key: "cmsImages.home.studyBanner", label: "Home — Platform preview banner", pageGroup: "home", defaultUrl: HERO_STUDY_IMAGE },
  { key: "cmsImages.home.desk", label: "Home — Desk / workspace", pageGroup: "home", defaultUrl: HERO_DESK_IMAGE },
  { key: "cmsImages.home.platformThumb", label: "Home — Progress card thumbnail", pageGroup: "home", defaultUrl: HOME_PLATFORM_THUMB },
  { key: "cmsImages.home.testimonialsBg", label: "Home — Testimonials background", pageGroup: "home", defaultUrl: HOME_TESTIMONIALS_BG },
  ...PROGRAM_CARD_IMAGES.map((url, i) => ({
    key: `cmsImages.home.programCard.${i}`,
    label: `Home — Program card ${i + 1}`,
    pageGroup: "home",
    defaultUrl: url,
  })),
  { key: "cmsImages.about.hero", label: "About — Hero image", pageGroup: "about", defaultUrl: ABOUT_IMAGES.hero },
  { key: "cmsImages.about.story", label: "About — Story section", pageGroup: "about", defaultUrl: ABOUT_IMAGES.story },
  ...ABOUT_IMAGES.mission.map((url, i) => ({
    key: `cmsImages.about.mission.${i}`,
    label: `About — Mission card ${i + 1}`,
    pageGroup: "about",
    defaultUrl: url,
  })),
  { key: "cmsImages.about.promise", label: "About — Promise section", pageGroup: "about", defaultUrl: ABOUT_IMAGES.promise },
  ...ABOUT_TEAM_IMAGES.map((url, i) => ({
    key: `cmsImages.about.team.${i}`,
    label: `About — Team member ${i + 1}`,
    pageGroup: "about",
    defaultUrl: url,
  })),
  { key: "cmsImages.programs.hero", label: "Programs — Hero image", pageGroup: "programs", defaultUrl: PROGRAMS_HERO_IMAGE },
  ...PROGRAMS_PAGE_CARD_IMAGES.map((url, i) => ({
    key: `cmsImages.programs.card.${i}`,
    label: `Programs — Card ${i + 1}`,
    pageGroup: "programs",
    defaultUrl: url,
  })),
  { key: "cmsImages.subjects.hero", label: "Subjects — Hero image", pageGroup: "subjects", defaultUrl: SUBJECTS_HERO_IMAGE },
  ...Object.entries(SUBJECT_IMAGE_BY_ID).map(([id, url]) => ({
    key: `cmsImages.subjects.${id}`,
    label: `Subjects — ${id} card`,
    pageGroup: "subjects",
    defaultUrl: url,
  })),
  { key: "cmsImages.contact.hero", label: "Contact — Hero image", pageGroup: "contact", defaultUrl: CONTACT_HERO_IMAGE },
  { key: "cmsImages.consultation.hero", label: "Consultation — Hero image", pageGroup: "consultation", defaultUrl: CONSULTATION_HERO_IMAGE },
  { key: "cmsImages.auth.loginHero", label: "Login — Side panel image", pageGroup: "auth", defaultUrl: LOGIN_HERO_IMAGE },
];

export function buildMarketingImageEntries(): FlatLocaleEntry[] {
  return CMS_IMAGE_REGISTRY.map((item) => ({
    i18nKey: item.key,
    pageGroup: item.pageGroup,
    fieldType: "image",
    valueEn: item.defaultUrl,
    valueDe: item.defaultUrl,
  }));
}

export function getCmsImageDefault(key: string): string | undefined {
  return CMS_IMAGE_REGISTRY.find((i) => i.key === key)?.defaultUrl;
}
