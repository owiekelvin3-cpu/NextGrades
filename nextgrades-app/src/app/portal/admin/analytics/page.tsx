"use client";

import dynamic from "next/dynamic";
import { DashboardStatsSkeleton } from "@/components/ui/Skeleton";

const AdminAnalyticsExperience = dynamic(
  () =>
    import("@/components/admin/AdminAnalyticsExperience").then((m) => ({
      default: m.AdminAnalyticsExperience,
    })),
  {
    loading: () => (
      <div className="mx-auto max-w-7xl p-4">
        <DashboardStatsSkeleton count={4} />
      </div>
    ),
    ssr: false,
  }
);

export default function AdminAnalyticsPage() {
  return <AdminAnalyticsExperience />;
}
