"use client";

import Link from "next/link";
import { Plus, Video, Upload, BookOpen, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { mobile } from "@/lib/mobile/tokens";
import { cn } from "@/lib/utils";

const actions = [
  {
    href: "/dashboard/teacher/content",
    icon: BookOpen,
    labelKey: "teacherDashboard.createCourse",
    fallback: "Create Course",
  },
  {
    href: "/dashboard/teacher/schedule",
    icon: Video,
    labelKey: "teacherDashboard.createLiveClass",
    fallback: "Create Live Class",
  },
  {
    href: "/dashboard/teacher/upload",
    icon: Upload,
    labelKey: "teacherDashboard.uploadResource",
    fallback: "Upload Resource",
  },
] as const;

/** Full-width stacked actions - less crowded than a 3-column grid */
export function TeacherMobileQuickActions() {
  const { t } = useTranslation();

  return (
    <section className="space-y-3 md:hidden">
      {actions.map(({ href, icon: Icon, labelKey, fallback }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            mobile.cardInteractive,
            "flex min-h-[56px] items-center gap-4 px-5 py-4"
          )}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/12 text-[#D4AF37]">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="flex-1 font-semibold text-foreground">
            {t(labelKey, { defaultValue: fallback })}
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-text-muted" />
        </Link>
      ))}

      <Link
        href="/dashboard/teacher/schedule"
        className={cn(
          mobile.button,
          "flex w-full items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#F5A623] text-[#0D1B2A] shadow-lg"
        )}
      >
        <Plus className="h-5 w-5" />
        {t("teacherDashboard.createNewAppointment", { defaultValue: "New appointment" })}
      </Link>
    </section>
  );
}

/** Removed from student overview - bottom nav covers these routes */
