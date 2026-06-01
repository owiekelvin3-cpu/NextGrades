import { DashboardOverviewSkeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] items-start justify-center p-6">
      <div className="w-full max-w-6xl">
        <DashboardOverviewSkeleton />
      </div>
    </div>
  );
}
