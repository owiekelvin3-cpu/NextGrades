"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  DollarSign,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Plus,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AdminKpiCard, AdminKpiStrip } from "@/components/admin/AdminKpiCard";
import { AdminAnalyticsCharts } from "@/components/admin/AdminAnalyticsCharts";
import { AdminAnimatedNumber } from "@/components/admin/AdminAnimatedNumber";
import { fetchAdminStats } from "@/lib/dashboard/data";
import { fetchAdminChartData, type AdminChartData } from "@/lib/admin/chart-data";
import { DashboardStatsSkeleton } from "@/components/ui/Skeleton";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

export function AdminAnalyticsExperience() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    active_enrollments: 0,
    total_earnings: 0,
  });
  const [chartData, setChartData] = useState<AdminChartData | null>(null);

  useEffect(() => {
    void (async () => {
      const [statsRes, chartsRes] = await Promise.all([fetchAdminStats(), fetchAdminChartData()]);
      setStats(statsRes);
      setChartData(chartsRes);
      setLoading(false);
    })();
  }, []);

  const insights = useMemo(() => {
    if (!chartData) return { totalSignups: 0, avgActivity: 0 };
    const totalSignups = chartData.signupsByDay.reduce((sum, d) => sum + d.count, 0);
    const totalActivity = chartData.activityByDay.reduce((sum, d) => sum + d.count, 0);
    const avgActivity = Math.round(totalActivity / Math.max(chartData.activityByDay.length, 1));
    return { totalSignups, avgActivity };
  }, [chartData]);

  return (
    <DashboardPage
      role="admin"
      titleKey="dashboardPages.admin.analytics.title"
      descriptionKey="dashboardPages.admin.analytics.description"
    >
      {loading ? (
        <DashboardStatsSkeleton count={4} />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 sm:space-y-8">
          <motion.div variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl border border-[var(--brand-gold)]/20 bg-gradient-to-br from-[var(--brand-navy)] via-[var(--brand-navy-muted)] to-[#0a1520] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:p-8">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[var(--brand-gold)]/15 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-16 left-1/4 h-36 w-36 rounded-full bg-[var(--brand-gold)]/8 blur-3xl"
                aria-hidden
              />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--brand-gold)]">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    {t("adminAnalytics.heroBadge")}
                  </span>
                  <h2 className="mt-4 flex items-center gap-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                    <BarChart3 className="h-6 w-6 text-[var(--brand-gold)]" aria-hidden />
                    {t("adminAnalytics.heroTitle")}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                    {t("adminAnalytics.heroSubtitle")}
                  </p>
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-3 sm:gap-4">
                  <InsightPill
                    icon={Plus}
                    label={t("adminAnalytics.totalSignups")}
                    value={insights.totalSignups}
                  />
                  <InsightPill
                    icon={Activity}
                    label={t("adminAnalytics.avgDailyActivity")}
                    value={insights.avgActivity}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <AdminKpiStrip className="lg:grid-cols-4">
              <AdminKpiCard
                label={t("adminDashboard.students")}
                value={<AdminAnimatedNumber value={stats.total_students} />}
                icon={Users}
                iconTone="info"
              />
              <AdminKpiCard
                label={t("adminDashboard.teachers")}
                value={<AdminAnimatedNumber value={stats.total_teachers} />}
                icon={GraduationCap}
                iconTone="success"
              />
              <AdminKpiCard
                label={t("adminDashboard.activeCourses")}
                value={<AdminAnimatedNumber value={stats.active_enrollments} />}
                icon={TrendingUp}
                iconTone="gold"
              />
              <AdminKpiCard
                label={t("adminDashboard.totalRevenue")}
                value={
                  <>
                    €
                    <AdminAnimatedNumber
                      value={stats.total_earnings}
                      format={(n) => n.toLocaleString("de-DE")}
                    />
                  </>
                }
                icon={DollarSign}
                iconTone="warning"
              />
            </AdminKpiStrip>
          </motion.div>

          <motion.div variants={fadeUp}>
            {chartData ? <AdminAnalyticsCharts data={chartData} /> : null}
          </motion.div>
        </motion.div>
      )}
    </DashboardPage>
  );
}

function InsightPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Plus;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-gold)]/15">
        <Icon className="h-4 w-4 text-[var(--brand-gold)]" aria-hidden />
      </div>
      <p className="text-2xl font-bold tabular-nums text-white">
        <AdminAnimatedNumber value={value} />
      </p>
      <p className="mt-0.5 text-xs text-white/60">{label}</p>
    </div>
  );
}
