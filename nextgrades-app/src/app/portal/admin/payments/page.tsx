"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AdminTableSection } from "@/components/dashboard/sections/DashboardSections";

export default function AdminPaymentsPage() {
  return (
    <DashboardPage role="admin" titleKey="dashboardPages.admin.payments.title" descriptionKey="dashboardPages.admin.payments.description">
      <AdminTableSection type="payments" />
    </DashboardPage>
  );
}
