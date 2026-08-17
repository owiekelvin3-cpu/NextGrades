"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CreditCard,
  Rocket,
  Sparkles,
  FolderOpen,
  Settings,
  Bell,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TeacherNavItem = {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  badge?: "notifications";
  matchPrefix?: boolean;
};

/** Navigation order from NextGrades teacher dashboard mockups */
export const teacherNavItems: TeacherNavItem[] = [
  { href: "/dashboard/teacher", icon: LayoutDashboard, labelKey: "teacherDashboard.nav.dashboard" },
  { href: "/dashboard/teacher/students", icon: Users, labelKey: "teacherDashboard.nav.students", matchPrefix: true },
  { href: "/dashboard/teacher/schedule", icon: CalendarDays, labelKey: "teacherDashboard.nav.schedule", matchPrefix: true },
  { href: "/dashboard/teacher/payments", icon: CreditCard, labelKey: "teacherDashboard.nav.payments" },
  { href: "/dashboard/teacher/earnings", icon: Rocket, labelKey: "teacherDashboard.nav.nextJumpBonus" },
  {
    href: "/dashboard/chat",
    icon: Sparkles,
    labelKey: "teacherDashboard.nav.messages",
  },
  {
    href: "/dashboard/notifications",
    icon: Bell,
    labelKey: "notifications.title",
    badge: "notifications",
  },
  {
    href: "/dashboard/teacher/content",
    icon: FolderOpen,
    labelKey: "teacherDashboard.nav.materials",
    matchPrefix: true,
  },
  {
    href: "/dashboard/teacher/ai-generator",
    icon: ListChecks,
    labelKey: "teacherDashboard.nav.aiGenerator",
    matchPrefix: true,
  },
  { href: "/dashboard/teacher/settings", icon: Settings, labelKey: "teacherDashboard.nav.settings" },
];

function isActive(pathname: string, item: TeacherNavItem) {
  if (item.href === "/dashboard/teacher") return pathname === item.href;
  if (item.matchPrefix) return pathname === item.href || pathname.startsWith(`${item.href}/`);
  return pathname === item.href;
}

type Props = {
  unreadNotifications?: number;
  onNavigate?: () => void;
};

export function TeacherSidebarNav({ unreadNotifications = 0, onNavigate }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden py-0.5 scrollbar-none">
      {teacherNavItems.map((item, index) => {
        const active = isActive(pathname, item);
        const showBadge = item.badge === "notifications" && unreadNotifications > 0;

        return (
          <Link
            key={`${item.labelKey}-${index}`}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all",
              active
                ? "border border-[var(--brand-gold)]/50 bg-[var(--brand-gold-muted)] font-medium text-[var(--sidebar-text-active)]"
                : "border border-transparent text-[var(--sidebar-text)] hover:bg-[var(--sidebar-surface)] hover:text-[var(--sidebar-text-active)]"
            )}
          >
            <item.icon
              className={cn(
                "h-[18px] w-[18px] shrink-0",
                active ? "text-[var(--brand-gold)]" : "text-[var(--sidebar-text)]"
              )}
            />
            <span className="flex-1">{t(item.labelKey)}</span>
            {showBadge && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4AF37] px-1.5 text-[10px] font-bold text-foreground">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
