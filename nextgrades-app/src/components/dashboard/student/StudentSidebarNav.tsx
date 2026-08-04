"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  FileText,
  ListChecks,
  TrendingUp,
  Settings,
  Video,
  Sparkles,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StudentNavItem = {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  badge?: "notifications";
  matchPrefix?: boolean;
};

export const studentNavItems: StudentNavItem[] = [
  { href: "/dashboard/student", icon: LayoutDashboard, labelKey: "studentDashboard.nav.overview" },
  {
    href: "/dashboard/student/appointments",
    icon: CalendarDays,
    labelKey: "studentDashboard.nav.appointments",
    matchPrefix: true,
  },
  {
    href: "/dashboard/student/live-classes",
    icon: Video,
    labelKey: "studentDashboard.nav.liveClasses",
    matchPrefix: true,
  },
  {
    href: "/dashboard/student/courses",
    icon: BookOpen,
    labelKey: "studentDashboard.nav.courses",
    matchPrefix: true,
  },
  {
    href: "/dashboard/student/resources",
    icon: FileText,
    labelKey: "studentDashboard.nav.materials",
    matchPrefix: true,
  },
  {
    href: "/dashboard/student/quizzes",
    icon: ListChecks,
    labelKey: "studentDashboard.nav.tasks",
    matchPrefix: true,
  },
  {
    href: "/dashboard/student/progress",
    icon: TrendingUp,
    labelKey: "studentDashboard.nav.progress",
    matchPrefix: true,
  },
  {
    href: "/dashboard/chat",
    icon: Sparkles,
    labelKey: "studentDashboard.nav.aiChat",
    matchPrefix: true,
  },
  {
    href: "/dashboard/notifications",
    icon: Bell,
    labelKey: "studentDashboard.nav.notifications",
    badge: "notifications",
  },
  { href: "/dashboard/student/settings", icon: Settings, labelKey: "studentDashboard.nav.settings" },
];

const navSections = [
  {
    titleKey: "studentDashboard.nav.sectionMain",
    defaultTitle: "Hauptmenü",
    items: studentNavItems.slice(0, 3),
  },
  {
    titleKey: "studentDashboard.nav.sectionLearning",
    defaultTitle: "Lernen",
    items: studentNavItems.slice(3, 7),
  },
  {
    titleKey: "studentDashboard.nav.sectionMore",
    defaultTitle: "Mehr",
    items: studentNavItems.slice(7),
  },
] as const;

function isActive(pathname: string, item: StudentNavItem) {
  if (item.href === "/dashboard/student") return pathname === item.href;
  if (item.matchPrefix) return pathname === item.href || pathname.startsWith(`${item.href}/`);
  return pathname === item.href;
}

type Props = {
  unreadNotifications?: number;
  onNavigate?: () => void;
};

export function StudentSidebarNav({ unreadNotifications = 0, onNavigate }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden py-0.5 scrollbar-none">
      {navSections.map((section) => (
        <div key={section.titleKey}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--sidebar-text)]">
            {t(section.titleKey, { defaultValue: section.defaultTitle })}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActive(pathname, item);
              const showBadge = item.badge === "notifications" && unreadNotifications > 0;

              return (
                <li key={item.labelKey}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors",
                      active
                        ? "bg-[var(--sidebar-surface)] font-medium text-[var(--sidebar-text-active)]"
                        : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-surface)] hover:text-[var(--sidebar-text-active)]"
                    )}
                  >
                    {active && (
                      <span
                        className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-[var(--brand-gold)]"
                        aria-hidden
                      />
                    )}
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        active ? "text-[var(--brand-gold)]" : "text-[var(--sidebar-text)]"
                      )}
                    />
                    <span className="flex-1">{t(item.labelKey)}</span>
                    {showBadge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-gold)] px-1.5 text-[10px] font-bold text-[var(--brand-navy)]">
                        {unreadNotifications > 9 ? "9+" : unreadNotifications}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
