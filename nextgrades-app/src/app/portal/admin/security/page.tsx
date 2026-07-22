"use client";

import { useEffect, useState } from "react";
import { Shield, AlertTriangle, Lock, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { AdminKpiCard, AdminKpiStrip } from "@/components/admin/AdminKpiCard";
import { AdminTable, AdminTableStatusBadge } from "@/components/admin/AdminTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

type SecurityPayload = {
  stats: {
    failedLogins7d: number;
    activeLockouts: number;
    recentEventCount: number;
    loginOtpSent: number;
    suspiciousEvents: number;
  };
  recentEvents: Array<{
    id: string;
    event_type: string;
    success: boolean;
    email: string | null;
    ip_address: string | null;
    created_at: string;
  }>;
  activeLockouts: Array<{
    email: string;
    ip_address: string | null;
    failed_attempts: number;
    locked_until: string | null;
  }>;
};

export default function AdminSecurityPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<SecurityPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/admin/security")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load security data");
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title={t("adminSecurity.title")}
        description={t("adminSecurity.subtitle")}
        showBack={false}
      />

      {error && (
        <Card hoverable={false} className="theme-alert-error mb-4 p-4 text-sm">{error}</Card>
      )}

      <AdminKpiStrip className="mb-6 xl:grid-cols-4 2xl:grid-cols-4">
        <AdminKpiCard
          label={t("adminSecurity.failedLogins")}
          value={stats?.failedLogins7d ?? "-"}
          icon={AlertTriangle}
          iconTone="warning"
        />
        <AdminKpiCard
          label={t("adminSecurity.activeLockouts")}
          value={stats?.activeLockouts ?? "-"}
          icon={Lock}
          iconTone="gold"
        />
        <AdminKpiCard
          label={t("adminSecurity.loginOtpSent")}
          value={stats?.loginOtpSent ?? "-"}
          icon={Activity}
          iconTone="info"
        />
        <AdminKpiCard
          label={t("adminSecurity.suspiciousEvents")}
          value={stats?.suspiciousEvents ?? "-"}
          icon={Shield}
          iconTone={stats?.suspiciousEvents ? "warning" : "success"}
        />
      </AdminKpiStrip>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminTable
          title={t("adminSecurity.recentEvents")}
          columns={[
            {
              id: "event",
              header: t("adminSecurity.colEvent"),
              cell: (e) => (
                <AdminTableStatusBadge
                  label={e.event_type}
                  variant={e.success ? "success" : "warning"}
                />
              ),
            },
            {
              id: "email",
              header: t("adminSecurity.colEmail"),
              cell: (e) => <span className="text-text-muted">{e.email || "-"}</span>,
            },
            {
              id: "ip",
              header: t("adminSecurity.colIp"),
              cell: (e) => <span className="text-text-muted">{e.ip_address || "-"}</span>,
            },
            {
              id: "time",
              header: t("adminSecurity.colTime"),
              sortable: true,
              sortValue: (e) => e.created_at,
              cell: (e) => (
                <span className="text-text-muted">{new Date(e.created_at).toLocaleString()}</span>
              ),
            },
          ]}
          data={data?.recentEvents ?? []}
          loading={loading}
          dense
          stickyHeader
        />

        <Card hoverable={false} className="overflow-hidden">
          <div className="border-b border-[var(--table-border)] px-4 py-3 font-semibold text-foreground">
            {t("adminSecurity.lockoutsTitle")}
          </div>
          <div className="max-h-[480px] overflow-auto p-4 text-sm">
            {(data?.activeLockouts ?? []).length === 0 ? (
              <p className="py-8 text-center text-text-muted">{t("adminSecurity.noLockouts")}</p>
            ) : (
              <ul className="space-y-3">
                {data?.activeLockouts.map((lockout, index) => (
                  <li
                    key={`${lockout.email}-${index}`}
                    className="rounded-xl border border-border-default bg-surface-subtle p-3"
                  >
                    <p className="font-medium text-foreground">{lockout.email}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {t("adminSecurity.failures", { count: lockout.failed_attempts })} · IP{" "}
                      {lockout.ip_address || t("adminSecurity.ipUnknown")} ·{" "}
                      {t("adminSecurity.until", {
                        date: lockout.locked_until
                          ? new Date(lockout.locked_until).toLocaleString()
                          : "-",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
