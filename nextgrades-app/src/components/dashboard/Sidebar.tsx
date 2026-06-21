"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  FileText,
  Users,
  DollarSign,
  Shield,
  LayoutDashboard,
  Layout,
  ListChecks,
  Sparkles,
  Video,
  Bell,
  UserCog,
  CreditCard,
  Bot,
  BarChart3,
  GraduationCap,
  Cookie,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { BrandLogo } from "@/components/BrandLogo";
import { dashboardHomeForRole } from "@/lib/brand";
import { ADMIN_PORTAL_HOME, ADMIN_PORTAL_PREFIX } from "@/lib/admin/portal-paths";
import { BackToHomeLink } from "@/components/dashboard/BackToHomeLink";
import { TeacherSidebarNav } from "@/components/dashboard/teacher/TeacherSidebarNav";
import { StudentSidebarNav } from "@/components/dashboard/student/StudentSidebarNav";
import { SidebarToggle } from "@/components/dashboard/SidebarToggle";
import { useSidebar, SIDEBAR_WIDTH } from "@/context/SidebarContext";
import { useNotificationsOptional } from "@/context/NotificationContext";
import { supabase } from "@/lib/supabase/client";
import { getTeacherFirstName } from "@/lib/dashboard/teacher-overview";

interface SidebarProps {
  role: "student" | "teacher" | "admin";
  studentName?: string;
  teacherName?: string;
  teacherAvatarUrl?: string | null;
  unreadNotifications?: number;
}

interface SidebarContentProps {
  role: "student" | "teacher" | "admin";
  setIsMobileMenuOpen?: (open: boolean) => void;
  studentName?: string;
  teacherName?: string;
  teacherAvatarUrl?: string | null;
  unreadNotifications?: number;
}

const studentConfig = [
  { href: "/dashboard/student", icon: LayoutDashboard },
  { href: "/dashboard/student/courses", icon: BookOpen },
  { href: "/dashboard/student/appointments", icon: Calendar },
  { href: "/dashboard/student/resources", icon: FileText },
  { href: "/dashboard/student/quizzes", icon: ListChecks },
  { href: "/dashboard/student/progress", icon: TrendingUp },
  { href: "/dashboard/notifications", icon: Sparkles, badge: "notifications" as const },
  { href: "/dashboard/chat", icon: Sparkles },
  { href: "/dashboard/student/settings", icon: Settings },
];

const teacherConfig = [
  { href: "/dashboard/teacher", icon: LayoutDashboard },
  { href: "/dashboard/teacher/students", icon: Users },
  { href: "/dashboard/teacher/schedule", icon: Calendar },
  { href: "/dashboard/teacher/resources", icon: FileText },
  { href: "/dashboard/teacher/ai-generator", icon: Sparkles },
  { href: "/dashboard/teacher/content", icon: Layout },
  { href: "/dashboard/teacher/analytics", icon: TrendingUp },
  { href: "/dashboard/teacher/earnings", icon: DollarSign },
  { href: "/dashboard/chat", icon: Sparkles, badge: "notifications" as const },
  { href: "/dashboard/teacher/settings", icon: Settings },
];

