"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AIGeneratorContent } from "@/components/dashboard/AIGeneratorContent";

export default function AdminAIGeneratorPage() {
  return (
    <DashboardPage
      role="admin"
      titleKey="dashboardPages.admin.aiGenerator.title"
      descriptionKey="dashboardPages.admin.aiGenerator.description"
    >
      <AIGeneratorContent />
    </DashboardPage>
  );
}
