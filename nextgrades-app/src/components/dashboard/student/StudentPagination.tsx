"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  summaryLabel?: string;
  className?: string;
};

export function StudentPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  summaryLabel,
  className,
}: Props) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border-default px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5",
        className
      )}
    >
      <p className="text-center text-xs text-text-muted sm:text-left">
        {summaryLabel ?? `${start}–${end} of ${totalItems}`}
      </p>
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl text-text-muted transition disabled:opacity-40",
            "hover:bg-surface-subtle active:scale-95"
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              "flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-medium transition active:scale-95",
              page === p
                ? "bg-[var(--brand-gold)] text-[var(--brand-navy)]"
                : "text-text-muted hover:bg-surface-subtle"
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl text-text-muted transition disabled:opacity-40",
            "hover:bg-surface-subtle active:scale-95"
          )}
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
