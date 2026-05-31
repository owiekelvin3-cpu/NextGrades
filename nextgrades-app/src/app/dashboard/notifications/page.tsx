"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StudentDashboardLayout } from "@/components/dashboard/student/StudentDashboardLayout";
import { TeacherDashboardLayout } from "@/components/dashboard/teacher/TeacherDashboardLayout";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { fetchProfileSettings } from "@/lib/dashboard/profile-settings";
import { appShell } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";

import { ADMIN_PORTAL_PREFIX } from "@/lib/admin/portal-paths";

function settingsPathForRole(role: "student" | "teacher" | "admin") {
  if (role === "teacher") return "/dashboard/teacher/settings";
  if (role === "admin") return `${ADMIN_PORTAL_PREFIX}/users`;
  return "/dashboard/student/settings";
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [role, setRole] = useState<"student" | "teacher" | "admin">("student");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchProfileSettings().then((p) => {
      if (p?.role === "teacher" || p?.role === "admin" || p?.role === "student") {
        setRole(p.role);
      }
      setReady(true);
    });
  }, []);

  const title = t("notifications.title", { defaultValue: "Notifications" });
  const settingsHref = settingsPathForRole(role);

  const center = <NotificationCenter embedded settingsHref={settingsHref} />;

  if (!ready) {
    return (
      <div className={cn("flex min-h-screen items-center justify-center text-sm text-text-muted", appShell.dashboardShell)}>
        {t("misc.loading", { defaultValue: "Loading..." })}
      </div>
    );
  }

  if (role === "teacher") {
    return <TeacherDashboardLayout title={title}>{center}</TeacherDashboardLayout>;
  }

  if (role === "admin") {
    return (
      <DashboardPage role="admin" titleKey="notifications.title">
        <NotificationCenter embedded settingsHref={settingsHref} />
      </DashboardPage>
    );
  }

  return <StudentDashboardLayout title={title}>{center}</StudentDashboardLayout>;
}
