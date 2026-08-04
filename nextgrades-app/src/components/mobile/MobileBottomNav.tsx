"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Home,
  BookOpen,
  FolderOpen,
  Bell,
  User,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_PORTAL_HOME, ADMIN_PORTAL_PREFIX } from "@/lib/admin/portal-paths";
import { useNotificationsOptional } from "@/context/NotificationContext";
import { MOBILE_BOTTOM_NAV_PADDING } from "@/lib/mobile/tokens";

export { MOBILE_BOTTOM_NAV_PADDING };

type NavItem = {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  match?: (path: string) => boolean;
  badge?: "notifications";
};

function buildItems(role: "student" | "teacher" | "admin"): NavItem[] {
  const profile =
    role === "teacher"
      ? "/dashboard/teacher/settings"
      : role === "admin"
        ? `${ADMIN_PORTAL_PREFIX}/users`
        : "/dashboard/student/settings";

  const home =
    role === "teacher"
      ? "/dashboard/teacher"
      : role === "admin"
        ? ADMIN_PORTAL_HOME
        : "/dashboard/student";

  const courses =
    role === "teacher"
      ? "/dashboard/teacher/content"
      : role === "admin"
        ? `${ADMIN_PORTAL_PREFIX}/students`
        : "/dashboard/student/courses";

  const resources =
    role === "teacher"
      ? "/dashboard/teacher/resources"
      : role === "admin"
        ? `${ADMIN_PORTAL_PREFIX}/resources`
        : "/dashboard/student/resources";

  const studentAppointments: NavItem = {
    href: "/dashboard/student/appointments",
    icon: CalendarDays,
    labelKey: "studentDashboard.nav.appointments",
    match: (p) =>
      p.startsWith("/dashboard/student/appointments") || p.startsWith("/dashboard/student/live-classes"),
  };

  const notifications: NavItem = {
    href: role === "admin" ? `${ADMIN_PORTAL_PREFIX}/notifications` : "/dashboard/notifications",
    icon: Bell,
    labelKey: "mobileNav.notifications",
    badge: "notifications",
    match: (p) =>
      p.startsWith("/dashboard/notifications") ||
      (role === "admin" && p.startsWith(`${ADMIN_PORTAL_PREFIX}/notifications`)),
  };

  const base: NavItem[] = [
    { href: home, icon: Home, labelKey: "mobileNav.home", match: (p) => p === home },
    { href: courses, icon: BookOpen, labelKey: "mobileNav.courses", match: (p) => p.startsWith(courses) },
    {
      href: resources,
      icon: FolderOpen,
      labelKey: role === "admin" ? "adminNav.resources" : "mobileNav.resources",
      match: (p) =>
        p.startsWith(resources) ||
        (role === "student" && p.startsWith("/resources")),
    },
  ];

  if (role === "student") {
    return [...base.slice(0, 1), studentAppointments, ...base.slice(1), { href: profile, icon: User, labelKey: "mobileNav.profile", match: (p) => p.startsWith(profile) }];
  }

  return [
    ...base,
    notifications,
    { href: profile, icon: User, labelKey: "mobileNav.profile", match: (p) => p.startsWith(profile) },
  ];
}

function detectRole(pathname: string): "student" | "teacher" | "admin" | null {
  if (pathname.startsWith("/dashboard/teacher")) return "teacher";
  if (pathname.startsWith("/portal/admin") || pathname.startsWith("/dashboard/admin")) return "admin";
  if (
    pathname.startsWith("/dashboard/student") ||
    pathname.startsWith("/dashboard/chat") ||
    pathname.startsWith("/dashboard/notifications")
  ) {
    return "student";
  }
  return null;
}

type Props = { role?: "student" | "teacher" | "admin" };

function NavTab({
  item,
  active,
  label,
  unread,
  pillStyle = false,
}: {
  item: NavItem;
  active: boolean;
  label: string;
  unread: number;
  pillStyle?: boolean;
}) {
  const Icon = item.icon;
  const showBadge = item.badge === "notifications" && unread > 0;

  if (pillStyle) {
    return (
      <li className="min-w-0 flex-1 basis-0">
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          aria-label={label}
          className="relative flex min-h-[56px] flex-col items-center justify-center gap-1 px-0.5 touch-manipulation active:opacity-80"
        >
          <span
            className={cn(
              "relative flex h-10 w-14 items-center justify-center rounded-2xl transition-all",
              active
                ? "bg-foreground text-background shadow-md dark:bg-[var(--brand-gold)] dark:text-[var(--brand-navy)]"
                : "text-text-muted"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
            {showBadge && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </span>
          <span
            className={cn(
              "max-w-full truncate text-[10px] leading-tight",
              active ? "font-semibold text-foreground dark:text-[var(--brand-gold)]" : "font-medium text-text-muted"
            )}
          >
            {label}
          </span>
        </Link>
      </li>
    );
  }

  return (
    <li className="min-w-0 flex-1 basis-0">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={label}
        className="relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 px-0.5 touch-manipulation active:opacity-70"
      >
        <span className="relative flex h-6 w-6 items-center justify-center sm:h-7 sm:w-7">
          <Icon
            className={cn("h-5 w-5 sm:h-[22px] sm:w-[22px]", active ? "text-[var(--brand-gold)]" : "text-text-muted")}
            strokeWidth={active ? 2.25 : 1.65}
          />
          {showBadge && (
            <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
        <span
          className={cn(
            "max-w-full truncate text-[10px] leading-tight",
            active ? "font-semibold text-[var(--brand-gold)]" : "font-medium text-text-muted"
          )}
        >
          {label}
        </span>
        {active && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[var(--brand-gold)]" aria-hidden />
        )}
      </Link>
    </li>
  );
}

export function MobileBottomNav({ role: roleProp }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const notifCtx = useNotificationsOptional();
  const unread = notifCtx?.unreadCount ?? 0;
  const role = roleProp ?? detectRole(pathname);
  if (!role) return null;

  const items = buildItems(role);
  const usePillNav = role === "teacher" || role === "student";

  return (
    <nav
      aria-label={t("mobileNav.main", { defaultValue: "Main navigation" })}
      className="fixed inset-x-0 bottom-0 z-50 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className={cn(
          "mx-3 mb-3 overflow-hidden rounded-[1.75rem] border shadow-[0_8px_32px_rgba(13,27,42,0.14)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] sm:mx-4",
          usePillNav
            ? "border-border-default bg-surface-elevated dark:bg-surface-elevated"
            : "border-border-default bg-surface-elevated"
        )}
      >
        <ul className="flex items-stretch px-1 py-1.5">
          {items.map((item) => {
            const active = item.match ? item.match(pathname) : pathname === item.href;
            return (
              <NavTab
                key={item.href}
                item={item}
                active={active}
                label={t(item.labelKey, { defaultValue: item.labelKey })}
                unread={unread}
                pillStyle={usePillNav}
              />
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
