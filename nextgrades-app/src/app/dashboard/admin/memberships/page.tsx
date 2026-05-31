"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AdminTableSection } from "@/components/dashboard/sections/DashboardSections";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminMembershipsPage() {
  return (
    <DashboardPage role="admin" titleKey="dashboardPages.admin.memberships.title" descriptionKey="dashboardPages.admin.memberships.description">
      <AdminTableSection type="payments" />
      <div className="mt-6">
        <Link href="/pricing">
          <Button variant="outline">View public pricing page</Button>
        </Link>
      </div>
    </DashboardPage>
  );
}
