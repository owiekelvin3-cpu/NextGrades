"use client";

import { StudentDashboardLayout } from "@/components/dashboard/student/StudentDashboardLayout";
import { StudentSettingsPanel } from "@/components/dashboard/settings/SettingsPanels";
import { useTranslation } from "react-i18next";

export default function StudentSettingsPage() {
  const { t } = useTranslation();

  return (
    <StudentDashboardLayout title={t("settings.title", { defaultValue: "Settings" })}>
      <StudentSettingsPanel role="student" />
    </StudentDashboardLayout>
  );
}
