"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";
import { appShell } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  showBack?: boolean;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  actions,
  showBack = true,
  className,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <span className={appShell.adminEyebrow}>{t("adminShell.portalBadge")}</span>
          <div className="mt-3 flex items-start gap-3">
            {showBack ? (
              <Link
                href={ADMIN_PORTAL_HOME}
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-default bg-surface-elevated text-foreground shadow-sm transition-colors hover:border-[var(--border-strong)] hover:bg-surface-subtle md:hidden"
                aria-label={t("adminHub.backToOverview")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            ) : null}
            <div className="min-w-0">
              <h1 className={appShell.adminPageTitle}>{title}</h1>
              {description ? <p className={appShell.adminPageDescription}>{description}</p> : null}
            </div>
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
