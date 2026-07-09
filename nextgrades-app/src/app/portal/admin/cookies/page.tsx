"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { Cookie, Download, Save, BarChart3 } from "lucide-react";
import type { CookieConsentSettings, ConsentStats } from "@/lib/cookies/types";
import { useToast } from "@/context/ToastContext";

type RecentRecord = {
  consent_id: string;
  action: string;
  created_at: string;
  locale: string | null;
};

export default function AdminCookiesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CookieConsentSettings | null>(null);
  const [stats, setStats] = useState<ConsentStats | null>(null);
  const [recent, setRecent] = useState<RecentRecord[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cookies");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setSettings(data.settings);
      setStats(data.stats);
      setRecent(data.recent ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("cookies.admin.loadError"));
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cookies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSettings(data.settings);
      toast.success(t("cookies.admin.saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("cookies.admin.saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardPage
      role="admin"
      titleKey="cookies.admin.title"
      descriptionKey="cookies.admin.description"
    >
      <div className="space-y-6">
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t("cookies.admin.stats.total"), value: stats.total, icon: Cookie },
              { label: t("cookies.admin.stats.acceptAll"), value: stats.acceptAll, icon: BarChart3 },
              { label: t("cookies.admin.stats.reject"), value: stats.rejectNonEssential, icon: BarChart3 },
              { label: t("cookies.admin.stats.analytics"), value: stats.analyticsOptIn, icon: BarChart3 },
            ].map((item) => (
              <Card key={item.label} className="p-4">
                <p className="text-xs font-medium text-text-muted">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{item.value}</p>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-foreground">{t("cookies.admin.settingsTitle")}</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                href="/api/admin/cookies/export"
                className="inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t("cookies.admin.export")}
              </Button>
              <Button variant="gold" size="sm" disabled={saving || loading || !settings} onClick={() => void save()}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? t("cookies.admin.saving") : t("cookies.admin.save")}
              </Button>
            </div>
          </div>

          {loading || !settings ? (
            <p className="text-sm text-text-muted">{t("cookies.admin.loading")}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("cookies.admin.gaId")}</span>
                <input
                  className="w-full rounded-lg border border-border-default bg-surface-elevated px-3 py-2 text-sm"
                  value={settings.googleAnalyticsId ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, googleAnalyticsId: e.target.value || null })
                  }
                  placeholder="G-XXXXXXXXXX"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("cookies.admin.policyVersion")}</span>
                <input
                  className="w-full rounded-lg border border-border-default bg-surface-elevated px-3 py-2 text-sm"
                  value={settings.policyVersion}
                  onChange={(e) => setSettings({ ...settings, policyVersion: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-foreground">{t("cookies.admin.maxAge")}</span>
                <input
                  type="number"
                  min={30}
                  max={730}
                  className="w-full rounded-lg border border-border-default bg-surface-elevated px-3 py-2 text-sm"
                  value={settings.cookieMaxAgeDays}
                  onChange={(e) =>
                    setSettings({ ...settings, cookieMaxAgeDays: Number(e.target.value) || 365 })
                  }
                />
              </label>
              <label className="block text-sm md:col-span-2">
                <span className="mb-1 block font-medium text-foreground">{t("cookies.admin.analyticsScript")}</span>
                <input
                  className="w-full rounded-lg border border-border-default bg-surface-elevated px-3 py-2 text-sm"
                  value={settings.analyticsScriptUrl ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, analyticsScriptUrl: e.target.value || null })
                  }
                  placeholder="https://"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.analyticsEnabled}
                  onChange={(e) => setSettings({ ...settings, analyticsEnabled: e.target.checked })}
                />
                {t("cookies.admin.enableAnalytics")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settings.marketingEnabled}
                  onChange={(e) => setSettings({ ...settings, marketingEnabled: e.target.checked })}
                />
                {t("cookies.admin.enableMarketing")}
              </label>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-bold text-foreground">{t("cookies.admin.recentTitle")}</h2>
          <div className="responsive-table-wrap">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-default text-text-muted">
                  <th className="py-2 pr-4 font-medium">{t("cookies.admin.table.action")}</th>
                  <th className="py-2 pr-4 font-medium">{t("cookies.admin.table.locale")}</th>
                  <th className="py-2 font-medium">{t("cookies.admin.table.date")}</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-text-muted">
                      {t("cookies.admin.noRecords")}
                    </td>
                  </tr>
                ) : (
                  recent.slice(0, 20).map((row) => (
                    <tr key={`${row.consent_id}-${row.created_at}`} className="border-b border-border-default/50">
                      <td className="py-2 pr-4 capitalize text-foreground">{row.action.replace(/_/g, " ")}</td>
                      <td className="py-2 pr-4 text-text-muted">{row.locale ?? "-"}</td>
                      <td className="py-2 text-text-muted">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardPage>
  );
}
