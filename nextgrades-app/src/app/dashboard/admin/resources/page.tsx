"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function AdminResourcesPage() {
  return (
    <DashboardPage role="admin" titleKey="dashboardPages.admin.resources.title" descriptionKey="dashboardPages.admin.resources.description">
      <Card className="p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-600 dark:text-gray-400">Manage learning resources shown on the public resources page.</p>
        <Link href="/resources">
          <Button variant="gold">Open resources page</Button>
        </Link>
      </Card>
    </DashboardPage>
  );
}
