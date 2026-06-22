"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { section } from "@/lib/premium/tokens";

export type FeatureStripItem = {
  title: string;
  desc: string;
  icon: LucideIcon;
};

type Props = {
  items: FeatureStripItem[];
  className?: string;
  columns?: 3 | 4 | 5;
};

/** Horizontal icon row — matches homepage mockup strip below hero. */
export function MockupFeatureStrip({ items, className, columns = 5 }: Props) {
  const gridCols =
    columns === 3
      ? "sm:grid-cols-3"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5";

  return (
    <section
      className={cn(
        "border-b border-border-default bg-surface-elevated py-10 md:py-12",
        className
      )}
    >
      <div className={section.container}>
        <div className={cn("grid gap-8", gridCols)}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="text-center md:text-left">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-gold-muted)] md:mx-0">
                  <Icon className="h-6 w-6 text-[var(--brand-gold)]" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-text-muted sm:text-sm">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
