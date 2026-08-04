"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StudentPanelProps = {
  title: string;
  icon?: LucideIcon;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
};

/** Branded panel wrapper for student dashboard sections */
export function StudentPanel({
  title,
  icon: Icon,
  href,
  linkLabel,
  children,
  className,
  noPadding,
}: StudentPanelProps) {
  return (
    <div className={cn("student-panel overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border-default px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon ? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-gold-muted)] text-[var(--brand-gold)]">
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
          <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
        </div>
        {href && linkLabel ? (
          <Link
            href={href}
            className="shrink-0 text-xs font-semibold text-[var(--brand-gold)] transition hover:text-[var(--brand-gold-hover)]"
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
      <div className={cn(!noPadding && "p-1")}>{children}</div>
    </div>
  );
}
