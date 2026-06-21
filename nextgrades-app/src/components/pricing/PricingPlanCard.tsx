"use client";

import { Check, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
  isLoading: boolean;
  onSelect: () => void;
  ctaLabel: string;
  popularLabel?: string;
};

export function PricingPlanCard({ plan, isLoading, onSelect, ctaLabel, popularLabel }: Props) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-white p-6 sm:p-7",
        plan.highlighted
          ? "border-[#D4AF37] shadow-[0_8px_32px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]/25"
          : "border-gray-200/90 shadow-sm"
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-[#0D1B2A] sm:text-xl">{plan.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
        </div>
        {plan.highlighted && popularLabel && (
          <span className="shrink-0 rounded-full bg-[#D4AF37]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#9A7B1A]">
            {popularLabel}
          </span>
        )}
      </div>

      <p className="text-2xl font-extrabold tracking-tight text-[#0D1B2A] sm:text-[1.75rem]">
        {plan.priceLabel ?? `€${plan.monthlyPrice}`}
      </p>

      <ul className="mt-6 flex-1 space-y-2.5 border-t border-gray-100 pt-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" strokeWidth={2.5} />
            <span className="leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={plan.highlighted ? "gold" : "outline"}
        size="lg"
        className={cn(
          "mt-8 w-full rounded-xl",
          !plan.highlighted && "border-[#0D1B2A]/15 text-[#0D1B2A] hover:border-[#D4AF37]/40 hover:bg-[#FAF8F5]"
        )}
        disabled={isLoading}
        onClick={onSelect}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </article>
  );
}
