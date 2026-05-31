"use client";

import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-surface-subtle dark:bg-white/5",
        className
      )}
      aria-hidden
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-default bg-surface-elevated p-4">
      <Skeleton className="mb-3 h-4 w-20" />
      <Skeleton className="mb-2 h-8 w-16" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

export function ResourceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-default bg-surface-elevated">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="flex gap-3 overflow-hidden">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
