"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import { TeacherTeachingTabs } from "./TeacherTeachingTabs";
import { formatTeacherEuro, teacherPanel } from "./teacher-ui";

type PeriodStats = { units: number; earnings: number; bonus: number };

type EarningsResponse = {
  rates: { lowerLevel: number; upperLevel: number; hourlyRate: number };
  periods: {
    lastMonth: PeriodStats;
    thisMonth: PeriodStats;
    total: PeriodStats;
  };
};

function PeriodColumn({
  title,
  stats,
  unitsLabel,
  earningsLabel,
  bonusLabel,
}: {
  title: string;
  stats: PeriodStats;
  unitsLabel: string;
  earningsLabel: string;
  bonusLabel: string;
}) {
  return (
    <div className="space-y-4 border-border-default sm:border-l sm:pl-6 first:sm:border-l-0 first:sm:pl-0">
      <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-800">{title}</h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-text-muted">{unitsLabel}</p>
          <p className="text-2xl font-bold tabular-nums text-foreground">{stats.units}</p>
        </div>
        <div>
          <p className="text-sm text-text-muted">{earningsLabel}</p>
          <p className="text-2xl font-bold tabular-nums text-foreground">{formatTeacherEuro(stats.earnings)}</p>
        </div>
        <div>
          <p className="text-sm text-text-muted">{bonusLabel}</p>
          <p className="text-2xl font-bold tabular-nums text-foreground">{formatTeacherEuro(stats.bonus)}</p>
        </div>
      </div>
    </div>
  );
}

export function TeacherEarningsExperience() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EarningsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/teacher/earnings");
        const json = (await res.json()) as EarningsResponse & { error?: string };
        if (!res.ok) throw new Error(json.error || "Failed to load earnings");
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : t("misc.errorGeneric", { defaultValue: "Something went wrong" }));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (loading) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.earnings")}>
        <LoadingBlock />
      </TeacherDashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.earnings")}>
        <div className={`${teacherPanel()} p-10 text-center text-text-muted`}>
          {error || t("teacherDashboard.signInRequired")}
        </div>
      </TeacherDashboardLayout>
    );
  }

  const { rates, periods } = data;

  return (
    <TeacherDashboardLayout title={t("teacherDashboard.nav.earnings")}>
      <div className="mx-auto max-w-[960px] space-y-0">
        <TeacherTeachingTabs />

        <div className={`${teacherPanel("rounded-t-none border-t-0")} p-5 sm:p-8`}>
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="hidden lg:block" />
            <div className="grid w-full gap-6 sm:grid-cols-2 lg:max-w-md lg:text-right">
              <div>
                <p className="text-sm font-medium text-text-muted">
                  {t("teacherDashboard.rateLowerLevel", { defaultValue: "angepasster Unterstufen Tarif" })}
                </p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {formatTeacherEuro(rates.lowerLevel)}
                  <span className="text-base font-normal text-text-muted">
                    {" "}
                    / {t("teacherDashboard.perUnit", { defaultValue: "Einheit" })}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-muted">
                  {t("teacherDashboard.rateUpperLevel", { defaultValue: "angepasster Oberstufen Tarif" })}
                </p>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {formatTeacherEuro(rates.upperLevel)}
                  <span className="text-base font-normal text-text-muted">
                    {" "}
                    / {t("teacherDashboard.perUnit", { defaultValue: "Einheit" })}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <PeriodColumn
              title={t("teacherDashboard.periodLastMonth", { defaultValue: "Letztes Monat" })}
              stats={periods.lastMonth}
              unitsLabel={t("teacherDashboard.unitsLastMonth", { defaultValue: "Einheiten letztes Monat" })}
              earningsLabel={t("teacherDashboard.earningsLastMonth", { defaultValue: "Einnahmen letztes Monat" })}
              bonusLabel={t("teacherDashboard.bonusLastMonth", { defaultValue: "Bonus letztes Monat" })}
            />
            <PeriodColumn
              title={t("teacherDashboard.periodThisMonth", { defaultValue: "Dieses Monat" })}
              stats={periods.thisMonth}
              unitsLabel={t("teacherDashboard.unitsThisMonth", { defaultValue: "Einheiten dieses Monat" })}
              earningsLabel={t("teacherDashboard.earningsThisMonth", { defaultValue: "Einnahmen dieses Monat" })}
              bonusLabel={t("teacherDashboard.bonusThisMonth", { defaultValue: "Bonus dieses Monat" })}
            />
            <PeriodColumn
              title={t("teacherDashboard.periodTotal", { defaultValue: "Gesamt" })}
              stats={periods.total}
              unitsLabel={t("teacherDashboard.unitsTotal", { defaultValue: "Einheiten gesamt" })}
              earningsLabel={t("teacherDashboard.earningsTotal", { defaultValue: "Einnahmen gesamt" })}
              bonusLabel={t("teacherDashboard.bonusTotal", { defaultValue: "Bonus gesamt" })}
            />
          </div>

          <p className="mt-8 text-xs text-text-muted">
            {t("teacherDashboard.ratesAdminNote", {
              defaultValue: "Tarife werden von der Verwaltung festgelegt. Bonus erscheint, sobald NextJump aktiv ist.",
            })}
          </p>
        </div>
      </div>
    </TeacherDashboardLayout>
  );
}
