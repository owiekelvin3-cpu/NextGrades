"use client";

import { mobile } from "@/lib/mobile/tokens";
import { cn } from "@/lib/utils";

export type StudentTab = {
  id: string;
  label: string;
  /** Shorter label for mobile chip row */
  shortLabel?: string;
};

type Props = {
  tabs: StudentTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
};

export function StudentTabBar({ tabs, active, onChange, className }: Props) {
  return (
    <>
      <div className={cn(mobile.chipRow, "md:hidden", className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              mobile.chip,
              active === tab.id
                ? "bg-[var(--brand-gold)] font-semibold text-[var(--brand-navy)]"
                : "border border-border-default bg-surface-elevated text-text-muted"
            )}
          >
            {tab.shortLabel ?? tab.label}
          </button>
        ))}
      </div>

      <div className="hidden flex-wrap gap-4 border-b border-border-default md:flex md:gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "border-b-2 pb-3 text-sm font-medium transition",
              active === tab.id
                ? "border-[var(--brand-gold)] font-semibold text-foreground"
                : "border-transparent text-text-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
}
