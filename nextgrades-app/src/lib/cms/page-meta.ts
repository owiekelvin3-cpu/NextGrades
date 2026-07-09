import {
  Home,
  Info,
  GraduationCap,
  BookOpen,
  FolderOpen,
  CreditCard,
  Calendar,
  Mail,
  HelpCircle,
  Briefcase,
  Scale,
  Layout,
  LogIn,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { CMS_PAGE_PREVIEW_ROUTES } from "./page-routes";

export type CmsPageCategory = "main" | "contact" | "other";

export type CmsPageMeta = {
  id: string;
  label: string;
  description: string;
  category: CmsPageCategory;
  icon: LucideIcon;
  route: string;
};

export const CMS_PAGE_CATEGORIES: { id: CmsPageCategory; label: string }[] = [
  { id: "main", label: "Main pages" },
  { id: "contact", label: "Contact & support" },
  { id: "other", label: "Other pages" },
];

/** Human-friendly section titles inside the page editor. */
export const CMS_SECTION_LABELS: Record<string, string> = {
  hero: "Top banner (hero)",
  stats: "Statistics strip",
  features: "Feature highlights",
  programs: "Programs section",
  testimonials: "Testimonials",
  cta: "Call to action",
  footer: "Footer area",
  navbar: "Navigation bar",
  pricing: "Pricing section",
  faq: "Questions & answers",
  team: "Team section",
  story: "Our story",
  mission: "Mission section",
  promise: "Our promise",
  contact: "Contact section",
  form: "Contact form",
  general: "General text",
  images: "Images",
};

export const CMS_PAGES: CmsPageMeta[] = [
  {
    id: "home",
    label: "Homepage",
    description: "Main landing page visitors see first",
    category: "main",
    icon: Home,
    route: CMS_PAGE_PREVIEW_ROUTES.home,
  },
  {
    id: "about",
    label: "About",
    description: "Who you are and why families trust you",
    category: "main",
    icon: Info,
    route: CMS_PAGE_PREVIEW_ROUTES.about,
  },
  {
    id: "programs",
    label: "Programs",
    description: "Tutoring programs and learning paths",
    category: "main",
    icon: GraduationCap,
    route: CMS_PAGE_PREVIEW_ROUTES.programs,
  },
  {
    id: "subjects",
    label: "Subjects",
    description: "Subjects you teach",
    category: "main",
    icon: BookOpen,
    route: CMS_PAGE_PREVIEW_ROUTES.subjects,
  },
  {
    id: "resources",
    label: "Resources",
    description: "Learning materials hub",
    category: "main",
    icon: FolderOpen,
    route: CMS_PAGE_PREVIEW_ROUTES.resources,
  },
  {
    id: "pricing",
    label: "Pricing",
    description: "Plans and prices",
    category: "main",
    icon: CreditCard,
    route: CMS_PAGE_PREVIEW_ROUTES.pricing,
  },
  {
    id: "consultation",
    label: "Consultation",
    description: "Free consultation booking page",
    category: "contact",
    icon: Calendar,
    route: CMS_PAGE_PREVIEW_ROUTES.consultation,
  },
  {
    id: "contact",
    label: "Contact",
    description: "Contact form and details",
    category: "contact",
    icon: Mail,
    route: CMS_PAGE_PREVIEW_ROUTES.contact,
  },
  {
    id: "help",
    label: "Help & FAQ",
    description: "Help centre and common questions",
    category: "contact",
    icon: HelpCircle,
    route: CMS_PAGE_PREVIEW_ROUTES.help,
  },
  {
    id: "careers",
    label: "Careers",
    description: "Jobs and hiring",
    category: "other",
    icon: Briefcase,
    route: CMS_PAGE_PREVIEW_ROUTES.careers,
  },
  {
    id: "legal",
    label: "Privacy & Terms",
    description: "Legal pages",
    category: "other",
    icon: Scale,
    route: CMS_PAGE_PREVIEW_ROUTES.legal,
  },
  {
    id: "global",
    label: "Menu & Footer",
    description: "Site-wide navigation and footer text",
    category: "other",
    icon: Layout,
    route: CMS_PAGE_PREVIEW_ROUTES.global,
  },
  {
    id: "auth",
    label: "Login pages",
    description: "Sign-in and password reset screens",
    category: "other",
    icon: LogIn,
    route: CMS_PAGE_PREVIEW_ROUTES.auth,
  },
  {
    id: "features",
    label: "Features",
    description: "Platform feature highlights",
    category: "other",
    icon: Sparkles,
    route: CMS_PAGE_PREVIEW_ROUTES.features,
  },
  {
    id: "misc",
    label: "Other text",
    description: "Extra copy used across the site",
    category: "other",
    icon: Sparkles,
    route: CMS_PAGE_PREVIEW_ROUTES.misc,
  },
];

export function getCmsPageMeta(pageId: string): CmsPageMeta | undefined {
  return CMS_PAGES.find((p) => p.id === pageId);
}

export function friendlySectionLabel(sectionId: string, fallback: string): string {
  if (sectionId.startsWith("images-")) {
    const page = sectionId.replace("images-", "");
    return `${CMS_SECTION_LABELS.images} - ${page}`;
  }
  return CMS_SECTION_LABELS[sectionId] ?? fallback;
}
