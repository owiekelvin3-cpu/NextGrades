"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  BookOpen,
  FileText,
  ListChecks,
  Video,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type QuickNavItem = {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  defaultLabel: string;
  meta?: string;
  matchPrefix?: boolean;
};

type StudentQuickNavProps = {
  openTaskCount?: number;
  appointmentHint?: string;
};

function isActive(pathname: string, href: string, matchPrefix?: boolean) {
  if (href === "/dashboard/student") return pathname === href;
  if (matchPrefix) return pathname === href || pathname.startsWith(`${href}/`);
  return pathname === href;
}

export function StudentQuickNav({ openTaskCount = 0, appointmentHint }: StudentQuickNavProps) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const items: QuickNavItem[] = [
    {
      href: "/dashboard/student/appointments",
      icon: CalendarDays,
      labelKey: "studentDashboard.nav.appointments",
      defaultLabel: "Appointments",
      meta: appointmentHint,
      matchPrefix: true,
    },
    {
      href: "/dashboard/student/live-classes",
      icon: Video,
      labelKey: "studentDashboard.nav.liveClasses",
      defaultLabel: "Live classes",
      matchPrefix: true,
    },
    {
      href: "/dashboard/student/courses",
      icon: BookOpen,
      labelKey: "studentDashboard.nav.courses",
      defaultLabel: "Courses",
      matchPrefix: true,
    },
    {
      href: "/dashboard/student/resources",
      icon: FileText,
      labelKey: "studentDashboard.nav.materials",
      defaultLabel: "Materials",
      matchPrefix: true,
    },
    {
      href: "/dashboard/student/quizzes",
      icon: ListChecks,
      labelKey: "studentDashboard.nav.tasks",
      defaultLabel: "Tasks",
      meta:
        openTaskCount > 0
          ? t("studentDashboard.tasksWaiting", { count: openTaskCount, defaultValue: `${openTaskCount} open` })
          : t("studentDashboard.noOpenTasks"),
      matchPrefix: true,
    },
    {
      href: "/dashboard/chat",
      icon: Sparkles,
      labelKey: "studentDashboard.nav.aiChat",
      defaultLabel: "AI Chat",
      matchPrefix: true,
    },
  ];

  return (
    <nav
      aria-label={t("studentDashboard.quickAccess", { defaultValue: "Quick access" })}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href, item.matchPrefix);
        const Icon = item.icon;
        const label = t(item.labelKey, { defaultValue: item.defaultLabel });

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex min-h-[5.75rem] flex-col justify-between rounded-xl border p-4 transition",
              active
                ? "student-panel-accent border-[var(--brand-gold)]/35 bg-[var(--brand-gold-muted)]/40 shadow-sm ring-1 ring-[var(--brand-gold)]/15"
                : "student-panel hover:border-[var(--border-strong)] hover:shadow-md"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition",
                active
                  ? "bg-[var(--brand-gold-muted)] text-[var(--brand-gold)]"
                  : "bg-surface-subtle text-foreground group-hover:bg-[var(--brand-gold-muted)] group-hover:text-[var(--brand-gold)]"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">{label}</span>
              {item.meta ? (
                <span className="mt-0.5 block truncate text-xs text-text-muted">{item.meta}</span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
