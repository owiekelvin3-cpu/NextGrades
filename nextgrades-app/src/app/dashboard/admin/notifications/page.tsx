"use client";

import { AdminNotificationCenter } from "@/components/notifications/AdminNotificationCenter";
import { DashboardPage } from "@/components/dashboard/DashboardPage";

export default function AdminNotificationsPage() {
  return (
    <DashboardPage role="admin" titleKey="notifications.admin.title">
      <AdminNotificationCenter />
    </DashboardPage>
  );
}
