"use client";

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { cn } from "@/lib/utils";

export type PricingPlanCardPlan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  priceLabel?: string;
  highlighted: boolean;
  features: string[];
};

type Props = {
  plan: PricingPlanCardPlan;
  imageSrc?: string;
  isLoading: boolean;
  onSelect: () => void;
  ctaLabel: string;
  popularLabel?: string;
};

export function PricingPlanCard({
  plan,
  imageSrc,
  isLoading,
  onSelect,
  ctaLabel,
  popularLabel,
}: Props) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[var(--card-background)] transition-shadow duration-300",
        plan.highlighted
          ? "border-[var(--brand-gold)]/40 shadow-[var(--card-shadow)] ring-1 ring-[var(--brand-gold)]/25"
          : "border-[var(--border-default)] shadow-sm hover:shadow-md"
      )}
    >
      {plan.highlighted && popularLabel && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-[var(--brand-gold)] px-3 py-1 text-xs font-bold text-[var(--brand-navy)]">
          {popularLabel}
        </span>
      )}
      {imageSrc && (
        <div className="relative h-36 overflow-hidden bg-[var(--surface-subtle)] sm:h-40">
          <MarketingImage
            src={imageSrc}
            alt=""
            containerClassName="h-full w-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--card-background)] via-transparent to-transparent" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 md:p-7">
        <div className="mb-4 pr-16">
          <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)] md:text-xl md:font-bold">
            {plan.name}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{plan.description}</p>
        </div>

        <p className="break-words text-2xl font-bold leading-tight tracking-tight text-[var(--foreground)] md:text-2xl">
          {plan.priceLabel ?? `€${plan.monthlyPrice}`}
        </p>

        <ul className="mt-5 flex-1 space-y-2.5 border-t border-[var(--border-default)] pt-5 sm:mt-6 sm:space-y-3 sm:pt-6">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-[var(--foreground-secondary)]">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-subtle)]">
                <Check className="h-3 w-3 text-[var(--foreground)]" strokeWidth={2.5} />
              </span>
              <span className="min-w-0 leading-snug">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={plan.highlighted ? "gold" : "outline"}
          size="lg"
          className={cn(
            "mt-6 min-h-11 w-full rounded-xl py-4 text-base font-semibold md:mt-8 md:min-h-[3.25rem] md:py-3 md:text-sm"
          )}
          disabled={isLoading}
          onClick={onSelect}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : ctaLabel}
        </Button>
      </div>
    </article>
  );
}
