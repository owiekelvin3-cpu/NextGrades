"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Users, GraduationCap, Shield, DollarSign, UserCog, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchAdminDashboard, type ActivityLogRow, type AdminStats } from "@/lib/dashboard/data";
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--brand-gold)]/15 bg-gradient-to-br from-[var(--brand-navy)] via-[var(--brand-navy-muted)] to-[#0a1520] p-6 text-white shadow-[0_20px_50px_rgba(13,27,42,0.25)] sm:p-8">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[var(--brand-gold)]/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-[var(--brand-gold)]/5 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--brand-gold)]">
              <Sparkles className="h-3 w-3" aria-hidden />
              {t("adminShell.portalBadge")}
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{t("adminDashboard.title")}</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              {t("adminDashboard.subtitle")}
            </p>
          </div>
          <Button
            variant="gold"
            size="md"
            className="w-full shrink-0 sm:w-auto"
            href="/portal/admin/users?create=1"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("adminDashboard.newUser")}
          </Button>
        </div>
      </div>

      {loading ? (
        <DashboardStatsSkeleton count={5} />
      ) : (
        <div className="content-ready space-y-6 sm:space-y-8">
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
