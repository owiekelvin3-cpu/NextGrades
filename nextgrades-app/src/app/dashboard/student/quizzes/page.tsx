"use client";

import { useTranslation } from "react-i18next";
import { StudentDashboardLayout } from "@/components/dashboard/student/StudentDashboardLayout";
import { StudentQuizzesSection } from "@/components/dashboard/sections/DashboardSections";

export default function StudentQuizzesPage() {
  const { t } = useTranslation();

  return (
    <StudentDashboardLayout
      title={t("dashboardPages.student.quizzes.title", { defaultValue: "Tasks & quizzes" })}
      description={t("dashboardPages.student.quizzes.description", {
        defaultValue: "Complete quizzes and assignments for your courses.",
      })}
    >
      <div className="mx-auto max-w-6xl">
        <StudentQuizzesSection />
      </div>
    </StudentDashboardLayout>
  );
}
