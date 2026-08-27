"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Badge } from "@/components/ui/Badge";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import { formatTeacherEuro, teacherPanel } from "./teacher-ui";

type EarningsSummary = {
  hourlyRate: number;
  pendingEarnings: number;
  paidOutEarnings: number;
  earningsMtd: number;
  totalHours: number;
  nextPayoutAt: string | null;
  bonusLevel: number;
};

type LedgerEntry = {
  id: string;
  lessonId: string | null;
  amount: number;
  currency: string;
  entryType: string;
  status: string;
  note: string | null;
  createdAt: string;
  paidAt: string | null;
};

type EarningsResponse = {
  summary: EarningsSummary;
  ledger: LedgerEntry[];
};

function ledgerStatusVariant(status: string): "success" | "warning" | "default" {
  if (status === "paid") return "success";
  if (status === "pending") return "warning";
  return "default";
}

function ledgerEntryLabel(entry: LedgerEntry, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (entry.entryType === "payout") {
    return t("teacherDashboard.earningsEntryPayout", { defaultValue: "Auszahlung" });
  }
  if (entry.entryType === "lesson_completed") {
    return t("teacherDashboard.earningsEntryLesson", { defaultValue: "Abgeschlossene Stunde" });
  }
  return entry.note?.trim() || entry.entryType;
}

export function TeacherEarningsExperience() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EarningsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const monthLabel = new Date().toLocaleDateString(locale, { month: "long", year: "numeric" });

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

  const completedLessonsCount = useMemo(() => {
    if (!data) return 0;
    return data.ledger.filter((e) => e.entryType === "lesson_completed").length;
  }, [data]);

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

  const { summary, ledger } = data;

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.earnings")}
      description={t("teacherDashboard.earningsSubtitle", {
        defaultValue: "Übersicht deiner Unterrichtseinnahmen und Auszahlungen.",
      })}
    >
      <div className="mx-auto max-w-[1000px] space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className={teacherPanel("p-5")}>
            <p className="text-xs text-text-muted">{t("teacherDashboard.earningsMonth")}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{formatTeacherEuro(summary.earningsMtd)}</p>
            <p className="text-xs text-text-muted">{monthLabel}</p>
          </div>
          <div className={teacherPanel("p-5")}>
            <p className="text-xs text-text-muted">
              {t("teacherDashboard.completedPaidLessons", { defaultValue: "Abgeschlossene bezahlte Stunden" })}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">{completedLessonsCount}</p>
          </div>
          <div className={teacherPanel("p-5")}>
            <p className="text-xs text-text-muted">{t("teacherDashboard.pending")}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{formatTeacherEuro(summary.pendingEarnings)}</p>
          </div>
          <div className={teacherPanel("p-5")}>
            <p className="text-xs text-text-muted">
              {t("teacherDashboard.alreadyPaidOut", { defaultValue: "Bereits ausgezahlt" })}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">{formatTeacherEuro(summary.paidOutEarnings)}</p>
          </div>
          <div className={teacherPanel("p-5")}>
            <p className="text-xs text-text-muted">{t("teacherDashboard.hourlyRate")}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{formatTeacherEuro(summary.hourlyRate)}</p>
            <p className="mt-1 text-xs text-text-muted">
              {t("teacherDashboard.hourlyRateAdminNote", { defaultValue: "Nur durch die Verwaltung änderbar" })}
            </p>
          </div>
          <div className={teacherPanel("p-5")}>
            <p className="text-xs text-text-muted">{t("teacherDashboard.nextPayout", { defaultValue: "Nächste Auszahlung" })}</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {summary.nextPayoutAt
                ? new Date(summary.nextPayoutAt).toLocaleDateString(locale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : t("teacherDashboard.nextPayoutTbd", { defaultValue: "Wird bekannt gegeben" })}
            </p>
          </div>
        </section>

        <div className={teacherPanel()}>
          <div className="border-b border-border-default px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              {t("teacherDashboard.payoutHistory", { defaultValue: "Auszahlungs- & Einnahmenhistorie" })}
            </h2>
          </div>
          {ledger.length === 0 ? (
            <p className="px-6 py-12 text-sm text-text-muted">
              {t("teacherDashboard.noLedgerEntries", { defaultValue: "Noch keine Einträge im Einnahmenkonto." })}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-default text-left text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    <th className="px-6 py-3">{t("teacherDashboard.colDate")}</th>
                    <th className="px-3 py-3">{t("teacherDashboard.colDescription", { defaultValue: "Beschreibung" })}</th>
                    <th className="px-3 py-3">{t("teacherDashboard.amount")}</th>
                    <th className="px-6 py-3">{t("teacherDashboard.colStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-6 py-4 text-text-muted">
                        {new Date(entry.createdAt).toLocaleDateString(locale)}
                      </td>
                      <td className="px-3 py-4 font-medium text-foreground">{ledgerEntryLabel(entry, t)}</td>
                      <td className="px-3 py-4 font-semibold text-foreground">
                        {entry.entryType === "payout" ? "−" : ""}
                        {formatTeacherEuro(Math.abs(entry.amount))}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={ledgerStatusVariant(entry.status)}>
                          {t(`teacherDashboard.ledgerStatus.${entry.status}`, { defaultValue: entry.status })}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TeacherDashboardLayout>
  );
}
