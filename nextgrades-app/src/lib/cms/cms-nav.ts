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
  type LucideIcon,
} from "lucide-react";
import { ADMIN_PORTAL_PREFIX } from "@/lib/admin/portal-paths";

const BASE = `${ADMIN_PORTAL_PREFIX}/website-content`;

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
  { id: "subjects-data", label: "Subject cards", href: `${BASE}/subjects`, icon: BookOpen },
  { id: "pricing-data", label: "Pricing plans", href: `${BASE}/pricing`, icon: CreditCard },
  { id: "resources-data", label: "Resource library", href: `${BASE}/resources`, icon: FolderOpen },
  { id: "navigation", label: "Navigation", href: `${BASE}/navigation`, icon: Menu },
  { id: "media", label: "Media library", href: `${BASE}/media`, icon: ImageIcon },
  { id: "seo", label: "SEO settings", href: `${BASE}/seo`, icon: Search },
  { id: "theme", label: "Theme settings", href: `${BASE}/theme`, icon: Palette },
  { id: "history", label: "Version history", href: `${BASE}/history`, icon: History },
];

export const CMS_HUB_HREF = BASE;
