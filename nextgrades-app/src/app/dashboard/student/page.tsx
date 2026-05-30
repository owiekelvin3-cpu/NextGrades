import { Suspense } from "react";
import { StudentOverviewDashboard } from "@/components/dashboard/student/StudentOverviewDashboard";

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={null}>
      <StudentOverviewDashboard />
    </Suspense>
  );
}
