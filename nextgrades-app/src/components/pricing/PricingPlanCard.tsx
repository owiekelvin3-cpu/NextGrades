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
        "group flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-shadow duration-300",
        plan.highlighted
          ? "border-[#0D1B2A]/10 shadow-[0_12px_40px_rgba(13,27,42,0.08)] ring-1 ring-[#D4AF37]/30"
          : "border-gray-200/90 shadow-sm hover:shadow-md"
      )}
    >
      {imageSrc && (
        <div className="relative h-36 overflow-hidden bg-[#0D1B2A]/5 sm:h-40">
          <MarketingImage
            src={imageSrc}
            alt=""
            containerClassName="h-full w-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6 md:p-7">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold tracking-tight text-[#0D1B2A] sm:text-xl">{plan.name}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{plan.description}</p>
          </div>
          {plan.highlighted && popularLabel && (
            <span className="w-fit shrink-0 rounded-md bg-[#0D1B2A] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              {popularLabel}
            </span>
          )}
        </div>

        <p className="break-words text-xl font-bold leading-tight tracking-tight text-[#0D1B2A] sm:text-2xl">
          {plan.priceLabel ?? `€${plan.monthlyPrice}`}
        </p>

        <ul className="mt-5 flex-1 space-y-2.5 border-t border-gray-100 pt-5 sm:mt-6 sm:space-y-3 sm:pt-6">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0D1B2A]/5">
                <Check className="h-3 w-3 text-[#0D1B2A]" strokeWidth={2.5} />
              </span>
              <span className="min-w-0 leading-snug">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={plan.highlighted ? "gold" : "outline"}
          size="lg"
          className={cn(
            "mt-6 min-h-[3rem] w-full rounded-xl text-sm font-semibold sm:mt-8 sm:min-h-[3.25rem] sm:text-base",
            !plan.highlighted &&
              "border-gray-300 bg-white text-[#0D1B2A] hover:border-[#0D1B2A] hover:bg-[#FAF8F5]"
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
