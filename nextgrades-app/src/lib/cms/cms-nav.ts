import {
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
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_CMS_PREFIX } from "@/lib/admin/portal-paths";
import { CMS_PAGES, CMS_PAGE_CATEGORIES, type CmsPageCategory } from "./page-meta";

const BASE = ADMIN_CMS_PREFIX;

export type CmsNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

/** All editable marketing pages - derived from page registry (single source of truth). */
export const CMS_SIDEBAR_PAGES: CmsNavItem[] = CMS_PAGES.map((page) => ({
  id: page.id,
  label: page.label,
  href: `${BASE}/pages/${page.id}`,
  icon: page.icon,
  description: page.description,
}));

export type CmsPageNavGroup = {
  id: CmsPageCategory;
  label: string;
  pages: CmsNavItem[];
};

export const CMS_PAGE_NAV_GROUPS: CmsPageNavGroup[] = CMS_PAGE_CATEGORIES.map((cat) => ({
  id: cat.id,
  label: cat.label,
  pages: CMS_SIDEBAR_PAGES.filter((p) => CMS_PAGES.find((m) => m.id === p.id)?.category === cat.id),
}));

/** Primary CMS sidebar - content editing first, site tools second. */
export const CMS_SIDEBAR_SECTIONS: CmsNavItem[] = [
  { id: "pages-hub", label: "All pages", href: `${BASE}/pages`, icon: LayoutGrid },
  { id: "media", label: "Media library", href: `${BASE}/media`, icon: ImageIcon },
  { id: "seo", label: "SEO", href: `${BASE}/seo`, icon: Search },
  { id: "theme", label: "Theme & branding", href: `${BASE}/theme`, icon: Palette },
  { id: "settings-hub", label: "Site settings", href: `${BASE}/settings`, icon: Settings },
  { id: "history", label: "Version history", href: `${BASE}/history`, icon: History },
];

/** Advanced structured content (cards, nav, blog) - separate from page text fields. */
export const CMS_SIDEBAR_TOOLS: CmsNavItem[] = [
  { id: "testimonials-data", label: "Testimonials", href: `${BASE}/testimonials`, icon: MessageSquareQuote },
  { id: "faqs-data", label: "FAQs", href: `${BASE}/faqs`, icon: HelpCircle },
  { id: "team-data", label: "Team members", href: `${BASE}/team`, icon: Users },
  { id: "programs-data", label: "Program cards", href: `${BASE}/programs`, icon: LayoutGrid },
  { id: "subjects-data", label: "Subject cards", href: `${BASE}/subjects`, icon: LayoutGrid },
  { id: "pricing-data", label: "Pricing plans", href: `${BASE}/pricing`, icon: LayoutGrid },
  { id: "navigation", label: "Navigation menu", href: `${BASE}/navigation`, icon: Menu },
  { id: "blog-hub", label: "Blog", href: `${BASE}/blog`, icon: FileText },
  { id: "tests-hub", label: "Tests & quizzes", href: `${BASE}/tests`, icon: ListChecks },
];

export const CMS_HUB_HREF = BASE;
