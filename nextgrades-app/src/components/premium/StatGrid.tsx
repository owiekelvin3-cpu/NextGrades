"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { card } from "@/lib/premium/tokens";

export type StatItem = { number: string; label: string; icon: LucideIcon };

type StatGridProps = {
  stats: StatItem[];
  variant?: "light" | "dark" | "elevated";
};

export function StatGrid({ stats, variant = "elevated" }: StatGridProps) {
  const isDark = variant === "dark";

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={cn(
              "flex flex-col items-center rounded-3xl px-5 py-8 text-center md:px-6 md:py-10",
              variant === "elevated" && card.base,
              isDark && card.baseDark,
              variant === "light" && "border border-gray-100 bg-[#FAFAFA]"
            )}
          >
            <div
              className={cn(
                "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl",
                isDark ? "bg-[#D4AF37]/15" : "bg-[#D4AF37]/10"
              )}
            >
              <Icon className="h-7 w-7 text-[#D4AF37]" strokeWidth={1.75} />
            </div>
            <p
              className={cn(
                "text-3xl font-bold tracking-tight md:text-4xl",
                isDark ? "text-white" : "text-[#0D1B2A]"
              )}
            >
              {stat.number}
            </p>
            <p
              className={cn(
                "mt-2 text-sm font-medium leading-snug",
                isDark ? "text-on-navy-subtle" : "text-gray-600"
              )}
            >
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
