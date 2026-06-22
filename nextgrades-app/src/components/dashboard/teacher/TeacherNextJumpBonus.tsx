"use client";

import { useEffect, useState } from "react";
import { Rocket, ChevronDown, ChevronRight, HelpCircle, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Badge } from "@/components/ui/Badge";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import {
  BONUS_LEVELS,
  formatTeacherEuro,
  teacherPanel,
} from "./teacher-ui";
import { fetchTeacherOverviewData, type TeacherOverviewData } from "@/lib/dashboard/teacher-overview";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border-default last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left text-sm font-medium text-foreground"
      >
        {question}
        <ChevronDown className={`h-4 w-4 shrink-0 text-text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-4 text-sm text-text-muted">{answer}</p>}
    </div>
  );
}

export function TeacherNextJumpBonus() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeacherOverviewData | null>(null);

  const monthLabel = new Date().toLocaleDateString(locale, { month: "long", year: "numeric" });

  useEffect(() => {
    fetchTeacherOverviewData()
      .then(setData)
      .finally(() => setLoading(false));
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
          {t("teacherDashboard.signInRequired")}
        </div>
      </TeacherDashboardLayout>
    );
  }

  const { stats } = data;
  const hoursTaught = Math.round(stats.totalHours % 20) || stats.weekHours;
  const hoursTarget = 20;
  const withdrawable = Math.max(0, stats.bonusCurrent - 70);

  const levelStatus = (level: number) => {
    if (level < stats.nextjumpLevel) return "completed";
    if (level === stats.nextjumpLevel) return "current";
    return "locked";
  };

  const historyMonths = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i - 1);
    return d;
  });

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.nextJumpBonus")}
      description={t("teacherDashboard.bonusSubtitle")}
    >
      <div className="mx-auto max-w-[1200px] space-y-6">
        {/* Top summary cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className={`${teacherPanel()} flex flex-col items-center justify-center p-5 text-center`}>
            <Rocket className="h-10 w-10 text-[#D4AF37]" />
            <p className="mt-2 text-xs text-text-muted">{t("teacherDashboard.bonusProgram")}</p>
          </div>
          <div className={teacherPanel("p-5")}>
            <p className="text-xs text-text-muted">{t("teacherDashboard.currentBonusTitle")}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{formatTeacherEuro(stats.bonusCurrent)}</p>
            <p className="mt-1 text-xs text-green-600">+12% {t("teacherDashboard.thisMonth")}</p>
          </div>
          <div className={teacherPanel("p-5")}>
            <p className="text-xs text-text-muted">{t("teacherDashboard.nextGoalTitle")}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{formatTeacherEuro(stats.bonusNextGoal)}</p>
          </div>
          <div className={teacherPanel("p-5")}>
            <p className="text-xs text-text-muted">{t("teacherDashboard.progressBonus")}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.bonusProgress}%</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${stats.bonusProgress}%` }} />
            </div>
          </div>
          <div className={teacherPanel("p-5")}>
            <p className="text-xs text-text-muted">{t("teacherDashboard.withdrawableFrom")}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{formatTeacherEuro(withdrawable)}</p>
            <button type="button" className="mt-2 text-xs font-medium text-[#D4AF37] hover:underline">
              {t("teacherDashboard.withdrawNow")}
            </button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Monthly progress */}
          <div className={`${teacherPanel()} lg:col-span-2 p-6`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">{t("teacherDashboard.monthlyProgress")}</h2>
              <span className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-text-muted">{monthLabel}</span>
            </div>
            <div className="mt-6 flex items-end gap-6">
              <p className="text-5xl font-bold text-foreground">{stats.bonusProgress}%</p>
              <div className="flex-1 pb-2">
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${stats.bonusProgress}%` }} />
                </div>
                <p className="mt-2 text-sm text-text-muted">
                  {hoursTaught} / {hoursTarget} {t("teacherDashboard.hoursTaught")}
                </p>
              </div>
            </div>
          </div>

          {/* Bonus calculation */}
          <div className={teacherPanel("p-6")}>
            <h2 className="text-sm font-semibold text-foreground">{t("teacherDashboard.bonusCalculation")}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">{t("teacherDashboard.hourlyRate")}</dt>
                <dd className="font-medium text-foreground">€35,00</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-muted">{t("teacherDashboard.bonusRate")}</dt>
                <dd className="font-medium text-foreground">20%</dd>
              </div>
              <div className="flex justify-between border-t border-border-default pt-3">
                <dt className="text-text-muted">{t("teacherDashboard.hoursTaught")}</dt>
                <dd className="font-bold text-foreground">{hoursTaught}h</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Bonus levels table */}
        <div className={teacherPanel()}>
          <div className="border-b border-border-default px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">{t("teacherDashboard.bonusLevels")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  <th className="px-6 py-3">{t("teacherDashboard.level")}</th>
                  <th className="px-3 py-3">{t("teacherDashboard.requirement")}</th>
                  <th className="px-3 py-3">{t("teacherDashboard.bonusRate")}</th>
                  <th className="px-6 py-3">{t("teacherDashboard.colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {BONUS_LEVELS.map((lvl) => {
                  const status = levelStatus(lvl.level);
                  return (
                    <tr key={lvl.level} className="border-b border-gray-50 last:border-0">
                      <td className="px-6 py-4 font-medium text-foreground">Level {lvl.level}</td>
                      <td className="px-3 py-4 text-text-muted">
                        {lvl.hours} {t("teacherDashboard.hoursPerMonth")}
                      </td>
                      <td className="px-3 py-4 text-text-muted">€{lvl.rate}/h</td>
                      <td className="px-6 py-4">
                        {status === "completed" && (
                          <Badge variant="success">{t("teacherDashboard.statusCompleted")}</Badge>
                        )}
                        {status === "current" && (
                          <Badge variant="gold">{t("teacherDashboard.statusCurrent")}</Badge>
                        )}
                        {status === "locked" && (
                          <Badge variant="default">{t("teacherDashboard.statusLocked")}</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* History + FAQ + Tips */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={teacherPanel()}>
            <div className="border-b border-border-default px-6 py-4">
              <h2 className="text-sm font-semibold text-foreground">{t("teacherDashboard.bonusHistory")}</h2>
            </div>
            <ul className="divide-y divide-gray-50">
              {historyMonths.map((d, i) => (
                <li key={d.toISOString()} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {d.toLocaleDateString(locale, { month: "long", year: "numeric" })}
                    </p>
                    <p className="text-xs text-text-muted">
                      {t("teacherDashboard.paidOut")}{" "}
                      {d.toLocaleDateString(locale, { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatTeacherEuro(250 + i * 40)}</span>
                    <Badge variant="success">{t("teacherDashboard.paidOutStatus")}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div className={teacherPanel("px-6")}>
              <div className="flex items-center gap-2 border-b border-border-default py-4">
                <HelpCircle className="h-4 w-4 text-text-muted" />
                <h2 className="text-sm font-semibold text-foreground">{t("teacherDashboard.faq")}</h2>
              </div>
              <FaqItem question={t("teacherDashboard.faq1q")} answer={t("teacherDashboard.faq1a")} />
              <FaqItem question={t("teacherDashboard.faq2q")} answer={t("teacherDashboard.faq2a")} />
              <FaqItem question={t("teacherDashboard.faq3q")} answer={t("teacherDashboard.faq3a")} />
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50/80 p-6">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-orange-500" />
                <h2 className="text-sm font-semibold text-foreground">{t("teacherDashboard.bonusTips")}</h2>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-text-muted">
                <li className="flex gap-2">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                  {t("teacherDashboard.tip1")}
                </li>
                <li className="flex gap-2">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                  {t("teacherDashboard.tip2")}
                </li>
                <li className="flex gap-2">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                  {t("teacherDashboard.tip3")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </TeacherDashboardLayout>
  );
}
