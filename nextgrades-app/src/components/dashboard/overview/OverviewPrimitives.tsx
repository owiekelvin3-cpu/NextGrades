"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type HeroAction = {
  href: string;
  label: string;
  icon?: LucideIcon;
  external?: boolean;
};

type OverviewHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: HeroAction[];
  aside?: React.ReactNode;
  className?: string;
};

export function OverviewHero({ eyebrow, title, subtitle, actions, aside, className }: OverviewHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border-default bg-surface-elevated p-5 shadow-[var(--card-shadow)] sm:p-6 lg:p-8",
        className
      )}
    >
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">{eyebrow}</p>
          )}
          <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted sm:text-base">{subtitle}</p>}
          {actions && actions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {actions.map((action) => {
                const Icon = action.icon;
                const inner = (
                  <>
                    {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                    {action.label}
                  </>
                );
                const cls =
                  "inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border-default bg-surface-subtle px-3.5 py-2.5 text-xs font-semibold text-foreground transition hover:border-[var(--brand-gold)]/35 hover:bg-surface-muted touch-manipulation sm:text-sm";
                return action.external ? (
                  <a key={action.label} href={action.href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                ) : (
                  <Link key={action.label} href={action.href} className={cls}>
                    {inner}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        {aside && <div className="w-full shrink-0 lg:max-w-xs">{aside}</div>}
      </div>
    </section>
  );
}

type OverviewStatCardProps = {
  label: string;
  value: string | number;
  href?: string;
  icon: LucideIcon;
  iconClassName?: string;
  footer?: React.ReactNode;
  className?: string;
};

export function OverviewStatCard({
  label,
  value,
  href,
  icon: Icon,
  iconClassName = "text-[#D4AF37] bg-[#D4AF37]/12 dark:bg-[#D4AF37]/15",
  footer,
  className,
}: OverviewStatCardProps) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</p>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-black/5 dark:ring-white/10",
            iconClassName
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      {footer && <div className="mt-auto border-t border-border-default pt-3">{footer}</div>}
    </>
  );

  const cardCls = cn(
    "flex h-full min-h-[160px] flex-col rounded-2xl border border-border-default bg-surface-elevated p-5 shadow-[var(--card-shadow)] transition hover:border-[var(--border-strong)] hover:shadow-md",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cn(cardCls, "touch-manipulation active:scale-[0.99]")}>
        {inner}
      </Link>
    );
  }

  return <div className={cardCls}>{inner}</div>;
}

type OverviewPanelProps = {
  title: string;
  icon?: LucideIcon;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
};

export function OverviewPanel({
  title,
  icon: Icon,
  href,
  linkLabel,
  children,
  className,
  noPadding,
}: OverviewPanelProps) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border-default bg-surface-elevated shadow-sm", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border-default px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-text-muted dark:bg-white/[0.06]">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
        </div>
        {href && linkLabel && (
          <Link
            href={href}
            className="shrink-0 text-xs font-medium text-text-muted transition hover:text-[#D4AF37]"
          >
            {linkLabel}
          </Link>
        )}
      </div>
      <div className={cn(!noPadding && "p-1")}>{children}</div>
    </div>
  );
}

export function OverviewGoalCard({
  label,
  value,
  actionHref,
  actionLabel,
}: {
  label: string;
  value: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border-default bg-surface-subtle p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-gold)]">{label}</p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{value}</p>
      <Link
        href={actionHref}
        className="mt-4 inline-flex items-center justify-center rounded-xl border border-[var(--brand-gold)]/35 bg-[var(--brand-gold-muted)] px-4 py-2 text-sm font-semibold text-[var(--brand-gold)] transition hover:bg-[var(--brand-gold-muted)]"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

export function OverviewEmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-subtle ring-1 ring-border-default dark:bg-white/[0.05]">
        <Icon className="h-7 w-7 text-text-muted/50" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-text-muted">{description}</p>}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] transition hover:bg-[#c9a030]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
