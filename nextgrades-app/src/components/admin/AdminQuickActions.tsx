"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { ADMIN_QUICK_ACTIONS } from "@/lib/admin/admin-nav";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Subset of hrefs to show; defaults to primary shortcuts */
  hrefs?: string[];
};

const PRIMARY_HREFS = [
  "/portal/admin/users",
  "/portal/admin/cms",
  "/portal/admin/moderation",
  "/portal/admin/analytics",
  "/portal/admin/notifications",
  "/portal/admin/security",
];

export function AdminQuickActions({ className, hrefs = PRIMARY_HREFS }: Props) {
  const { t } = useTranslation();

  const items = ADMIN_QUICK_ACTIONS.filter((item) => hrefs.includes(item.href));

  return (
    <Card hoverable={false} className={cn("admin-panel p-5 sm:p-6", className)}>
      <h2 className="mb-1 text-lg font-bold text-foreground">{t("adminDashboard.quickActions")}</h2>
      <p className="mb-4 text-sm text-text-muted">{t("adminShell.quickActionsHint")}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group inline-flex min-h-11 items-center gap-2.5 rounded-xl border border-border-default bg-surface-elevated px-3.5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-[var(--brand-gold)]/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-gold-ring)]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-gold-muted)] transition-colors group-hover:bg-[var(--brand-gold)]/20">
                <Icon className="h-4 w-4 text-[var(--brand-gold)]" aria-hidden />
              </span>
              <span className="whitespace-nowrap">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
