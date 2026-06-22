import {
  Home,
  GraduationCap,
  BookOpen,
  Info,
  FolderOpen,
  CreditCard,
  Mail,
  Menu,
  ImageIcon,
  Search,
  Palette,
  History,
  LayoutGrid,
  MessageSquareQuote,
  Users,
  HelpCircle,
  ListChecks,
  Sparkles,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_CMS_PREFIX } from "@/lib/admin/portal-paths";

const BASE = ADMIN_CMS_PREFIX;

export type CmsNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const CMS_SIDEBAR_PAGES: CmsNavItem[] = [
  { id: "home", label: "Home", href: `${BASE}/pages/home`, icon: Home },
  { id: "programs", label: "Programs", href: `${BASE}/pages/programs`, icon: GraduationCap },
  { id: "subjects", label: "Subjects", href: `${BASE}/pages/subjects`, icon: BookOpen },
  { id: "about", label: "About", href: `${BASE}/pages/about`, icon: Info },
  { id: "resources", label: "Resources", href: `${BASE}/pages/resources`, icon: FolderOpen },
  { id: "pricing", label: "Pricing", href: `${BASE}/pages/pricing`, icon: CreditCard },
  { id: "contact", label: "Contact", href: `${BASE}/pages/contact`, icon: Mail },
];

export const CMS_SIDEBAR_TOOLS: CmsNavItem[] = [
  { id: "programs-data", label: "Program cards", href: `${BASE}/programs`, icon: LayoutGrid, description: "Add, edit, reorder programs" },
  { id: "testimonials-data", label: "Testimonials", href: `${BASE}/testimonials`, icon: MessageSquareQuote },
  { id: "team-data", label: "Team members", href: `${BASE}/team`, icon: Users },
  { id: "faqs-data", label: "FAQs", href: `${BASE}/faqs`, icon: HelpCircle },
  { id: "subjects-data", label: "Subject cards", href: `${BASE}/subjects`, icon: BookOpen },
  { id: "pricing-data", label: "Pricing plans", href: `${BASE}/pricing`, icon: CreditCard },
  { id: "resources-data", label: "Resource library", href: `${BASE}/resources`, icon: FolderOpen },
  { id: "navigation", label: "Navigation", href: `${BASE}/navigation`, icon: Menu },
  { id: "media", label: "Media library", href: `${BASE}/media`, icon: ImageIcon },
  { id: "seo", label: "SEO settings", href: `${BASE}/seo`, icon: Search },
  { id: "theme", label: "Theme settings", href: `${BASE}/theme`, icon: Palette },
  { id: "history", label: "Version history", href: `${BASE}/history`, icon: History },
];

/** Spec-aligned CMS hub sections (sidebar grouping). */
export const CMS_SIDEBAR_SECTIONS: CmsNavItem[] = [
  { id: "pages-hub", label: "Pages", href: `${BASE}/pages`, icon: Home },
  { id: "tests-hub", label: "Tests & quizzes", href: `${BASE}/tests`, icon: ListChecks },
  { id: "subjects-data", label: "Subjects", href: `${BASE}/subjects`, icon: BookOpen },
  { id: "hero-hub", label: "Hero & landing", href: `${BASE}/hero`, icon: Sparkles },
  { id: "pricing-data", label: "Pricing", href: `${BASE}/pricing`, icon: CreditCard },
  { id: "testimonials-data", label: "Testimonials", href: `${BASE}/testimonials`, icon: MessageSquareQuote },
  { id: "faqs-data", label: "FAQs", href: `${BASE}/faqs`, icon: HelpCircle },
  { id: "blog-hub", label: "Blog", href: `${BASE}/blog`, icon: FileText },
  { id: "media", label: "Media", href: `${BASE}/media`, icon: ImageIcon },
  { id: "settings-hub", label: "Site settings", href: `${BASE}/settings`, icon: Palette },
];

export const CMS_HUB_HREF = BASE;
