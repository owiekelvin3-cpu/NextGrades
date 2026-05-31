"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AdminTableSection } from "@/components/dashboard/sections/DashboardSections";

export default function AdminStudentsPage() {
  return (
    <DashboardPage role="admin" titleKey="dashboardPages.admin.students.title" descriptionKey="dashboardPages.admin.students.description">
      <AdminTableSection type="students" />
    </DashboardPage>
  );
}
