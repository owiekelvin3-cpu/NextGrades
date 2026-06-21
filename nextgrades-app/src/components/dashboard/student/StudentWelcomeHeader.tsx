"use client";

import Link from "next/link";
import { Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type StudentWelcomeHeaderProps = {
  firstName: string;
  learningGoal?: string | null;
  dateLocale: string;
};

export function StudentWelcomeHeader({ firstName, learningGoal, dateLocale }: StudentWelcomeHeaderProps) {
  const { t } = useTranslation();
  const todayLabel = new Date().toLocaleDateString(dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="rounded-2xl border border-border-default bg-surface-elevated shadow-sm">
      <div className="flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium capitalize text-text-muted">{todayLabel}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("studentDashboard.welcomeBack", { name: firstName })}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
            {t("studentDashboard.welcomeSubtitle", {
              defaultValue: "Dein Lernzentrum — Fortschritt verfolgen, Unterricht besuchen und smarter lernen.",
            })}
          </p>

          {(learningGoal || !learningGoal) && (
            <div
              className={cn(
                "mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-border-default bg-surface-subtle/80 px-4 py-3 text-sm",
                !learningGoal && "border-dashed"
              )}
            >
              <Target className="h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden />
              <span className="text-text-muted">{t("studentDashboard.yourGoal")}:</span>
              <span className="font-medium text-foreground">
                {learningGoal || t("studentDashboard.noGoalSet")}
              </span>
              <Link
                href="/dashboard/student/settings"
                className="ml-auto text-xs font-semibold text-[#D4AF37] hover:underline"
              >
                {t("studentDashboard.editGoal")}
              </Link>
            </div>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2.5 sm:flex-row lg:w-auto lg:flex-col xl:flex-row">
          <Button variant="gold" size="md" href="/dashboard/student/courses" className="w-full sm:flex-1 lg:w-[11.5rem]">
            {t("studentDashboard.continueLearning", {
              subject: "",
              defaultValue: "Weiterlernen",
            })}
          </Button>
          <Button
            variant="secondary"
            size="md"
            href="/dashboard/student/appointments"
            className="w-full sm:flex-1 lg:w-[11.5rem]"
          >
            {t("studentDashboard.myAppointments")}
          </Button>
        </div>
      </div>
    </section>
  );
}
