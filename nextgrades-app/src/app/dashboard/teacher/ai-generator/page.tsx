"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AIGeneratorContent } from "@/components/dashboard/AIGeneratorContent";

export default function TeacherAIGeneratorPage() {
  return (
    <DashboardPage
      role="teacher"
      titleKey="dashboardPages.teacher.aiGenerator.title"
      descriptionKey="dashboardPages.teacher.aiGenerator.description"
    >
      <AIGeneratorContent />
    </DashboardPage>
  );
}
