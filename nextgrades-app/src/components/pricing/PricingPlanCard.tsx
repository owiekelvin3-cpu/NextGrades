"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
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
  typeLabel?: string;
  isLoading: boolean;
  onSelect: () => void;
  ctaLabel: string;
  popularLabel?: string;
};

/** Pricing card — matches Programs page image layout and typography. */
export function PricingPlanCard({
  plan,
  imageSrc,
  typeLabel,
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
          ? "border-2 border-[var(--brand-gold)] shadow-xl"
          : "border-[var(--border-default)] shadow-sm hover:shadow-md"
      )}
    >
      {plan.highlighted && popularLabel && (
        <div className="absolute right-3 top-3 z-10">
          <Badge className="bg-[#D4AF37] px-3 py-1 text-xs font-bold uppercase text-[#0D1B2A]">
            {popularLabel}
          </Badge>
        </div>
      )}

      {imageSrc && (
        <div className="relative h-44 overflow-hidden bg-[var(--surface-subtle)]">
          {typeLabel && (
            <Badge className="absolute left-3 top-3 z-10 bg-[#0D1B2A] px-3 py-1 text-xs text-white">
              {typeLabel}
            </Badge>
          )}
          <MarketingImage
            src={imageSrc}
            alt=""
            containerClassName="h-full w-full"
            sizes="(max-width: 768px) 100vw, 33vw"
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-[1.45rem] font-bold leading-tight text-[var(--foreground)]">{plan.name}</h3>
        <p className="mb-3 text-sm font-semibold text-[var(--brand-gold)]">
          {plan.priceLabel ?? `€${plan.monthlyPrice}`}
        </p>
        <p className="mb-5 text-[var(--text-muted)]">{plan.description}</p>

        <ul className="mb-7 flex-1 space-y-2.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-gold)]" />
              <span className="text-sm text-[var(--foreground-secondary)]">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={plan.highlighted ? "gold" : "dark"}
          size="md"
          className="mt-auto w-full rounded-lg"
          disabled={isLoading}
          onClick={onSelect}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : ctaLabel}
        </Button>
      </div>
    </article>
  );
}
