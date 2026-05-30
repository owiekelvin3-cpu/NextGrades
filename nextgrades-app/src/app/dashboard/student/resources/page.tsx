"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { StudentResourcesSection } from "@/components/dashboard/sections/DashboardSections";

export default function StudentResourcesPage() {
  return (
    <DashboardPage
      role="student"
      titleKey="dashboardPages.student.resources.title"
      descriptionKey="dashboardPages.student.resources.description"
    >
      <StudentResourcesSection />
    </DashboardPage>
  );
}
