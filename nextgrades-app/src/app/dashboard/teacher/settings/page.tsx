"use client";

import { Suspense } from "react";
import { TeacherDashboardLayout } from "@/components/dashboard/teacher/TeacherDashboardLayout";
import { TeacherSettingsPanel } from "@/components/dashboard/settings/SettingsPanels";
import { useTranslation } from "react-i18next";

export default function TeacherSettingsPage() {
  const { t } = useTranslation();

  return (
    <TeacherDashboardLayout title={t("settings.title", { defaultValue: "Settings" })}>
      <Suspense fallback={null}>
        <TeacherSettingsPanel />
      </Suspense>
    </TeacherDashboardLayout>
  );
}
