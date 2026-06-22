"use client";

import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="site-container py-14 md:py-28">
        <h2
          className={cn(
            "mb-10 text-center text-2xl font-bold tracking-tight md:mb-14 md:text-4xl",
            dark ? "text-white" : "text-foreground"
          )}
        >
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-8">
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
                  "flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-5 md:rounded-3xl md:border-border-default md:bg-surface-elevated md:p-10",
                  dark && "md:border-white/10 md:bg-[#112240]/50"
                )}
              >
                <Quote className="mb-4 hidden h-8 w-8 text-[#D4AF37]/60 md:block" />
                <div className="mb-4 flex items-center gap-3 md:hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5A623] text-xs font-bold text-[#0D1B2A]">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-semibold", dark ? "text-white" : "text-foreground")}>
                      {item.name}
                    </p>
                    {(item.school || item.role) && (
                      <p className={cn("text-xs", dark ? "text-on-navy-subtle" : "text-text-muted")}>
                        {[item.role, item.school].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mb-4 hidden gap-0.5 md:flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <blockquote
                  className={cn(
                    "flex-1 text-sm italic leading-relaxed md:text-lg md:not-italic",
                    dark ? "text-gray-200" : "text-foreground-secondary"
                  )}
                >
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <footer className="mt-6 hidden items-center gap-4 border-t border-border-default pt-6 dark:border-white/10 md:flex">
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
