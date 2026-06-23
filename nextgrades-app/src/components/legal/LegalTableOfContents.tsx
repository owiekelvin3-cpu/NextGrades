"use client";

import { cn } from "@/lib/utils";

type Props = {
  items: { id: string; label: string }[];
  activeId: string | null;
  title: string;
  className?: string;
};

export function LegalTableOfContents({ items, activeId, title, className }: Props) {
  return (
    <nav aria-label={title} className={className}>
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
        {title}
      </p>
      <ol className="space-y-1 border-l border-border-default pl-4">
        {items.map((item, index) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "group flex gap-2 py-1.5 text-sm leading-snug transition-colors",
                  isActive
                    ? "font-semibold text-[var(--brand-gold)]"
                    : "text-text-muted hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 shrink-0 text-[10px] font-bold tabular-nums",
                    isActive ? "text-[var(--brand-gold)]" : "text-text-muted/70"
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
