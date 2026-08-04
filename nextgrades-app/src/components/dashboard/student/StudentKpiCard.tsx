"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StudentKpiCardProps = {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  href?: string;
  footer?: React.ReactNode;
  accent?: "gold" | "navy" | "emerald" | "violet";
  className?: string;
};

const accentClass = {
  gold: "bg-[var(--brand-gold-muted)] text-[var(--brand-gold)]",
  navy: "bg-[var(--brand-navy)]/10 text-[var(--brand-navy)] dark:bg-white/10 dark:text-white",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-300",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/12 dark:text-violet-300",
} as const;

export function StudentKpiCard({
  label,
  value,
  icon: Icon,
  href,
  footer,
  accent = "gold",
  className,
}: StudentKpiCardProps) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">{label}</p>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-border-default",
            accentClass[accent]
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">{value}</p>
      {footer ? <div className="mt-auto border-t border-border-default pt-3">{footer}</div> : null}
    </>
  );

  const cardCls = cn(
    "student-panel student-panel-accent flex h-full min-h-[168px] flex-col p-5 transition hover:border-[var(--border-strong)] hover:shadow-md",
    href && "touch-manipulation active:scale-[0.99]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cardCls}>
        {inner}
      </Link>
    );
  }

  return <div className={cardCls}>{inner}</div>;
}

export function StudentKpiStrip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>
  );
}
