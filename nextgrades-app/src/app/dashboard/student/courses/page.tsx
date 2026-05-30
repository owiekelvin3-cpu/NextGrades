"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { StudentCoursesSection } from "@/components/dashboard/sections/DashboardSections";

export default function StudentCoursesPage() {
  return (
    <DashboardPage
      role="student"
      titleKey="dashboardPages.student.courses.title"
      descriptionKey="dashboardPages.student.courses.description"
    >
      <StudentCoursesSection />
    </DashboardPage>
  );
}
