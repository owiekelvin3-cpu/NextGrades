"use client";

import { useState, useEffect, useMemo } from "react";
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
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TeacherSidebarNav } from "@/components/dashboard/teacher/TeacherSidebarNav";
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
  { href: "/dashboard/admin", icon: LayoutDashboard },
  { href: "/dashboard/admin/website-content", icon: Layout },
  { href: "/dashboard/admin/students", icon: Users },
  { href: "/dashboard/admin/teachers", icon: Users },
  { href: "/dashboard/admin/users", icon: Shield },
  { href: "/dashboard/admin/notifications", icon: Sparkles, badge: "notifications" as const },
  { href: "/dashboard/admin/quiz-monitor", icon: ListChecks },
  { href: "/dashboard/admin/moderation", icon: Shield },
  { href: "/dashboard/admin/memberships", icon: Shield },
  { href: "/dashboard/admin/payments", icon: DollarSign },
  { href: "/dashboard/admin/resources", icon: FileText },
  { href: "/dashboard/admin/chatbot", icon: Sparkles },
  { href: "/dashboard/admin/analytics", icon: TrendingUp },
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
    return config.map((item, index) => ({
      ...item,
      label: labels[index]?.label ?? "",
    }));
  }, [role, studentLabels, teacherLabels, adminLabels]);

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
    if (href === "/dashboard/teacher" || href === "/dashboard/student" || href === "/dashboard/admin") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsMobileMenuOpen?.(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4AF37]">
            <span className="text-base font-bold text-[#0D1B2A]">NG</span>
          </div>
          <span className={cn("text-base font-semibold tracking-tight", darkSidebar ? "text-white" : "text-[#0D1B2A]")}>
            {t("common.brand")}
          </span>
        </Link>
      </div>

      {isTeacher && (
        <div className="mb-5 flex items-center gap-3 px-1">
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
            <p className="text-xs text-gray-500">{t("teacherDashboard.sidebarRole")}</p>
          </div>
        </div>
      )}

      {isStudent && studentFirst && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20 text-sm font-bold text-[#D4AF37]">
            {studentFirst.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {t("studentDashboard.sidebarHello", { name: studentFirst, defaultValue: `Hi, ${studentFirst}!` })}
            </p>
            <p className="text-xs text-gray-400">
              {t("studentDashboard.sidebarRole", { defaultValue: "Student" })}
            </p>
          </div>
        </div>
      )}

      {isTeacher ? (
        <TeacherSidebarNav
          unreadNotifications={badgeCount}
          onNavigate={() => setIsMobileMenuOpen?.(false)}
        />
      ) : (
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {links.map((link, index) => {
            const isActive = isLinkActive(link.href);
            const showBadge = "badge" in link && link.badge === "notifications" && badgeCount > 0;
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

      <div className={cn("pt-4", darkSidebar ? "border-t border-white/10" : "border-t border-gray-100")}>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all",
            darkSidebar
              ? "text-gray-300 hover:bg-white/10 hover:text-white"
              : "text-gray-600 hover:bg-gray-50 hover:text-[#0D1B2A]"
          )}
        >
          <LogOut className="h-5 w-5" />
          <span>{t("dashboardNav.logout")}</span>
        </button>
      </div>
    </>
  );
}

export function Sidebar({
  role,
  studentName,
  teacherName,
  teacherAvatarUrl,
  unreadNotifications = 0,
}: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isDashboardShell = role === "teacher" || role === "student";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sidebarClass = isDashboardShell
    ? "bg-[#0D1B2A] text-white"
    : "bg-white text-[#0D1B2A] border-r border-gray-100";

  if (isMobile) {
    return (
      <>
        <div
          className={cn(
            "fixed left-0 right-0 top-0 z-40 flex items-center justify-between p-4",
            isDashboardShell ? "border-b border-white/10 bg-[#0D1B2A]" : "border-b border-gray-100 bg-white"
          )}
        >
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]">
              <span className="text-xl font-bold text-[#0D1B2A]">NG</span>
            </div>
            <span className={cn("text-xl font-bold", isDashboardShell ? "text-white" : "text-[#0D1B2A]")}>
              NextGrades
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn("rounded-lg p-2", isDashboardShell ? "text-white" : "text-[#0D1B2A]")}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className={cn("fixed left-0 top-0 z-50 flex max-h-screen w-[260px] flex-col overflow-hidden px-4 py-6", sidebarClass)}>
              <SidebarContent
                role={role}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                studentName={studentName}
                teacherName={teacherName}
                teacherAvatarUrl={teacherAvatarUrl}
                unreadNotifications={unreadNotifications}
                darkSidebar={isDashboardShell}
              />
            </aside>
          </>
        )}
      </>
    );
  }

  return (
    <aside className={cn("flex max-h-screen w-[240px] shrink-0 flex-col overflow-hidden px-4 py-6", sidebarClass)}>
      <SidebarContent
        role={role}
        studentName={studentName}
        teacherName={teacherName}
        teacherAvatarUrl={teacherAvatarUrl}
        unreadNotifications={unreadNotifications}
        darkSidebar={isDashboardShell}
      />
    </aside>
  );
}