const adminConfig = [
  { href: ADMIN_PORTAL_HOME, icon: LayoutDashboard, labelKey: "adminNav.dashboard" },
  { href: `${ADMIN_PORTAL_PREFIX}/students`, icon: Users, labelKey: "adminNav.students" },
  { href: `${ADMIN_PORTAL_PREFIX}/teachers`, icon: GraduationCap, labelKey: "adminNav.teachers" },
  { href: `${ADMIN_PORTAL_PREFIX}/users`, icon: UserCog, labelKey: "adminNav.users" },
  { href: `${ADMIN_PORTAL_PREFIX}/notifications`, icon: Bell, labelKey: "adminNav.notifications", badge: "notifications" as const },
  { href: `${ADMIN_PORTAL_PREFIX}/quiz-monitor`, icon: ListChecks, labelKey: "adminNav.quizMonitor" },
  { href: `${ADMIN_PORTAL_PREFIX}/moderation`, icon: Shield, labelKey: "adminNav.moderation" },
  { href: `${ADMIN_PORTAL_PREFIX}/memberships`, icon: CreditCard, labelKey: "adminNav.memberships" },
  { href: `${ADMIN_PORTAL_PREFIX}/payments`, icon: DollarSign, labelKey: "adminNav.payments" },
  { href: `${ADMIN_PORTAL_PREFIX}/resources`, icon: FileText, labelKey: "adminNav.resources" },
  { href: `${ADMIN_PORTAL_PREFIX}/chatbot`, icon: Bot, labelKey: "adminNav.chatbot" },
  { href: `${ADMIN_PORTAL_PREFIX}/analytics`, icon: BarChart3, labelKey: "adminNav.analytics" },
  { href: `${ADMIN_PORTAL_PREFIX}/zoom`, icon: Video, labelKey: "adminNav.zoom" },
  { href: `${ADMIN_PORTAL_PREFIX}/cookies`, icon: Cookie, labelKey: "adminNav.cookies" },
];

