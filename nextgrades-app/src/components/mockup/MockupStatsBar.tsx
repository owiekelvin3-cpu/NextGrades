"use client";

import type { LucideIcon } from "lucide-react";
import { section } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

export type MockupStat = { number: string; label: string; icon: LucideIcon };

type Props = {
  stats: MockupStat[];
};

/** Stats bar — 2×2 card grid on mobile, 4-column on desktop. */
export function MockupStatsBar({ stats }: Props) {
  return (
    <section className="bg-[#0D1B2A] py-14 md:py-14">
      <div className={section.container}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-0 md:divide-x md:divide-white/10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  "flex flex-col items-center rounded-xl border border-white/10 bg-white/5 p-4 text-center",
                  "md:rounded-none md:border-0 md:bg-transparent md:px-4 md:py-2"
                )}
              >
                <Icon className="mb-2 h-6 w-6 text-[#D4AF37] md:mb-3 md:h-7 md:w-7" strokeWidth={1.75} />
                <p className="text-2xl font-bold tracking-tight text-white md:text-4xl">{stat.number}</p>
                <p className="mt-1 text-xs text-gray-400 md:text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
