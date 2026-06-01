"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { RESOURCE_TABS, type ResourceTabId } from "@/lib/resources/ui-config";

type Props = {
  active: ResourceTabId;
  onChange: (tab: ResourceTabId) => void;
  className?: string;
};

const TAB_LABELS = [
  "All resources",
  "Learning materials",
  "Worksheets",
  "Explainer videos",
  "Guides & e-books",
  "Exam preparation",
  "Mini courses",
  "Formula collections",
];

export function ResourcesCategoryTabs({ active, onChange, className }: Props) {
  const { t } = useTranslation();

  return (
    <div className={cn("border-b border-border-default bg-surface-elevated", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile — pill carousel */}
        <div className="snap-carousel py-3 md:hidden">
          {RESOURCE_TABS.map((tab, index) => {
            const label = t(tab.labelKey, { defaultValue: TAB_LABELS[index] });
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={cn(
                  "min-h-10 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-[#0D1B2A] text-white shadow-md dark:bg-[#D4AF37] dark:text-[#0D1B2A]"
                    : "border border-border-default bg-surface-subtle text-text-muted"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Desktop — underline tabs */}
        <div className="scrollbar-hide hidden gap-1 overflow-x-auto py-1 md:flex">
          {RESOURCE_TABS.map((tab, index) => {
            const label = t(tab.labelKey, { defaultValue: TAB_LABELS[index] });
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={cn(
                  "shrink-0 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-text-muted hover:text-foreground"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
