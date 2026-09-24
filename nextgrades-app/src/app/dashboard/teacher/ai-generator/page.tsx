"use client";

import { AIGeneratorContent } from "@/components/dashboard/AIGeneratorContent";
import { TeacherDashboardLayout } from "@/components/dashboard/teacher/TeacherDashboardLayout";
import { useTranslation } from "react-i18next";

export default function TeacherAIGeneratorPage() {
  const { t } = useTranslation();
  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.aiGenerator")}
      description={t("teacherDashboard.aiGeneratorSubtitle")}
    >
      <AIGeneratorContent />
    </TeacherDashboardLayout>
  );
}
