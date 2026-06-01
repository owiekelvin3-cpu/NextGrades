import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  Bell,
  ListChecks,
  Shield,
  CreditCard,
  DollarSign,
  FileText,
  Bot,
  BarChart3,
  Video,
  Layout,
} from "lucide-react";
import { studentNavItems } from "@/components/dashboard/student/StudentSidebarNav";
import { teacherNavItems } from "@/components/dashboard/teacher/TeacherSidebarNav";
import { ADMIN_PORTAL_HOME, ADMIN_PORTAL_PREFIX } from "@/lib/admin/portal-paths";

export type DashboardMenuItem = {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  badge?: "notifications";
  matchPrefix?: boolean;
};

const adminMenuItems: DashboardMenuItem[] = [
  { href: ADMIN_PORTAL_HOME, icon: LayoutDashboard, labelKey: "adminNav.dashboard" },
  {
    href: `${ADMIN_PORTAL_PREFIX}/website-content`,
    icon: Layout,
    labelKey: "adminNav.websiteContent",
    matchPrefix: true,
  },
  {
    href: `${ADMIN_PORTAL_PREFIX}/students`,
    icon: Users,
    labelKey: "adminNav.students",
    matchPrefix: true,
  },
  {
    href: `${ADMIN_PORTAL_PREFIX}/teachers`,
    icon: GraduationCap,
    labelKey: "adminNav.teachers",
    matchPrefix: true,
  },
  {
    href: `${ADMIN_PORTAL_PREFIX}/users`,
    icon: UserCog,
    labelKey: "adminNav.users",
    matchPrefix: true,
  },
  {
    href: `${ADMIN_PORTAL_PREFIX}/notifications`,
    icon: Bell,
    labelKey: "adminNav.notifications",
    badge: "notifications",
    matchPrefix: true,
  },
  {
    href: `${ADMIN_PORTAL_PREFIX}/quiz-monitor`,
    icon: ListChecks,
    labelKey: "adminNav.quizMonitor",
    matchPrefix: true,
  },
  {
    href: `${ADMIN_PORTAL_PREFIX}/moderation`,
    icon: Shield,
    labelKey: "adminNav.moderation",
    matchPrefix: true,
  },
  {
    href: `${ADMIN_PORTAL_PREFIX}/memberships`,
    icon: CreditCard,
    labelKey: "adminNav.memberships",
    matchPrefix: true,
  },
  {
    href: `${ADMIN_PORTAL_PREFIX}/payments`,
    icon: DollarSign,
    labelKey: "adminNav.payments",
    matchPrefix: true,
  },
  {
    href: `${ADMIN_PORTAL_PREFIX}/resources`,
    icon: FileText,
    labelKey: "adminNav.resources",
    matchPrefix: true,
  },
  { href: `${ADMIN_PORTAL_PREFIX}/chatbot`, icon: Bot, labelKey: "adminNav.chatbot", matchPrefix: true },
  {
    href: `${ADMIN_PORTAL_PREFIX}/analytics`,
    icon: BarChart3,
    labelKey: "adminNav.analytics",
    matchPrefix: true,
  },
  { href: `${ADMIN_PORTAL_PREFIX}/zoom`, icon: Video, labelKey: "adminNav.zoom", matchPrefix: true },
];

export function getDashboardMenuItems(role: "student" | "teacher" | "admin"): DashboardMenuItem[] {
  if (role === "student") return studentNavItems;
  if (role === "teacher") return teacherNavItems;
  return adminMenuItems;
}

export function isDashboardMenuItemActive(pathname: string, item: DashboardMenuItem): boolean {
  if (item.href === "/dashboard/student" || item.href === "/dashboard/teacher" || item.href === ADMIN_PORTAL_HOME) {
    return pathname === item.href;
  }
  if (item.matchPrefix) return pathname === item.href || pathname.startsWith(`${item.href}/`);
  return pathname === item.href;
}
