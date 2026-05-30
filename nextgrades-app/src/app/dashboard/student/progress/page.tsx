"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { StudentProgressSection } from "@/components/dashboard/sections/DashboardSections";

export default function StudentProgressPage() {
  return (
    <DashboardPage
      role="student"
      titleKey="dashboardPages.student.progress.title"
      descriptionKey="dashboardPages.student.progress.description"
    >
      <StudentProgressSection />
    </DashboardPage>
  );
}
