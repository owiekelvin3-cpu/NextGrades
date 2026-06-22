import {
  BarChart3,
  Bell,
  Bot,
  Cookie,
  CreditCard,
  DollarSign,
  FileText,
  Globe,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Shield,
  UserCog,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_CMS_PREFIX, ADMIN_PORTAL_HOME, ADMIN_PORTAL_PREFIX } from "@/lib/admin/portal-paths";

export type AdminNavItem = {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  badge?: "notifications";
};

export type AdminNavSection = {
  id: string;
  labelKey: string;
  items: AdminNavItem[];
};

const P = ADMIN_PORTAL_PREFIX;

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    id: "overview",
    labelKey: "adminNav.sectionOverview",
    items: [
      { href: ADMIN_PORTAL_HOME, icon: LayoutDashboard, labelKey: "adminNav.dashboard" },
      { href: ADMIN_CMS_PREFIX, icon: Globe, labelKey: "adminNav.websiteContent" },
    ],
  },
  {
    id: "platform",
    labelKey: "adminNav.sectionPlatform",
    items: [
      { href: `${P}/users`, icon: UserCog, labelKey: "adminNav.users" },
      { href: `${P}/students`, icon: Users, labelKey: "adminNav.students" },
      { href: `${P}/teachers`, icon: GraduationCap, labelKey: "adminNav.teachers" },
      { href: `${P}/payments`, icon: DollarSign, labelKey: "adminNav.payments" },
      { href: `${P}/memberships`, icon: CreditCard, labelKey: "adminNav.memberships" },
      { href: `${P}/moderation`, icon: Shield, labelKey: "adminNav.moderation" },
      { href: `${P}/notifications`, icon: Bell, labelKey: "adminNav.notifications", badge: "notifications" },
    ],
  },
  {
    id: "insights",
    labelKey: "adminNav.sectionInsights",
    items: [
      { href: `${P}/analytics`, icon: BarChart3, labelKey: "adminNav.analytics" },
      { href: `${P}/quiz-monitor`, icon: ListChecks, labelKey: "adminNav.quizMonitor" },
      { href: `${P}/chatbot`, icon: Bot, labelKey: "adminNav.chatbot" },
      { href: `${P}/zoom`, icon: Video, labelKey: "adminNav.zoom" },
    ],
  },
  {
    id: "system",
    labelKey: "adminNav.sectionSystem",
    items: [
      { href: `${P}/security`, icon: Shield, labelKey: "adminNav.security" },
      { href: `${P}/cookies`, icon: Cookie, labelKey: "adminNav.cookies" },
      { href: `${P}/resources`, icon: FileText, labelKey: "adminNav.resources" },
    ],
  },
];

export const ADMIN_QUICK_ACTIONS = ADMIN_NAV_SECTIONS.flatMap((section) => section.items).filter(
  (item) => item.href !== ADMIN_PORTAL_HOME
);
