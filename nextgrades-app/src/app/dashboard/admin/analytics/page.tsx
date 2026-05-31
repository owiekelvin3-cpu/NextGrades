"use client";

import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { AdminAnalyticsSection } from "@/components/dashboard/sections/DashboardSections";

export default function AdminAnalyticsPage() {
  return (
    <DashboardPage role="admin" titleKey="dashboardPages.admin.analytics.title" descriptionKey="dashboardPages.admin.analytics.description">
      <AdminAnalyticsSection />
    </DashboardPage>
  );
}
