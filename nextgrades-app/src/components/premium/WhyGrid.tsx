"use client";

import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { cn } from "@/lib/utils";
import { card, section } from "@/lib/premium/tokens";

type WhyItem = { title: string; desc: string; icon: LucideIcon };

type WhyGridProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  items: WhyItem[];
};

export function WhyGrid({ eyebrow, title, subtitle, items }: WhyGridProps) {
  return (
    <section className={cn(section.py, "bg-surface-muted")}>
      <div className={section.container}>
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={cn("p-8 sm:p-10", card.base)}>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-navy)]">
                  <Icon className="h-7 w-7 text-[var(--brand-gold)]" strokeWidth={1.75} />
                </div>
                <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted sm:text-base">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
