"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { StudentQuizzesSection } from "@/components/dashboard/sections/DashboardSections";

export default function StudentQuizzesPage() {
  return (
    <DashboardPage
      role="student"
      titleKey="dashboardPages.student.quizzes.title"
      descriptionKey="dashboardPages.student.quizzes.description"
    >
      <StudentQuizzesSection />
    </DashboardPage>
  );
}
