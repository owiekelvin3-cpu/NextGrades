"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AdminTeacherPayrollPanel } from "@/components/admin/AdminTeacherPayrollPanel";

export default function AdminTeacherPayrollPage() {
  return (
    <DashboardPage
      role="admin"
      titleKey="adminTeacherPayroll.title"
      descriptionKey="adminTeacherPayroll.description"
    >
      <AdminTeacherPayrollPanel />
    </DashboardPage>
  );
}
