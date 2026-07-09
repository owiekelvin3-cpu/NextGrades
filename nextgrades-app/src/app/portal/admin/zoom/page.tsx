"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Video, Users, Calendar, Loader2, Radio } from "lucide-react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";

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
  const { theme } = useTheme();
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
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const stats = [
    {
      label: t("zoom.admin.connectedTeachers", { defaultValue: "Connected teachers" }),
      value: data?.connectedTeachers ?? 0,
      icon: Users,
    },
    {
      label: t("zoom.admin.totalMeetings", { defaultValue: "Total Zoom meetings" }),
      value: data?.totalMeetings ?? 0,
      icon: Video,
    },
    {
      label: t("zoom.admin.upcomingMeetings", { defaultValue: "Upcoming meetings" }),
      value: data?.upcomingMeetings ?? 0,
      icon: Calendar,
    },
    {
      label: t("zoom.admin.activeMeetings", { defaultValue: "Active now" }),
      value: data?.activeMeetings ?? 0,
      icon: Radio,
    },
  ];

  return (
    <div className="space-y-6">
      {data?.oauth?.configured && !data.oauth.multiUserReady && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-semibold">
            {t("zoom.admin.oauthDevWarning", {
              defaultValue: "Zoom OAuth is in Development mode - external teachers cannot connect.",
            })}
          </p>
          <p className="mt-2 text-amber-900">
            {t("zoom.admin.oauthDevHint", {
              defaultValue:
                "Set ZOOM_OAUTH_ENV=production and use the Production Client ID, Client Secret, and redirect URL from Zoom Marketplace (Beta Test or Published app). Development credentials only work for the Zoom account that created the app.",
            })}
          </p>
          <p className="mt-2 text-xs text-amber-800">
            {t("zoom.admin.oauthRedirect", {
              defaultValue: "Current redirect URI: {{uri}}",
              uri: data.oauth.redirectUri,
            })}
          </p>
        </div>
      )}

      {data?.oauth?.multiUserReady && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          {t("zoom.admin.oauthProductionOk", {
            defaultValue: "Zoom OAuth is configured for multi-teacher use (Production mode).",
          })}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className={`p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="mt-1 text-2xl font-bold">{s.value}</p>
              </div>
              <s.icon className="h-8 w-8 text-[#D4AF37]/60" />
            </div>
          </Card>
        ))}
      </div>

      <Card className={`p-6`}>
        <h2 className="mb-4 text-sm font-semibold">
          {t("zoom.admin.upcomingList", { defaultValue: "Upcoming meetings" })}
        </h2>
        {!data?.upcoming?.length ? (
          <p className="text-sm text-gray-500">{t("zoom.noMeetings", { defaultValue: "No upcoming meetings" })}</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-white/10">
            {data.upcoming.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{m.meeting_title || "Live class"}</p>
                  <p className="text-xs text-gray-500">
                    {m.teacher_name} · {new Date(m.start_time).toLocaleString()} · {m.duration} min
                  </p>
                </div>
                {m.zoom_link && (
                  <a
                    href={m.zoom_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-[#2D8CFF] hover:underline"
                  >
                    {t("zoom.joinLink", { defaultValue: "Join link" })}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className={`p-6`}>
        <h2 className="mb-4 text-sm font-semibold">
          {t("zoom.admin.teacherStatus", { defaultValue: "Teacher Zoom status" })}
        </h2>
        {!data?.teachers?.length ? (
          <p className="text-sm text-gray-500">{t("zoom.admin.noConnections", { defaultValue: "No teachers connected yet" })}</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-white/10">
            {data.teachers.map((teacher) => (
              <li key={teacher.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium">{teacher.name || teacher.email || teacher.id}</p>
                  {teacher.zoomEmail && <p className="text-xs text-gray-500">{teacher.zoomEmail}</p>}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    teacher.zoomConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {teacher.zoomConnected
                    ? t("zoom.statusConnected", { defaultValue: "Connected" })
                    : t("zoom.statusDisconnected", { defaultValue: "Not connected" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className={`p-6`}>
        <h2 className="mb-4 text-sm font-semibold">
          {t("zoom.admin.connections", { defaultValue: "Connected Zoom accounts" })}
        </h2>
        {!data?.connections?.length ? (
          <p className="text-sm text-gray-500">{t("zoom.admin.noConnections", { defaultValue: "No teachers connected yet" })}</p>
        ) : (
          <ul className="space-y-2">
            {data.connections.map((c) => (
              <li key={c.teacher_id} className="flex justify-between text-sm">
                <span>{c.zoom_email || c.teacher_id}</span>
                <span className="text-gray-400">{new Date(c.connected_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default function AdminZoomPage() {
  return (
    <DashboardPage role="admin" titleKey="zoom.admin.title">
      <AdminZoomDashboard />
    </DashboardPage>
  );
}
