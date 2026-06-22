"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Users, GraduationCap, Shield, DollarSign, UserCog } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchAdminDashboard, type ActivityLogRow, type AdminStats } from "@/lib/dashboard/data";
import { appShell } from "@/lib/theme/shell";
import { AdminAccessGuide } from "@/components/admin/AdminAccessGuide";
import { AdminKpiCard, AdminKpiStrip } from "@/components/admin/AdminKpiCard";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { AdminActivityFeed } from "@/components/admin/AdminActivityFeed";
import { DashboardStatsSkeleton } from "@/components/ui/Skeleton";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLogRow[]>([]);
  const [pendingModeration, setPendingModeration] = useState(0);
  const [stats, setStats] = useState<AdminStats>({
    total_students: 0,
    total_teachers: 0,
    active_enrollments: 0,
    total_earnings: 0,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [dashboard, moderationRes] = await Promise.all([
          fetchAdminDashboard(10),
          fetch("/api/admin/moderation?status=pending", { credentials: "include" }),
        ]);
        const moderation = moderationRes.ok ? await moderationRes.json() : [];
        if (!cancelled) {
          setStats(dashboard.stats);
          setActivities(dashboard.activities);
          setPendingModeration(Array.isArray(moderation) ? moderation.length : 0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalUsers = stats.total_students + stats.total_teachers;

  const header = (
    <>
      <h1 className={appShell.dashboardTitle}>{t("adminDashboard.title")}</h1>
      <p className={appShell.dashboardDescription}>{t("adminDashboard.subtitle")}</p>
      <Button variant="gold" size="md" className="mt-4 w-full sm:mt-0 sm:w-auto" href="/portal/admin/users?create=1">
        <Plus className="mr-2 h-4 w-4" />
        {t("adminDashboard.newUser")}
      </Button>
    </>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">{header}</div>

      {loading ? (
        <DashboardStatsSkeleton count={5} />
      ) : (
        <div className="content-ready space-y-6">
          <AdminKpiStrip>
            <AdminKpiCard
              label={t("adminDashboard.kpiTotalUsers")}
              value={totalUsers}
              icon={UserCog}
              iconTone="info"
            />
            <AdminKpiCard
              label={t("adminDashboard.activeStudents")}
              value={stats.total_students}
              icon={Users}
              iconTone="success"
            />
            <AdminKpiCard
              label={t("adminDashboard.activeTeachers")}
              value={stats.total_teachers}
              icon={GraduationCap}
              iconTone="gold"
            />
            <AdminKpiCard
              label={t("adminDashboard.totalRevenueMonthly")}
              value={`€${stats.total_earnings.toLocaleString("de-DE")}`}
              icon={DollarSign}
              iconTone="warning"
            />
            <AdminKpiCard
              label={t("adminDashboard.kpiPendingModeration")}
              value={pendingModeration}
              icon={Shield}
              iconTone={pendingModeration > 0 ? "warning" : "muted"}
              trend={
                pendingModeration > 0
                  ? { direction: "up", label: t("adminDashboard.kpiNeedsReview") }
                  : { direction: "neutral", label: t("adminDashboard.kpiAllClear") }
              }
            />
          </AdminKpiStrip>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminQuickActions className="lg:col-span-2" />
            <AdminActivityFeed activities={activities} className="lg:col-span-2" />
          </div>

          <AdminAccessGuide />
        </div>
      )}
    </div>
  );
}
