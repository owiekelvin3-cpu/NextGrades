"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { resolveAdminBreadcrumbs } from "@/lib/admin/admin-breadcrumbs";
import { appShell } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";

export function AdminTopBar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const crumbs = resolveAdminBreadcrumbs(pathname);

  return (
    <header className={appShell.adminTopBar}>
      <nav aria-label="Breadcrumb" className="hidden min-w-0 flex-1 items-center gap-1 text-sm lg:flex">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <span key={crumb.href} className="flex min-w-0 items-center gap-1">
              {index > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted/60" aria-hidden />
              ) : null}
              {isLast ? (
                <span className="truncate font-semibold text-[var(--brand-navy)] dark:text-foreground">{t(crumb.labelKey)}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="truncate text-text-muted transition-colors hover:text-foreground"
                >
                  {t(crumb.labelKey)}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
        <Link
          href="/portal/admin/users"
          className={cn(
            "hidden min-w-0 flex-1 items-center gap-2 rounded-lg border border-border-default bg-surface-muted px-3 py-2 text-sm text-text-muted transition-colors sm:flex sm:max-w-xs lg:max-w-sm",
            "hover:border-[var(--brand-gold)]/40 hover:bg-surface-elevated hover:text-foreground"
          )}
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{t("adminShell.searchUsers")}</span>
        </Link>

        <NotificationBell />
        <ThemeToggle size="sm" />
      </div>
    </header>
  );
}
