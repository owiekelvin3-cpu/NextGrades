"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { TeacherStudentsSection } from "@/components/dashboard/sections/DashboardSections";

export default function TeacherStudentsPage() {
  return (
    <DashboardPage
      role="teacher"
      titleKey="dashboardPages.teacher.students.title"
      descriptionKey="dashboardPages.teacher.students.description"
    >
      <TeacherStudentsSection />
    </DashboardPage>
  );
}