function SidebarContent({
  role,
  setIsMobileMenuOpen,
  studentName,
  teacherName,
  teacherAvatarUrl,
  unreadNotifications = 0,
  darkSidebar = false,
}: SidebarContentProps & { darkSidebar?: boolean }) {
  const notifCtx = useNotificationsOptional();
  const badgeCount = notifCtx?.unreadCount ?? unreadNotifications;
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  const studentLabels = useLocalizedContent<{ label: string }[]>("dashboardNav.student");
  const teacherLabels = useLocalizedContent<{ label: string }[]>("dashboardNav.teacher");
  const adminLabels = useLocalizedContent<{ label: string }[]>("dashboardNav.admin");

  const links = useMemo(() => {
    const config =
      role === "student" ? studentConfig : role === "teacher" ? teacherConfig : adminConfig;
    const labels =
      role === "student" ? studentLabels : role === "teacher" ? teacherLabels : adminLabels;
    return config.map((item, index) => {
      const adminItem = item as (typeof adminConfig)[number];
      const label =
        role === "admin" && "labelKey" in adminItem && adminItem.labelKey
          ? t(adminItem.labelKey)
          : labels[index]?.label ?? "";
      return { ...item, label };
    });
  }, [role, studentLabels, teacherLabels, adminLabels, t]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const teacherDisplay = teacherName?.trim() ? getTeacherFirstName(teacherName) : "";
  const studentFirst = studentName?.trim().split(/\s+/)[0] ?? "";

  const isLinkActive = (href: string) => {
    if (href.includes("#")) {
      const base = href.split("#")[0];
      return pathname === base || pathname.startsWith(base + "/");
    }
    if (href === "/dashboard/teacher" || href === "/dashboard/student" || href === ADMIN_PORTAL_HOME) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-5 shrink-0 px-1">
        <BrandLogo
          href={dashboardHomeForRole(role)}
          onDarkBackground={darkSidebar}
          size="lg"
          onClick={() => setIsMobileMenuOpen?.(false)}
        />
      </div>

      {isTeacher && (
        <div className="mb-4 flex shrink-0 items-center gap-3 px-1">
          {teacherAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={teacherAvatarUrl}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white/10"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20 text-sm font-bold text-[#D4AF37]">
              {(teacherDisplay || "T").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {teacherDisplay
                ? t("teacherDashboard.sidebarHello", { name: teacherDisplay })
                : t("teacherDashboard.sidebarGuest")}
            </p>
          </div>
        </div>
      )}

      {isStudent && studentFirst && (
        <div className="mb-4 shrink-0 px-1">
          <p className="truncate text-sm font-semibold text-white">
            {t("studentDashboard.sidebarHello", { name: studentFirst, defaultValue: `Hi, ${studentFirst}!` })}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">{t("studentDashboard.overviewTitle", { defaultValue: "Overview" })}</p>
        </div>
      )}

      {isTeacher ? (
        <TeacherSidebarNav
          unreadNotifications={badgeCount}
          onNavigate={() => setIsMobileMenuOpen?.(false)}
        />
      ) : isStudent ? (
        <StudentSidebarNav
          unreadNotifications={badgeCount}
          onNavigate={() => setIsMobileMenuOpen?.(false)}
        />
      ) : (
        <nav className="min-h-0 flex-1 space-y-1 overflow-hidden">
          {links.map((link, index) => {
            const isActive = isLinkActive(link.href);
            const showBadge = "badge" in link && link.badge === "notifications" && badgeCount > 0;
            const isHighlight = "highlight" in link && link.highlight;
            return (
              <Link
                key={`${link.href}-${index}`}
                href={link.href}
                onClick={() => setIsMobileMenuOpen?.(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200",
                  isActive
                    ? darkSidebar
                      ? "bg-[#D4AF37]/15 font-semibold text-[#D4AF37] ring-1 ring-[#D4AF37]/30"
                      : "bg-[#D4AF37] font-semibold text-[#0D1B2A]"
                    : isHighlight
                      ? darkSidebar
                        ? "font-medium text-[#D4AF37]/90 ring-1 ring-[#D4AF37]/25 hover:bg-[#D4AF37]/10"
                        : "font-medium text-[#9A7B1A] ring-1 ring-[#D4AF37]/30 hover:bg-[#D4AF37]/10"
                      : darkSidebar
                        ? "text-gray-300 hover:bg-white/10 hover:text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#0D1B2A]"
                )}
              >
                <link.icon className={cn("h-5 w-5 shrink-0", isActive && "text-[#D4AF37]")} />
                <span className="flex-1">{link.label}</span>
                {showBadge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4AF37] px-1.5 text-[10px] font-bold text-[#0D1B2A]">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      )}

      <div className={cn("mt-auto shrink-0 space-y-1 pt-3", darkSidebar ? "border-t border-white/10" : "border-t border-gray-100")}>
        <BackToHomeLink darkSidebar={darkSidebar} onNavigate={() => setIsMobileMenuOpen?.(false)} />
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-all",
            darkSidebar
              ? "text-gray-300 hover:bg-white/10 hover:text-white"
              : "text-gray-600 hover:bg-gray-50 hover:text-[#0D1B2A]"
          )}
        >
          <LogOut className="h-5 w-5" />
          <span>{t("dashboardNav.logout")}</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar({
  role,
  studentName,
  teacherName,
  teacherAvatarUrl,
  unreadNotifications = 0,
}: SidebarProps) {
  const { theme } = useTheme();
  const { collapsed } = useSidebar();
  const useDarkSidebar =
    role === "teacher" || role === "student" || role === "admin" || theme === "dark";

  const sidebarClass = useDarkSidebar
    ? "bg-[var(--sidebar-background)] text-[var(--sidebar-text-active)]"
    : "border-r border-border-default bg-surface-elevated text-foreground";

  return (
    <>
      <aside
        className={cn(
          "hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:flex-col md:overflow-hidden",
          "transition-[width,box-shadow] duration-300 ease-out",
          sidebarClass,
          collapsed ? "shadow-none" : "shadow-[4px_0_24px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.35)]"
        )}
        style={{ width: collapsed ? 0 : SIDEBAR_WIDTH }}
        aria-hidden={collapsed}
      >
        <div
          className={cn(
            "flex h-full w-[260px] flex-col overflow-hidden px-4 py-5",
            collapsed && "pointer-events-none opacity-0"
          )}
        >
          <SidebarContent
            role={role}
            studentName={studentName}
            teacherName={teacherName}
            teacherAvatarUrl={teacherAvatarUrl}
            unreadNotifications={unreadNotifications}
            darkSidebar={useDarkSidebar}
          />
        </div>
      </aside>
      <SidebarToggle />
    </>
  );
}
