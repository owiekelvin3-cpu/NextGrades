"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard/teacher/schedule", labelKey: "teacherDashboard.tabs.tutoringHours" },
  { href: "/dashboard/teacher/students", labelKey: "teacherDashboard.tabs.myStudents" },
  { href: "/dashboard/teacher/payments", labelKey: "teacherDashboard.tabs.earnings" },
  { href: "/dashboard/teacher/earnings", labelKey: "teacherDashboard.tabs.bonusOverview" },
] as const;

export function TeacherTeachingTabs() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-t-2xl bg-emerald-800 shadow-sm">
      <div className="flex flex-wrap">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "min-h-11 flex-1 border-b-2 px-4 py-3 text-center text-sm font-medium transition sm:flex-none sm:px-6",
                active
                  ? "border-white bg-emerald-900/40 text-white"
                  : "border-transparent text-emerald-100/90 hover:bg-emerald-900/25 hover:text-white"
              )}
            >
              {t(tab.labelKey)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
