"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { TeacherScheduleSection } from "@/components/dashboard/sections/DashboardSections";

export default function TeacherSchedulePage() {
  return (
    <DashboardPage
      role="teacher"
      titleKey="dashboardPages.teacher.schedule.title"
      descriptionKey="dashboardPages.teacher.schedule.description"
    >
      <TeacherScheduleSection />
    </DashboardPage>
  );
}
