"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  TrendingUp,
  Plus,
  Shield,
  DollarSign,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchAdminDashboard, type ActivityLogRow, type AdminStats } from "@/lib/dashboard/data";
import { appShell } from "@/lib/theme/shell";
import { AdminNavHub } from "@/components/admin/AdminNavHub";
import { AdminAccessGuide } from "@/components/admin/AdminAccessGuide";
import { DashboardStatsSkeleton, ListRowSkeleton, DashboardHubSkeleton } from "@/components/ui/Skeleton";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLogRow[]>([]);
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
        const { stats: statsData, activities: activityData } = await fetchAdminDashboard(10);
        if (!cancelled) {
          setStats(statsData);
          setActivities(activityData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="hidden md:flex md:flex-col md:gap-4 md:sm:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={appShell.dashboardTitle}>{t("adminDashboard.title")}</h1>
          <p className={appShell.dashboardDescription}>{t("adminDashboard.subtitle")}</p>
        </div>
        <Button variant="gold" size="md" href="/portal/admin/users?create=1">
          <Plus className="mr-2 h-4 w-4" />
          {t("adminDashboard.newUser")}
        </Button>
      </div>

      <div className="md:hidden">
        <h1 className={appShell.dashboardTitle}>{t("adminDashboard.title")}</h1>
        <p className={appShell.dashboardDescription}>{t("adminDashboard.subtitle")}</p>
        <Button variant="gold" size="md" className="mt-4 w-full sm:w-auto" href="/portal/admin/users?create=1">
          <Plus className="mr-2 h-4 w-4" />
          {t("adminDashboard.newUser")}
        </Button>
      </div>

      {loading ? (
        <>
          <DashboardStatsSkeleton />
          <Card className="p-6">
            <div className="mb-4 h-6 w-48 skeleton rounded-lg" />
            <DashboardHubSkeleton />
          </Card>
          <Card className="p-6">
            <div className="mb-6 h-6 w-40 skeleton rounded-lg" />
            <ListRowSkeleton rows={5} />
          </Card>
        </>
      ) : (
        <div className="content-ready space-y-6">
          <AdminAccessGuide />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4DA3FF]/10">
                  <Users className="h-6 w-6 text-[#4DA3FF]" />
                </div>
                <Badge variant="gold">{t("adminDashboard.students")}</Badge>
              </div>
              <p className="mb-1 text-3xl font-bold text-foreground">{stats.total_students}</p>
              <p className="text-text-muted">{t("adminDashboard.activeStudents")}</p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#22C55E]/10">
                  <Shield className="h-6 w-6 text-[#22C55E]" />
                </div>
                <Badge variant="success">{t("adminDashboard.teachers")}</Badge>
              </div>
              <p className="mb-1 text-3xl font-bold text-foreground">{stats.total_teachers}</p>
              <p className="text-text-muted">{t("adminDashboard.activeTeachers")}</p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/10">
                  <TrendingUp className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <Badge variant="warning">{t("adminDashboard.courses")}</Badge>
              </div>
              <p className="mb-1 text-3xl font-bold text-foreground">{stats.active_enrollments}</p>
              <p className="text-text-muted">{t("adminDashboard.activeCourses")}</p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F97316]/10">
                  <DollarSign className="h-6 w-6 text-[#F97316]" />
                </div>
                <Badge variant="warning">{t("adminDashboard.revenue")}</Badge>
              </div>
              <p className="mb-1 text-3xl font-bold text-foreground">
                €{stats.total_earnings.toLocaleString("de-DE")}
              </p>
              <p className="text-text-muted">{t("adminDashboard.totalRevenueMonthly")}</p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 lg:col-span-2">
              <h2 className="mb-2 text-xl font-bold text-foreground">{t("adminHub.browseAll")}</h2>
              <p className="mb-6 text-sm text-text-muted">{t("adminDashboard.subtitle")}</p>
              <AdminNavHub />
            </Card>

            <Card className="p-6">
              <h2 className="mb-6 text-xl font-bold text-foreground">{t("adminDashboard.recentActivity")}</h2>
              <ul className="space-y-4">
                {activities.length === 0 ? (
                  <li className="rounded-xl p-4 text-center text-text-muted">{t("adminDashboard.subtitle")}</li>
                ) : null}
                {activities.map((activity) => (
                  <li key={activity.id} className="flex items-center gap-4 rounded-xl bg-surface-subtle p-3">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{activity.title}</p>
                      <p className="text-sm text-text-muted">{activity.time}</p>
                    </div>
                    <Badge variant={activity.type}>{activity.type}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
