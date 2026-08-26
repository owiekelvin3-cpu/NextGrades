import {
  BookOpen,
  Calculator,
  Languages,
  FlaskConical,
  Atom,
  Leaf,
  Briefcase,
  Monitor,
  Globe,
  Library,
  BarChart3,
  Ruler,
  type LucideIcon,
} from "lucide-react";
import {
  RESOURCES_HUB_HERO,
  RESOURCES_SUBJECT_IMAGE_BY_ID,
  RESOURCES_DEFAULT_THUMBNAIL,
} from "@/lib/resources/images";

export type ResourceTabId =
  | "all"
  | "learning_materials"
  | "worksheets"
  | "videos"
  | "guides"
  | "exam_prep"
  | "mini_courses"
  | "formulas";

export const RESOURCE_TABS: { id: ResourceTabId; labelKey: string; contentTypes?: string[] }[] = [
  { id: "all", labelKey: "resourcesPage.tabs.0" },
  {
    id: "learning_materials",
    labelKey: "resourcesPage.tabs.1",
    contentTypes: ["learning_material", "document", "article", "presentation"],
  },
  {
    id: "worksheets",
    labelKey: "resourcesPage.tabs.2",
    contentTypes: ["practice_questions", "assignment", "workspace"],
  },
  {
    id: "videos",
    labelKey: "resourcesPage.tabs.3",
    contentTypes: ["video_course", "mini_course", "live_class", "webinar"],
  },
  { id: "guides", labelKey: "resourcesPage.tabs.4", contentTypes: ["guidebook"] },
  { id: "exam_prep", labelKey: "resourcesPage.tabs.5", contentTypes: ["exam_preparation"] },
  { id: "mini_courses", labelKey: "resourcesPage.tabs.6", contentTypes: ["mini_course", "full_course"] },
  { id: "formulas", labelKey: "resourcesPage.tabs.7", contentTypes: ["formula_sheet"] },
];

export const MATERIAL_TYPE_FILTERS = [
  { value: "pdf", labelKey: "resourcesPage.materialTypePdf", types: ["pdf_resource", "presentation", "document"] },
  { value: "worksheets", labelKey: "resourcesPage.materialTypeWorksheets", types: ["practice_questions", "assignment", "workspace"] },
  { value: "videos", labelKey: "resourcesPage.materialTypeVideos", types: ["video_course", "mini_course", "live_class", "webinar"] },
  { value: "summary", labelKey: "resourcesPage.materialTypeSummaries", types: ["learning_material", "article"] },
  { value: "formulas", labelKey: "resourcesPage.materialTypeFormulas", types: ["formula_sheet"] },
  { value: "exam_prep", labelKey: "resourcesPage.materialTypeExamPrep", types: ["exam_preparation"] },
];

export type SubjectUiConfig = {
  slug: string;
  icon: LucideIcon;
  color: string;
  heroImage: string;
};

export const SUBJECT_UI: Record<string, SubjectUiConfig> = {
  math: { slug: "math", icon: Calculator, color: "#3B82F6", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.math },
  mathematik: { slug: "math", icon: Calculator, color: "#3B82F6", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.math },
  english: { slug: "english", icon: Languages, color: "#8B5CF6", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.english },
  englisch: { slug: "english", icon: Languages, color: "#8B5CF6", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.english },
  german: { slug: "german", icon: BookOpen, color: "#EC4899", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.german },
  deutsch: { slug: "german", icon: BookOpen, color: "#EC4899", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.german },
  french: { slug: "french", icon: Languages, color: "#A855F7", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.french },
  franzoesisch: { slug: "french", icon: Languages, color: "#A855F7", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.french },
  "französisch": { slug: "french", icon: Languages, color: "#A855F7", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.french },
  italian: { slug: "italian", icon: Globe, color: "#22C55E", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.italian },
  italienisch: { slug: "italian", icon: Globe, color: "#22C55E", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.italian },
  latin: { slug: "latin", icon: Library, color: "#D97706", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.latin },
  latein: { slug: "latin", icon: Library, color: "#D97706", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.latin },
  physics: { slug: "physics", icon: Atom, color: "#F59E0B", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.physics },
  physik: { slug: "physics", icon: Atom, color: "#F59E0B", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.physics },
  chemistry: { slug: "chemistry", icon: FlaskConical, color: "#10B981", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.chemistry },
  chemie: { slug: "chemistry", icon: FlaskConical, color: "#10B981", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.chemistry },
  biology: { slug: "biology", icon: Leaf, color: "#22C55E", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.biology },
  biologie: { slug: "biology", icon: Leaf, color: "#22C55E", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.biology },
  business: { slug: "business", icon: Briefcase, color: "#6366F1", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.business },
  wirtschaft: { slug: "business", icon: Briefcase, color: "#6366F1", heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.business },
  accounting: {
    slug: "accounting",
    icon: Calculator,
    color: "#64748B",
    heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.accounting,
  },
  rechnungswesen: {
    slug: "accounting",
    icon: Calculator,
    color: "#64748B",
    heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID.accounting,
  },
  "business-admin": {
    slug: "business-admin",
    icon: BarChart3,
    color: "#6366F1",
    heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID["business-admin"],
  },
  betriebswirtschaft: {
    slug: "business-admin",
    icon: BarChart3,
    color: "#6366F1",
    heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID["business-admin"],
  },
  bwl: {
    slug: "business-admin",
    icon: BarChart3,
    color: "#6366F1",
    heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID["business-admin"],
  },
  "computer-science": {
    slug: "computer-science",
    icon: Monitor,
    color: "#0EA5E9",
    heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID["computer-science"],
  },
  informatik: {
    slug: "computer-science",
    icon: Monitor,
    color: "#0EA5E9",
    heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID["computer-science"],
  },
  "technical-drawing": {
    slug: "technical-drawing",
    icon: Ruler,
    color: "#94A3B8",
    heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID["technical-drawing"],
  },
  "technisches-zeichnen": {
    slug: "technical-drawing",
    icon: Ruler,
    color: "#94A3B8",
    heroImage: RESOURCES_SUBJECT_IMAGE_BY_ID["technical-drawing"],
  },
};

export const DEFAULT_SUBJECT_UI: SubjectUiConfig = {
  slug: "all",
  icon: BookOpen,
  color: "#D4AF37",
  heroImage: RESOURCES_DEFAULT_THUMBNAIL,
};

export function getSubjectUi(slugOrName?: string | null): SubjectUiConfig {
  if (!slugOrName) return DEFAULT_SUBJECT_UI;
  const key = slugOrName.toLowerCase().replace(/\s+/g, "-");
  return SUBJECT_UI[key] ?? DEFAULT_SUBJECT_UI;
}

export const HUB_HERO_IMAGE = RESOURCES_HUB_HERO;

export function tabContentTypes(tab: ResourceTabId): string[] | undefined {
  return RESOURCE_TABS.find((t) => t.id === tab)?.contentTypes;
}

export function isPremiumResource(r: { access_type?: string; is_premium?: boolean; locked?: boolean }) {
  return r.access_type === "premium" || r.is_premium === true;
}

export function isFreeResource(r: { access_type?: string; is_premium?: boolean }) {
  return !isPremiumResource(r);
}
