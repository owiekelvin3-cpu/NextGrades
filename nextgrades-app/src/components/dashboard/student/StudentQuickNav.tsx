"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  BookOpen,
  FileText,
  ListChecks,
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
      defaultLabel: "Termine",
      meta: appointmentHint,
      matchPrefix: true,
    },
    {
      href: "/dashboard/student/courses",
      icon: BookOpen,
      labelKey: "studentDashboard.nav.courses",
      defaultLabel: "Kurse",
      matchPrefix: true,
    },
    {
      href: "/dashboard/student/resources",
      icon: FileText,
      labelKey: "studentDashboard.nav.materials",
      defaultLabel: "Materialien",
      matchPrefix: true,
    },
    {
      href: "/dashboard/student/quizzes",
      icon: ListChecks,
      labelKey: "studentDashboard.nav.tasks",
      defaultLabel: "Aufgaben",
      meta:
        openTaskCount > 0
          ? t("studentDashboard.tasksWaiting", { count: openTaskCount, defaultValue: `${openTaskCount} offen` })
          : t("studentDashboard.noOpenTasks"),
      matchPrefix: true,
    },
  ];

  return (
    <nav aria-label={t("studentDashboard.quickAccess", { defaultValue: "Schnellzugriff" })} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
              "group flex min-h-[5.5rem] flex-col justify-between rounded-xl border bg-surface-elevated p-4 transition",
              active
                ? "border-[#D4AF37]/40 shadow-sm ring-1 ring-[#D4AF37]/15"
                : "border-border-default hover:border-[#D4AF37]/25 hover:shadow-sm"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition",
                active
                  ? "bg-[#D4AF37]/15 text-[#D4AF37]"
                  : "bg-surface-subtle text-foreground group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37]"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">{label}</span>
              {item.meta && <span className="mt-0.5 block truncate text-xs text-text-muted">{item.meta}</span>}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
