"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AdminGuestSignupsPanel } from "@/components/admin/AdminGuestSignupsPanel";
import { AdminTableSection } from "@/components/dashboard/sections/DashboardSections";

export default function AdminPaymentsPage() {
  return (
    <DashboardPage role="admin" titleKey="dashboardPages.admin.payments.title" descriptionKey="dashboardPages.admin.payments.description">
      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Paid signups</h2>
          <AdminGuestSignupsPanel />
        </section>
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Enrollments</h2>
          <AdminTableSection type="payments" />
        </section>
      </div>
    </DashboardPage>
  );
}
