"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AdminLessonsManager } from "@/components/admin/AdminLessonsManager";

export default function AdminLessonsPage() {
  return (
    <DashboardPage
      role="admin"
      titleKey="adminLessons.title"
      descriptionKey="adminLessons.description"
    >
      <AdminLessonsManager />
    </DashboardPage>
  );
}
