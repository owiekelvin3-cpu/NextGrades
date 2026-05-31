"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Bell,
  Settings,
  Users,
  Sparkles,
  FileText,
  Shield,
  type LucideIcon,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { useNotificationsOptional } from "@/context/NotificationContext";

type NavItem = {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  match?: (path: string) => boolean;
  badge?: "notifications";
};

const studentItems: NavItem[] = [
  {
    href: "/dashboard/student",
    icon: LayoutDashboard,
    labelKey: "mobileNav.home",
    match: (p) => p === "/dashboard/student",
  },
  {
    href: "/dashboard/student/courses",
    icon: BookOpen,
    labelKey: "mobileNav.courses",
    match: (p) => p.startsWith("/dashboard/student/courses"),
  },
  {
    href: "/dashboard/student/live-classes",
    icon: Video,
    labelKey: "mobileNav.liveClasses",
    match: (p) => p.startsWith("/dashboard/student/live-classes"),
  },
  {
    href: "/dashboard/chat",
    icon: Sparkles,
    labelKey: "mobileNav.ai",
    match: (p) => p.startsWith("/dashboard/chat"),
  },
  {
    href: "/dashboard/notifications",
    icon: Bell,
    labelKey: "mobileNav.notifications",
    badge: "notifications",
    match: (p) => p.startsWith("/dashboard/notifications"),
  },
  {
    href: "/dashboard/student/settings",
    icon: Settings,
    labelKey: "mobileNav.settings",
    match: (p) => p.startsWith("/dashboard/student/settings"),
  },
];

const teacherItems: NavItem[] = [
  {
    href: "/dashboard/teacher",
    icon: LayoutDashboard,
    labelKey: "mobileNav.home",
    match: (p) => p === "/dashboard/teacher",
  },
  {
    href: "/dashboard/teacher/students",
    icon: Users,
    labelKey: "mobileNav.students",
    match: (p) => p.startsWith("/dashboard/teacher/students"),
  },
  {
    href: "/dashboard/teacher/schedule",
    icon: Calendar,
    labelKey: "mobileNav.schedule",
    match: (p) => p.startsWith("/dashboard/teacher/schedule"),
  },
  {
    href: "/dashboard/notifications",
    icon: Bell,
    labelKey: "mobileNav.notifications",
    badge: "notifications",
    match: (p) => p.startsWith("/dashboard/notifications"),
  },
  {
    href: "/dashboard/teacher/settings",
    icon: Settings,
    labelKey: "mobileNav.settings",
    match: (p) => p.startsWith("/dashboard/teacher/settings"),
  },
];

const adminItems: NavItem[] = [
  {
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    labelKey: "mobileNav.home",
    match: (p) => p === "/dashboard/admin",
  },
  {
    href: "/dashboard/admin/users",
    icon: Shield,
    labelKey: "mobileNav.users",
    match: (p) => p.startsWith("/dashboard/admin/users"),
  },
  {
    href: "/dashboard/admin/students",
    icon: Users,
    labelKey: "mobileNav.students",
    match: (p) => p.startsWith("/dashboard/admin/students"),
  },
  {
    href: "/dashboard/admin/notifications",
    icon: Bell,
    labelKey: "mobileNav.notifications",
    badge: "notifications",
    match: (p) =>
      p.startsWith("/dashboard/admin/notifications") || p.startsWith("/dashboard/notifications"),
  },
  {
    href: "/dashboard/admin/website-content",
    icon: FileText,
    labelKey: "mobileNav.content",
    match: (p) => p.startsWith("/dashboard/admin/website-content"),
  },
];

function detectRole(pathname: string): "student" | "teacher" | "admin" | null {
  if (pathname.startsWith("/dashboard/teacher")) return "teacher";
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  if (pathname.startsWith("/dashboard/student") || pathname.startsWith("/dashboard/student/live-classes") || pathname === "/dashboard/notifications") return "student";
  if (pathname.startsWith("/dashboard/chat")) return "student";
  return null;
}

type Props = {
  role?: "student" | "teacher" | "admin";
};

function NavTab({
  item,
  active,
  label,
  unread,
  isDark,
  role,
}: {
  item: NavItem;
  active: boolean;
  label: string;
  unread: number;
  isDark: boolean;
  role: string;
}) {
  const Icon = item.icon;
  const showBadge = item.badge === "notifications" && unread > 0;

  return (
    <li className="min-w-0 flex-1">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className="group relative flex flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 transition-transform duration-150 active:scale-[0.94]"
      >
        {active && (
          <motion.span
            layoutId={`mobile-nav-indicator-${role}`}
            className="absolute inset-x-1 inset-y-0 rounded-2xl bg-[#D4AF37]/12 dark:bg-[#D4AF37]/18"
            transition={{ type: "spring", stiffness: 480, damping: 34 }}
          />
        )}

        <span
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200",
            active
              ? "text-[#D4AF37]"
              : isDark
                ? "text-gray-500 group-hover:text-gray-300"
                : "text-gray-400 group-hover:text-gray-600"
          )}
        >
          <Icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.25 : 1.85} aria-hidden />
          {showBadge && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-[#112240]">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>

        <span
          className={cn(
            "relative max-w-full truncate px-0.5 text-[10px] leading-tight tracking-wide",
            active
              ? "font-semibold text-[#D4AF37]"
              : isDark
                ? "font-medium text-gray-500"
                : "font-medium text-gray-500"
          )}
        >
          {label}
        </span>
      </Link>
    </li>
  );
}

export function MobileBottomNav({ role: roleProp }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const notifCtx = useNotificationsOptional();
  const unread = notifCtx?.unreadCount ?? 0;

  const role = roleProp ?? detectRole(pathname);
  if (!role) return null;

  const isDark = theme === "dark";
  const items =
    role === "teacher" ? teacherItems : role === "admin" ? adminItems : studentItems;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:hidden"
      aria-hidden={false}
    >
      <nav
        aria-label={t("mobileNav.main", { defaultValue: "Main navigation" })}
        className={cn(
          "pointer-events-auto mx-auto max-w-lg overflow-hidden rounded-[22px] border shadow-[0_8px_32px_rgba(13,27,42,0.12)] backdrop-blur-2xl",
          isDark
            ? "border-white/10 bg-[#112240]/92"
            : "border-gray-200/70 bg-white/92"
        )}
      >
        <ul className="flex items-stretch px-1 py-0.5">
          {items.map((item) => {
            const active = item.match ? item.match(pathname) : pathname === item.href;
            return (
              <NavTab
                key={item.href}
                item={item}
                active={active}
                label={t(item.labelKey, { defaultValue: item.labelKey })}
                unread={unread}
                isDark={isDark}
                role={role}
              />
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/** Reserve space for floating bottom nav on mobile */
export const MOBILE_BOTTOM_NAV_PADDING = "pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-0";
