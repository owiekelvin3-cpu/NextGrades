"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTopBar } from "@/components/mobile/MobileTopBar";
import { MobileBottomNav, MOBILE_BOTTOM_NAV_PADDING } from "@/components/mobile/MobileBottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  TrendingUp,
  FileText,
  Plus,
  Shield,
  DollarSign,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchAdminDashboard, type ActivityLogRow, type AdminStats } from "@/lib/dashboard/data";
import { appShell } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";
import { DashboardStatsSkeleton, ListRowSkeleton } from "@/components/ui/Skeleton";

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
    <div className={appShell.dashboardShell}>
      <Sidebar role="admin" />

      <div className={cn("flex min-w-0 flex-1 flex-col md:pt-0", MOBILE_BOTTOM_NAV_PADDING)}>
        <MobileTopBar role="admin" />

        <header
          className={cn(
            appShell.dashboardHeader,
            "hidden shrink-0 px-4 py-4 sm:px-6 md:block lg:px-8"
          )}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className={appShell.dashboardTitle}>{t("adminDashboard.title")}</h1>
              <p className={appShell.dashboardDescription}>{t("adminDashboard.subtitle")}</p>
            </div>
            <Button variant="gold" size="md" href="/dashboard/admin/students">
              <Plus className="mr-2 h-4 w-4" />
              {t("adminDashboard.newUser")}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="mx-auto max-w-7xl space-y-6">
              <DashboardStatsSkeleton />
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                  <div className="mb-6 h-6 w-36 skeleton rounded-lg" />
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-12 skeleton rounded-xl" />
                    ))}
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="mb-6 h-6 w-40 skeleton rounded-lg" />
                  <ListRowSkeleton rows={5} />
                </Card>
              </div>
            </div>
          ) : (
            <div className="content-ready mx-auto max-w-7xl space-y-6">
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
                <Card className="p-6">
                  <h2 className="mb-6 text-xl font-bold text-foreground">{t("adminDashboard.quickActions")}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      size="md"
                      href="/dashboard/admin/students"
                      className="w-full justify-start border-border-default text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Users className="mr-3 h-5 w-5" />
                      {t("adminDashboard.manageStudents")}
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      href="/dashboard/admin/teachers"
                      className="w-full justify-start border-border-default text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Shield className="mr-3 h-5 w-5" />
                      {t("adminDashboard.manageTeachers")}
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      href="/dashboard/admin/payments"
                      className="w-full justify-start border-border-default text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <DollarSign className="mr-3 h-5 w-5" />
                      {t("adminDashboard.managePayments")}
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      href="/portal/admin/website-content"
                      className="w-full justify-start border-border-default text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <FileText className="mr-3 h-5 w-5" />
                      {t("adminNav.websiteContent", { defaultValue: "Website content" })}
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="mb-6 text-xl font-bold text-foreground">{t("adminDashboard.recentActivity")}</h2>
                  <ul className="space-y-4">
                    {activities.length === 0 ? (
                      <li className="rounded-xl p-4 text-center text-text-muted">{t("adminDashboard.subtitle")}</li>
                    ) : null}
                    {activities.map((activity) => (
                      <li
                        key={activity.id}
                        className="flex items-center gap-4 rounded-xl bg-surface-subtle p-3"
                      >
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
        </main>
      </div>

      <MobileBottomNav role="admin" />
    </div>
  );
}
