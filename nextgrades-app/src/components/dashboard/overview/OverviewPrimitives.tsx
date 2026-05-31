"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
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
        "relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#0D1B2A] via-[#152a45] to-[#1a3354] p-5 text-white shadow-lg sm:p-6 lg:p-8",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-[#4DA3FF]/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">{eyebrow}</p>
          )}
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-300 sm:text-base">{subtitle}</p>}
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
                  "inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold transition hover:border-[#D4AF37]/40 hover:bg-white/15 sm:text-sm";
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
  iconClassName = "text-[#D4AF37] bg-[#D4AF37]/10",
  footer,
  className,
}: OverviewStatCardProps) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-black/5", iconClassName)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[#0D1B2A]">{value}</p>
      {footer && <div className="mt-auto border-t border-gray-100 pt-3">{footer}</div>}
    </>
  );

  const cardCls = cn(
    "flex h-full min-h-[160px] flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:border-[#D4AF37]/25 hover:shadow-md",
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

export function OverviewPanel({ title, icon: Icon, href, linkLabel, children, className, noPadding }: OverviewPanelProps) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white px-5 py-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <h2 className="text-sm font-semibold text-[#0D1B2A]">{title}</h2>
        </div>
        {href && linkLabel && (
          <Link href={href} className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#D4AF37] hover:underline">
            {linkLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className={cn(!noPadding && "p-1")}>{children}</div>
    </div>
  );
}

export function OverviewGoalCard({ label, value, actionHref, actionLabel }: { label: string; value: string; actionHref: string; actionLabel: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 ring-1 ring-inset ring-white/10 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#D4AF37]">{label}</p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-white">{value}</p>
      <Link
        href={actionHref}
        className="mt-4 inline-flex items-center justify-center rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2 text-sm font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/20"
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
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-white ring-1 ring-gray-100">
        <Icon className="h-7 w-7 text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-[#0D1B2A]">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-gray-500">{description}</p>}
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
