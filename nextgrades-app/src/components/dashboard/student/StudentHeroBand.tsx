"use client";

import Link from "next/link";
import { Target, Sparkles, CalendarDays, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type StudentHeroBandProps = {
  firstName: string;
  learningGoal?: string | null;
  dateLocale: string;
  overallProgress?: number;
  nextLessonLabel?: string | null;
  compact?: boolean;
};

export function StudentHeroBand({
  firstName,
  learningGoal,
  dateLocale,
  overallProgress,
  nextLessonLabel,
  compact = false,
}: StudentHeroBandProps) {
  const { t } = useTranslation();
  const todayLabel = new Date().toLocaleDateString(dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className={cn("student-hero", compact ? "p-5" : "p-6 sm:p-8")}>
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="student-eyebrow">{todayLabel}</p>
          <h2 className={cn("mt-3 font-bold leading-tight text-white", compact ? "text-xl" : "text-2xl sm:text-3xl")}>
            {t("studentDashboard.welcomeBack", { name: firstName })}
          </h2>
          <p className={cn("mt-2 max-w-xl leading-relaxed text-white/75", compact ? "text-sm" : "text-sm sm:text-base")}>
            {t("studentDashboard.welcomeSubtitle")}
          </p>

          <div
            className={cn(
              "mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm backdrop-blur-sm",
              !learningGoal && "border-dashed"
            )}
          >
            <Target className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" aria-hidden />
            <span className="text-white/70">{t("studentDashboard.yourGoal")}:</span>
            <span className="font-medium text-white">
              {learningGoal || t("studentDashboard.noGoalSet")}
            </span>
            <Link
              href="/dashboard/student/settings"
              className="ml-auto text-xs font-semibold text-[var(--brand-gold-light)] hover:underline"
            >
              {t("studentDashboard.editGoal")}
            </Link>
          </div>
        </div>

        <div className={cn("flex w-full shrink-0 flex-col gap-3", compact ? "sm:flex-row" : "sm:flex-row lg:w-auto lg:flex-col xl:flex-row")}>
          {!compact && typeof overallProgress === "number" && (
            <div className="flex items-center gap-4 rounded-xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-sm lg:min-w-[9rem]">
              <div
                className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(var(--brand-gold) ${overallProgress * 3.6}deg, rgba(255,255,255,0.12) 0)`,
                }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--student-hero-from)] text-sm font-bold text-white">
                  {overallProgress}%
                </span>
              </div>
              <div>
                <p className="text-xs text-white/65">{t("studentDashboard.totalProgress")}</p>
                <p className="text-sm font-semibold text-white">{t("studentDashboard.progressKeepGoing")}</p>
              </div>
            </div>
          )}

          <div className={cn("flex flex-col gap-2.5", compact ? "w-full sm:flex-1" : "w-full sm:flex-row lg:w-auto lg:flex-col xl:flex-row")}>
            <Button
              variant="gold"
              size={compact ? "sm" : "md"}
              href="/dashboard/student/courses"
              className="w-full justify-center sm:flex-1 lg:w-[11.5rem]"
            >
              <BookOpen className="mr-1.5 h-4 w-4" />
              {t("studentDashboard.continueLearning", { subject: "", defaultValue: "Continue learning" })}
            </Button>
            <Button
              variant="secondary"
              size={compact ? "sm" : "md"}
              href="/dashboard/student/appointments"
              className="w-full justify-center border-white/20 bg-white/10 text-white hover:bg-white/15 sm:flex-1 lg:w-[11.5rem]"
            >
              <CalendarDays className="mr-1.5 h-4 w-4" />
              {nextLessonLabel ?? t("studentDashboard.myAppointments")}
            </Button>
            {!compact && (
              <Button
                variant="outline"
                size="md"
                href="/dashboard/chat"
                className="w-full justify-center border-[var(--brand-gold)]/40 text-[var(--brand-gold-light)] hover:bg-[var(--brand-gold)]/10 sm:flex-1 lg:w-[11.5rem]"
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                {t("studentDashboard.openAi")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
