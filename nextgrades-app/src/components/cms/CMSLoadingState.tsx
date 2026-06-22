"use client";

import { Skeleton } from "@/components/ui/Skeleton";

type Props = { rows?: number; variant?: "table" | "cards" };

export function CMSLoadingState({ rows = 5, variant = "table" }: Props) {
  if (variant === "cards") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-border-default bg-surface-elevated p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  );
}
