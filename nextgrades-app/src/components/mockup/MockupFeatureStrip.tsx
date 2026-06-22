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

/** Feature highlights — stacked cards on mobile, grid on desktop. */
export function MockupFeatureStrip({ items, className, columns = 5 }: Props) {
  const gridCols =
    columns === 3
      ? "md:grid-cols-3"
      : columns === 4
        ? "md:grid-cols-2 lg:grid-cols-4"
        : "md:grid-cols-3 lg:grid-cols-5";

  return (
    <section
      className={cn(
        "border-b border-border-default bg-surface-elevated py-14 md:py-12",
        className
      )}
    >
      <div className={section.container}>
        <div className={cn("grid grid-cols-1 gap-4", gridCols)}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-border-default bg-surface-subtle p-5 text-left md:border-transparent md:bg-transparent md:p-0"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-gold-muted)]">
                  <Icon className="h-5 w-5 text-[var(--brand-gold)]" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-bold text-foreground md:text-sm">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
