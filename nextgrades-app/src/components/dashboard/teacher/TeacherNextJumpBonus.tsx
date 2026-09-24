"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Rocket, TrendingUp, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import { TeacherTeachingTabs } from "./TeacherTeachingTabs";
import { formatTeacherEuro, teacherPanel } from "./teacher-ui";
import {
  FREQUENCY_MILESTONES,
  LOYALTY_MILESTONES,
  MAX_HOURLY_LOWER,
  MAX_HOURLY_UPPER,
} from "@/lib/teachers/nextjump-bonus";

type StudentBonus = {
  studentId: string;
  studentName: string;
  progress: {
    completedLessons: number;
    currentLevel: number;
    nextTarget: number | null;
    progressPercent: number;
    bonusEarned: number;
    nextBonusAmount: number | null;
  };
};

type BonusData = {
  rates: { lowerLevel: number; upperLevel: number };
  loyalty: {
    lessonsCompleted: number;
    bonusPerHour: number;
    periodEnd: string;
    nextTarget: number | null;
  };
  students: StudentBonus[];
};

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#D4AF37] transition-all"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

export function TeacherNextJumpBonus() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BonusData | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/teacher/bonus");
        const json = (await res.json()) as BonusData & { error?: string };
        if (!cancelled && res.ok) setData(json);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.nextJumpBonus")}>
        <LoadingBlock />
      </TeacherDashboardLayout>
    );
  }

  if (!data) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.nextJumpBonus")}>
        <div className={`${teacherPanel()} p-10 text-center text-text-muted`}>
          {t("misc.errorGeneric", { defaultValue: "Something went wrong" })}
        </div>
      </TeacherDashboardLayout>
    );
  }

  const loyaltyProgress = data.loyalty.nextTarget
    ? Math.round((data.loyalty.lessonsCompleted / data.loyalty.nextTarget) * 100)
    : 100;

  return (
    <TeacherDashboardLayout title={t("teacherDashboard.nav.nextJumpBonus")}>
      <div className="mx-auto max-w-[1000px] space-y-0">
        <TeacherTeachingTabs />

        <div className="space-y-6 pt-6">
          <div className={`${teacherPanel()} p-5 sm:p-6`}>
            <div className="flex items-center gap-2 text-emerald-700">
              <Rocket className="h-5 w-5" />
              <h2 className="text-base font-semibold">
                {t("teacherDashboard.bonusRatesTitle", { defaultValue: "Aktuelle Stundensätze" })}
              </h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-subtle p-4">
                <p className="text-sm text-text-muted">
                  {t("teacherDashboard.rateLowerLevel", { defaultValue: "Unterstufen Tarif" })}
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {formatTeacherEuro(data.rates.lowerLevel + data.loyalty.bonusPerHour)}
                  <span className="text-sm font-normal text-text-muted">
                    {" "}
                    / {t("teacherDashboard.perHour", { defaultValue: "Std." })}
                  </span>
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {t("teacherDashboard.maxRate", { max: MAX_HOURLY_LOWER, defaultValue: "Max. €{{max}}/Std." })}
                </p>
              </div>
              <div className="rounded-xl bg-surface-subtle p-4">
                <p className="text-sm text-text-muted">
                  {t("teacherDashboard.rateUpperLevel", { defaultValue: "Oberstufen Tarif" })}
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {formatTeacherEuro(data.rates.upperLevel + data.loyalty.bonusPerHour)}
                  <span className="text-sm font-normal text-text-muted">
                    {" "}
                    / {t("teacherDashboard.perHour", { defaultValue: "Std." })}
                  </span>
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {t("teacherDashboard.maxRate", { max: MAX_HOURLY_UPPER, defaultValue: "Max. €{{max}}/Std." })}
                </p>
              </div>
            </div>
          </div>

          <div className={`${teacherPanel()} p-5 sm:p-6`}>
            <div className="flex items-center gap-2 text-orange-700">
              <TrendingUp className="h-5 w-5" />
              <h2 className="text-base font-semibold">
                {t("teacherDashboard.loyaltyBonusTitle", { defaultValue: "Treuebonus (6 Monate)" })}
              </h2>
            </div>
            <p className="mt-2 text-sm text-text-muted">
              {t("teacherDashboard.loyaltyBonusDesc", {
                defaultValue: "Zusätzlicher Stundensatz basierend auf abgeschlossenen Stunden im 6-Monats-Zeitraum.",
              })}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {LOYALTY_MILESTONES.map((m) => (
                <div
                  key={m.lessons}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    data.loyalty.lessonsCompleted >= m.lessons
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-border-default"
                  }`}
                >
                  <span className="font-semibold">{m.lessons} Stunden</span>
                  <span className="text-text-muted"> → +€{m.bonusPerHour.toFixed(2)}/Std.</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-text-muted">
                <span>
                  {data.loyalty.lessonsCompleted}{" "}
                  {t("teacherDashboard.lessonsCompleted", { defaultValue: "Stunden abgeschlossen" })}
                </span>
                {data.loyalty.nextTarget && (
                  <span>
                    {t("teacherDashboard.nextTarget", { defaultValue: "Nächstes Ziel" })}: {data.loyalty.nextTarget}
                  </span>
                )}
              </div>
              <ProgressBar percent={loyaltyProgress} />
              {data.loyalty.periodEnd && (
                <p className="mt-2 text-xs text-text-muted">
                  {t("teacherDashboard.periodEnds", { defaultValue: "Zeitraum endet" })}:{" "}
                  {new Date(data.loyalty.periodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className={`${teacherPanel()} p-5 sm:p-6`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-violet-700">
                <Users className="h-5 w-5" />
                <h2 className="text-base font-semibold">
                  {t("teacherDashboard.frequencyBonusTitle", { defaultValue: "Häufigkeitsbonus pro SchülerIn" })}
                </h2>
              </div>
            </div>
            <p className="mb-4 text-sm text-text-muted">
              {t("teacherDashboard.frequencyBonusDesc", {
                defaultValue:
                  "Bonus pro Meilenstein (10, 20, 32 … 200 Stunden). Nach 200 Stunden startet der Zähler neu.",
              })}
            </p>

            {data.students.length === 0 ? (
              <p className="text-sm text-text-muted">
                {t("teacherDashboard.noAssignedStudents", { defaultValue: "Noch keine SchülerInnen zugewiesen." })}
              </p>
            ) : (
              <ul className="space-y-4">
                {data.students.map((s) => (
                  <li key={s.studentId} className="rounded-xl border border-border-default p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{s.studentName}</p>
                        <p className="mt-1 text-xs text-text-muted">
                          {s.progress.completedLessons}{" "}
                          {t("teacherDashboard.lessonsInCycle", { defaultValue: "Stunden (aktueller Zyklus)" })}
                          {s.progress.nextTarget != null && (
                            <>
                              {" · "}
                              {t("teacherDashboard.nextTarget", { defaultValue: "Nächstes Ziel" })}:{" "}
                              {s.progress.nextTarget} (
                              {t("teacherDashboard.bonusAmount", { defaultValue: "Bonus" })}:{" "}
                              {formatTeacherEuro(s.progress.nextBonusAmount ?? 0)})
                            </>
                          )}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-700">
                        {t("teacherDashboard.bonusEarned", { defaultValue: "Bonus verdient" })}:{" "}
                        {formatTeacherEuro(s.progress.bonusEarned)}
                      </p>
                    </div>
                    <div className="mt-3">
                      <ProgressBar percent={s.progress.progressPercent} />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <details className="mt-6 text-sm text-text-muted">
              <summary className="cursor-pointer font-medium text-foreground">
                {t("teacherDashboard.frequencyMilestones", { defaultValue: "Bonus-Stufen anzeigen" })}
              </summary>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                {FREQUENCY_MILESTONES.map((m) => (
                  <li key={m.lessons}>
                    {m.lessons} Stunden → {formatTeacherEuro(m.bonus)}
                  </li>
                ))}
              </ul>
            </details>
          </div>

          <p className="text-center text-xs text-text-muted">
            <Link href="/dashboard/teacher/payments" className="font-medium text-[#D4AF37] hover:underline">
              {t("teacherDashboard.viewEarningsOverview", { defaultValue: "Zur Einnahmen-Übersicht" })}
            </Link>
          </p>
        </div>
      </div>
    </TeacherDashboardLayout>
  );
}
