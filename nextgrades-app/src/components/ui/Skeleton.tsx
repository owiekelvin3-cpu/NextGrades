import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton rounded-xl", className)} aria-hidden />;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-card-border bg-card-background p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-8 w-20" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function DashboardStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-4 rounded-xl bg-surface-subtle p-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5 max-w-[200px]" />
            <Skeleton className="h-3 w-1/3 max-w-[120px]" />
          </div>
          <Skeleton className="h-6 w-14 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

export function DashboardHubSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}

/** Student / teacher overview dashboard placeholder */
export function DashboardOverviewSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6" aria-busy aria-label="Loading dashboard">
      <Skeleton className="h-44 rounded-2xl sm:h-48" />
      <DashboardStatsSkeleton count={4} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl lg:col-span-1" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <ListRowSkeleton rows={4} />
    </div>
  );
}

export function PageLoadingSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16" role="status" aria-live="polite">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#D4AF37]" />
      </div>
      <p className="text-sm font-medium text-text-muted">{label}</p>
    </div>
  );
}
