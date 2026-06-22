"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export type AdminKpiTrend = {
  direction: "up" | "down" | "neutral";
  label?: string;
};

export type AdminKpiCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconTone?: "gold" | "info" | "success" | "warning" | "muted";
  trend?: AdminKpiTrend;
  className?: string;
};

const iconToneClass = {
  gold: "bg-[var(--brand-gold-muted)] text-[var(--brand-gold)]",
  info: "theme-alert-info",
  success: "theme-alert-success",
  warning: "theme-alert-warning",
  muted: "bg-surface-subtle text-text-muted",
} as const;

export function AdminKpiCard({
  label,
  value,
  icon: Icon,
  iconTone = "gold",
  trend,
  className,
}: AdminKpiCardProps) {
  const TrendIcon =
    trend?.direction === "up" ? ChevronUp : trend?.direction === "down" ? ChevronDown : null;

  return (
    <Card className={cn("p-5 sm:p-6", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            iconToneClass[iconTone]
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        {trend?.label ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.direction === "up" && "theme-alert-success",
              trend.direction === "down" && "theme-alert-error",
              trend.direction === "neutral" && "bg-surface-subtle text-text-muted"
            )}
          >
            {TrendIcon ? <TrendIcon className="h-3 w-3" aria-hidden /> : null}
            {trend.label}
          </span>
        ) : null}
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-text-muted">{label}</p>
    </Card>
  );
}

export function AdminKpiStrip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5",
        className
      )}
    >
      {children}
    </div>
  );
}
