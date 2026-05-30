"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { TeacherEarningsSection } from "@/components/dashboard/sections/DashboardSections";

export default function TeacherEarningsPage() {
  return (
    <DashboardPage
      role="teacher"
      titleKey="dashboardPages.teacher.earnings.title"
      descriptionKey="dashboardPages.teacher.earnings.description"
    >
      <TeacherEarningsSection />
    </DashboardPage>
  );
}
