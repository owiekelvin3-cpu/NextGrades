"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AdminTeacherAssignments } from "@/components/admin/AdminTeacherAssignments";

export default function AdminTeacherAssignmentsPage() {
  return (
    <DashboardPage
      role="admin"
      titleKey="adminTeacherAssignments.title"
      descriptionKey="adminTeacherAssignments.description"
    >
      <AdminTeacherAssignments />
    </DashboardPage>
  );
}
