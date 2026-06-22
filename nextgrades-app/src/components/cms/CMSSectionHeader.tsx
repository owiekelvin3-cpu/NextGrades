"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ADMIN_CMS_PREFIX, ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  trail?: string[];
  className?: string;
};

export function CMSSectionHeader({ title, description, action, trail, className }: Props) {
  const crumbs = trail ?? ["Admin", "CMS"];

  return (
    <div className={cn("mb-6 border-b border-border-default pb-4", className)}>
      <nav className="mb-2 flex flex-wrap items-center gap-1 text-xs text-text-muted" aria-label="Breadcrumb">
        <Link href={ADMIN_PORTAL_HOME} className="hover:text-[var(--brand-gold)]">
          {crumbs[0]}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden />
        <Link href={ADMIN_CMS_PREFIX} className="hover:text-[var(--brand-gold)]">
          CMS
        </Link>
        {crumbs.slice(2).map((segment) => (
          <span key={segment} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="text-foreground">{segment}</span>
          </span>
        ))}
        {crumbs.length <= 2 && (
          <>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="text-foreground">{title}</span>
          </>
        )}
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-text-muted">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
