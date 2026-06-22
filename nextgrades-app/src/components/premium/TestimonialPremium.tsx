"use client";

import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { card } from "@/lib/premium/tokens";

export type TestimonialData = {
  quote: string;
  name: string;
  role?: string;
  school?: string;
  initials?: string;
};

type TestimonialPremiumProps = {
  items: TestimonialData[];
  title: string;
  dark?: boolean;
};

export function TestimonialPremium({ items, title, dark = false }: TestimonialPremiumProps) {
  return (
    <section className={cn(dark ? "bg-[var(--brand-navy)]" : "bg-surface-muted")}>
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:py-28 lg:px-8">
        <h2
          className={cn(
            "mb-14 text-center text-3xl font-bold tracking-tight sm:text-4xl",
            dark ? "text-white" : "text-foreground"
          )}
        >
          {title}
        </h2>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {items.map((item) => {
            const initials =
              item.initials ||
              item.name
                .split(/[\s,]+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0])
                .join("")
                .toUpperCase();
            return (
              <article
                key={item.name}
                className={cn(
                  "flex h-full flex-col p-8 sm:p-10",
                  dark ? card.baseDark : card.base
                )}
              >
                <Quote className="mb-6 h-8 w-8 text-[#D4AF37]/60" />
                <div className="mb-6 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <blockquote
                  className={cn(
                    "flex-1 text-base leading-relaxed sm:text-lg",
                    dark ? "text-gray-200" : "text-foreground-secondary"
                  )}
                >
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <footer className="mt-8 flex items-center gap-4 border-t border-border-default pt-6 dark:border-white/10">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5A623] text-sm font-bold text-[#0D1B2A]">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("font-semibold", dark ? "text-white" : "text-[#0D1B2A]")}>
                      {item.name}
                    </p>
                    {(item.school || item.role) && (
                      <p className={cn("text-sm", dark ? "text-on-navy-subtle" : "text-text-muted")}>
                        {[item.role, item.school].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
