"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Badge } from "@/components/ui/Badge";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import { formatTeacherEuro, teacherPanel } from "./teacher-ui";
import { fetchTeacherOverviewData, type TeacherOverviewData } from "@/lib/dashboard/teacher-overview";

export function TeacherPaymentsExperience() {
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
      <TeacherDashboardLayout title={t("teacherDashboard.nav.payments")}>
        <LoadingBlock />
      </TeacherDashboardLayout>
    );
  }

  if (!data) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.payments")}>
        <div className={`${teacherPanel()} p-10 text-center text-text-muted`}>
          {t("teacherDashboard.signInRequired")}
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.payments")}
      description={t("teacherDashboard.paymentsSubtitle")}
    >
      <div className="mx-auto max-w-[1000px] space-y-6">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className={teacherPanel("p-5")}>
            <p className="text-xs text-text-muted">{t("teacherDashboard.earningsMonth")}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {formatTeacherEuro(data.stats.earningsMonth)}
            </p>
            <p className="text-xs text-text-muted">{monthLabel}</p>
          </div>
          <div className={teacherPanel("p-5")}>
            <p className="text-xs text-text-muted">{t("teacherDashboard.gross")}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {formatTeacherEuro(data.stats.earningsGross)}
            </p>
          </div>
          <div className={teacherPanel("p-5")}>
            <p className="text-xs text-text-muted">{t("teacherDashboard.pending")}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {formatTeacherEuro(data.stats.earningsPending)}
            </p>
          </div>
        </section>

        <div className={teacherPanel()}>
          <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">{t("teacherDashboard.recentPayments")}</h2>
            <Link
              href="/dashboard/teacher/earnings"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] hover:underline"
            >
              {t("teacherDashboard.nextJumpBonus")}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {data.recentPayments.length === 0 ? (
            <p className="px-6 py-12 text-sm text-text-muted">{t("teacherDashboard.noPayments")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-default text-left text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    <th className="px-6 py-3">{t("teacherDashboard.colStudent")}</th>
                    <th className="px-3 py-3">{t("teacherDashboard.paymentMethod")}</th>
                    <th className="px-3 py-3">{t("teacherDashboard.colDate")}</th>
                    <th className="px-3 py-3">{t("teacherDashboard.amount")}</th>
                    <th className="px-6 py-3">{t("teacherDashboard.colStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPayments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-6 py-4 font-medium text-foreground">{p.studentName}</td>
                      <td className="px-3 py-4 text-text-muted">{p.method}</td>
                      <td className="px-3 py-4 text-text-muted">
                        {new Date(p.date).toLocaleDateString(locale)}
                      </td>
                      <td className="px-3 py-4 font-semibold text-foreground">{formatTeacherEuro(p.amount)}</td>
                      <td className="px-6 py-4">
                        <Badge variant="success">{t("teacherDashboard.paid")}</Badge>
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
