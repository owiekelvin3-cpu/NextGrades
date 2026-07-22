"use client";

import { Activity, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ListRowSkeleton } from "@/components/ui/Skeleton";
import type { ActivityLogRow } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

const typeIcon = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
} as const;

type Props = {
  activities: ActivityLogRow[];
  loading?: boolean;
  limit?: number;
  className?: string;
};

export function AdminActivityFeed({ activities, loading = false, limit = 10, className }: Props) {
  const { t } = useTranslation();
  const rows = activities.slice(0, limit);

  return (
    <Card hoverable={false} className={cn("p-5 sm:p-6", className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-gold-muted)]">
            <Activity className="h-4 w-4 text-[var(--brand-gold)]" aria-hidden />
          </span>
          <h2 className="text-lg font-bold text-foreground">{t("adminDashboard.recentActivity")}</h2>
        </div>
      </div>

      {loading ? (
        <ListRowSkeleton rows={5} />
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-default bg-surface-subtle px-4 py-10 text-center">
          <Activity className="mx-auto mb-3 h-8 w-8 text-text-muted" aria-hidden />
          <p className="font-medium text-foreground">{t("adminDashboard.noActivityTitle")}</p>
          <p className="mt-1 text-sm text-text-muted">{t("adminDashboard.noActivityDesc")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((activity) => {
            const Icon = typeIcon[activity.type] ?? Info;
            return (
              <li
                key={activity.id}
                className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-subtle px-3 py-3 transition-colors hover:bg-[var(--table-row-hover)]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-gold-muted)]">
                  <Icon className="h-4 w-4 text-[var(--brand-gold)]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{activity.title}</p>
                  <p className="text-xs text-text-muted">{activity.time}</p>
                </div>
                <Badge variant={activity.type === "success" ? "success" : activity.type === "warning" ? "warning" : "info"}>
                  {activity.type}
                </Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
