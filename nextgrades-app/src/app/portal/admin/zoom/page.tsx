"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Video, Users, Calendar, Loader2, Radio } from "lucide-react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { Card } from "@/components/ui/Card";
import { AdminKpiCard, AdminKpiStrip } from "@/components/admin/AdminKpiCard";
import { AdminTableStatusBadge } from "@/components/admin/AdminTable";

type AdminZoomData = {
  connectedTeachers: number;
  totalMeetings: number;
  upcomingMeetings: number;
  activeMeetings: number;
  connections: { teacher_id: string; zoom_email: string | null; connected_at: string }[];
  oauth?: {
    configured: boolean;
    oauthEnv: "production" | "development";
    multiUserReady: boolean;
    redirectUri: string;
  };
  teachers?: {
    id: string;
    name: string | null;
    email: string | null;
    zoomConnected: boolean;
    zoomEmail: string | null;
  }[];
  upcoming: {
    id: string;
    meeting_title: string | null;
    start_time: string;
    duration: number;
    meeting_type: string | null;
    zoom_link: string | null;
    teacher_name: string | null;
  }[];
};

export function AdminZoomDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<AdminZoomData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/zoom")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-gold)]" />
      </div>
    );
  }

  const stats = [
    {
      label: t("zoom.admin.connectedTeachers", { defaultValue: "Connected teachers" }),
      value: data?.connectedTeachers ?? 0,
      icon: Users,
      tone: "info" as const,
    },
    {
      label: t("zoom.admin.totalMeetings", { defaultValue: "Total Zoom meetings" }),
      value: data?.totalMeetings ?? 0,
      icon: Video,
      tone: "gold" as const,
    },
    {
      label: t("zoom.admin.upcomingMeetings", { defaultValue: "Upcoming meetings" }),
      value: data?.upcomingMeetings ?? 0,
      icon: Calendar,
      tone: "success" as const,
    },
    {
      label: t("zoom.admin.activeMeetings", { defaultValue: "Active now" }),
      value: data?.activeMeetings ?? 0,
      icon: Radio,
      tone: "warning" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {data?.oauth?.configured && !data.oauth.multiUserReady && (
        <div className="theme-alert-warning rounded-xl px-4 py-4 text-sm">
          <p className="font-semibold">
            {t("zoom.admin.oauthDevWarning", {
              defaultValue: "Zoom OAuth is in Development mode - external teachers cannot connect.",
            })}
          </p>
          <p className="mt-2 opacity-90">
            {t("zoom.admin.oauthDevHint", {
              defaultValue:
                "Set ZOOM_OAUTH_ENV=production and use the Production Client ID, Client Secret, and redirect URL from Zoom Marketplace (Beta Test or Published app). Development credentials only work for the Zoom account that created the app.",
            })}
          </p>
          <p className="mt-2 text-xs opacity-80">
            {t("zoom.admin.oauthRedirect", {
              defaultValue: "Current redirect URI: {{uri}}",
              uri: data.oauth.redirectUri,
            })}
          </p>
        </div>
      )}

      {data?.oauth?.multiUserReady && (
        <div className="theme-alert-success rounded-xl px-4 py-3 text-sm">
          {t("zoom.admin.oauthProductionOk", {
            defaultValue: "Zoom OAuth is configured for multi-teacher use (Production mode).",
          })}
        </div>
      )}

      <AdminKpiStrip className="sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4">
        {stats.map((s) => (
          <AdminKpiCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconTone={s.tone} />
        ))}
      </AdminKpiStrip>

      <Card hoverable={false} className="overflow-hidden p-0">
        <div className="border-b border-[var(--table-border)] px-5 py-4">
          <h2 className="text-base font-bold text-foreground">
            {t("zoom.admin.upcomingList", { defaultValue: "Upcoming meetings" })}
          </h2>
        </div>
        <div className="p-5">
          {!data?.upcoming?.length ? (
            <p className="text-sm text-text-muted">{t("zoom.noMeetings", { defaultValue: "No upcoming meetings" })}</p>
          ) : (
            <ul className="divide-y divide-border-default">
              {data.upcoming.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-foreground">{m.meeting_title || "Live class"}</p>
                    <p className="text-xs text-text-muted">
                      {m.teacher_name} · {new Date(m.start_time).toLocaleString()} · {m.duration} min
                    </p>
                  </div>
                  {m.zoom_link && (
                    <a
                      href={m.zoom_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#2D8CFF] hover:underline"
                    >
                      {t("zoom.joinLink", { defaultValue: "Join link" })}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card hoverable={false} className="overflow-hidden p-0">
        <div className="border-b border-[var(--table-border)] px-5 py-4">
          <h2 className="text-base font-bold text-foreground">
            {t("zoom.admin.teacherStatus", { defaultValue: "Teacher Zoom status" })}
          </h2>
        </div>
        <div className="p-5">
          {!data?.teachers?.length ? (
            <p className="text-sm text-text-muted">
              {t("zoom.admin.noConnections", { defaultValue: "No teachers connected yet" })}
            </p>
          ) : (
            <ul className="divide-y divide-border-default">
              {data.teachers.map((teacher) => (
                <li key={teacher.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-foreground">{teacher.name || teacher.email || teacher.id}</p>
                    {teacher.zoomEmail && <p className="text-xs text-text-muted">{teacher.zoomEmail}</p>}
                  </div>
                  <AdminTableStatusBadge
                    label={
                      teacher.zoomConnected
                        ? t("zoom.statusConnected", { defaultValue: "Connected" })
                        : t("zoom.statusDisconnected", { defaultValue: "Not connected" })
                    }
                    variant={teacher.zoomConnected ? "success" : "default"}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card hoverable={false} className="overflow-hidden p-0">
        <div className="border-b border-[var(--table-border)] px-5 py-4">
          <h2 className="text-base font-bold text-foreground">
            {t("zoom.admin.connections", { defaultValue: "Connected Zoom accounts" })}
          </h2>
        </div>
        <div className="p-5">
          {!data?.connections?.length ? (
            <p className="text-sm text-text-muted">
              {t("zoom.admin.noConnections", { defaultValue: "No teachers connected yet" })}
            </p>
          ) : (
            <ul className="space-y-2">
              {data.connections.map((c) => (
                <li
                  key={c.teacher_id}
                  className="flex justify-between gap-3 rounded-xl border border-border-default bg-surface-subtle px-3 py-2.5 text-sm"
                >
                  <span className="font-medium text-foreground">{c.zoom_email || c.teacher_id}</span>
                  <span className="text-text-muted">{new Date(c.connected_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function AdminZoomPage() {
  return (
    <DashboardPage role="admin" titleKey="zoom.admin.title" descriptionKey="zoom.admin.subtitle">
      <AdminZoomDashboard />
    </DashboardPage>
  );
}
