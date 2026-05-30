"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { TeacherResourcesSection } from "@/components/dashboard/sections/DashboardSections";

export default function TeacherResourcesPage() {
  return (
    <DashboardPage
      role="teacher"
      titleKey="dashboardPages.teacher.resources.title"
      descriptionKey="dashboardPages.teacher.resources.description"
    >
      <TeacherResourcesSection />
    </DashboardPage>
  );
}
