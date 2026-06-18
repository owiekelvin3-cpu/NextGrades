"use client";

import type { LucideIcon } from "lucide-react";
import { section } from "@/lib/premium/tokens";

export type MockupStat = { number: string; label: string; icon: LucideIcon };

type Props = {
  stats: MockupStat[];
};

/** Full-width dark stats bar — homepage mockup. */
export function MockupStatsBar({ stats }: Props) {
  return (
    <section className="bg-[#0D1B2A] py-12 md:py-14">
      <div className={section.container}>
        <div className="grid grid-cols-2 divide-y divide-white/10 md:grid-cols-4 md:divide-x md:divide-y-0">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center px-4 py-6 text-center md:py-2"
              >
                <Icon className="mb-3 h-7 w-7 text-[#D4AF37]" strokeWidth={1.75} />
                <p className="text-3xl font-bold tracking-tight text-white md:text-4xl">{stat.number}</p>
                <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
