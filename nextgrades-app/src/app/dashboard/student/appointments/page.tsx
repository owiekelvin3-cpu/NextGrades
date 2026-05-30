"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { StudentAppointmentsSection } from "@/components/dashboard/sections/DashboardSections";

export default function StudentAppointmentsPage() {
  return (
    <DashboardPage
      role="student"
      titleKey="dashboardPages.student.appointments.title"
      descriptionKey="dashboardPages.student.appointments.description"
    >
      <StudentAppointmentsSection />
    </DashboardPage>
  );
}
