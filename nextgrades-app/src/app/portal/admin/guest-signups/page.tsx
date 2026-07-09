"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AdminGuestSignupsPanel } from "@/components/admin/AdminGuestSignupsPanel";

export default function AdminGuestSignupsPage() {
  return (
    <DashboardPage
      role="admin"
      titleKey="dashboardPages.admin.guestSignups.title"
      descriptionKey="dashboardPages.admin.guestSignups.description"
    >
      <AdminGuestSignupsPanel />
    </DashboardPage>
  );
}
