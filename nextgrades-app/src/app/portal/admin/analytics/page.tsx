"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AdminKpiCard, AdminKpiStrip } from "@/components/admin/AdminKpiCard";
import { AdminAnalyticsCharts } from "@/components/admin/AdminAnalyticsCharts";
import { fetchAdminStats } from "@/lib/dashboard/data";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, GraduationCap, TrendingUp, DollarSign } from "lucide-react";
import { DashboardStatsSkeleton } from "@/components/ui/Skeleton";

export default function AdminAnalyticsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    active_enrollments: 0,
    total_earnings: 0,
  });

  useEffect(() => {
    void (async () => {
      setStats(await fetchAdminStats());
      setLoading(false);
    })();
  }, []);

  return (
    <DashboardPage
      role="admin"
      titleKey="dashboardPages.admin.analytics.title"
      descriptionKey="dashboardPages.admin.analytics.description"
    >
      {loading ? (
        <DashboardStatsSkeleton />
      ) : (
        <div className="space-y-6">
          <AdminKpiStrip className="lg:grid-cols-4">
            <AdminKpiCard
              label={t("adminDashboard.students")}
              value={stats.total_students}
              icon={Users}
              iconTone="info"
            />
            <AdminKpiCard
              label={t("adminDashboard.teachers")}
              value={stats.total_teachers}
              icon={GraduationCap}
              iconTone="success"
            />
            <AdminKpiCard
              label={t("adminDashboard.activeCourses")}
              value={stats.active_enrollments}
              icon={TrendingUp}
              iconTone="gold"
            />
            <AdminKpiCard
              label={t("adminDashboard.totalRevenue")}
              value={`€${stats.total_earnings.toLocaleString("de-DE")}`}
              icon={DollarSign}
              iconTone="warning"
            />
          </AdminKpiStrip>
          <AdminAnalyticsCharts />
        </div>
      )}
    </DashboardPage>
  );
}
