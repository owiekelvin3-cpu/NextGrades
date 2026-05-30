"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AdminTableSection } from "@/components/dashboard/sections/DashboardSections";

export default function AdminTeachersPage() {
  return (
    <DashboardPage role="admin" titleKey="dashboardPages.admin.teachers.title" descriptionKey="dashboardPages.admin.teachers.description">
      <AdminTableSection type="teachers" />
    </DashboardPage>
  );
}
