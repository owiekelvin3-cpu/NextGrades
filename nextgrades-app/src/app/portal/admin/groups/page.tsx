"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AdminGroupsManager } from "@/components/admin/AdminGroupsManager";

export default function AdminGroupsPage() {
  return (
    <DashboardPage
      role="admin"
      titleKey="adminGroups.title"
      descriptionKey="adminGroups.description"
    >
      <AdminGroupsManager />
    </DashboardPage>
  );
}
