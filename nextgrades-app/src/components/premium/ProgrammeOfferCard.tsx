"use client";

import { ArrowRight, Check } from "lucide-react";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { card } from "@/lib/premium/tokens";

type ProgrammeOfferCardProps = {
  title: string;
  features: string[];
  image: string;
  fallbackImage: string;
  href?: string;
  price?: string;
  badge?: string;
  featured?: boolean;
  ctaLabel: string;
  loading?: boolean;
  onSelect?: () => void;
};

export function ProgrammeOfferCard({
  title,
  features,
  image,
  fallbackImage,
  href,
  price,
  badge,
  featured = false,
  ctaLabel,
  loading = false,
  onSelect,
}: ProgrammeOfferCardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden",
        featured ? card.featured : card.base
      )}
    >
      {badge && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-bold text-[#0D1B2A]">
          {badge}
        </span>
      )}
      <div className="relative h-44 overflow-hidden md:aspect-[16/10] md:h-auto">
        <MarketingImage
          src={image}
          fallbackSrc={fallbackImage}
          alt={title}
          containerClassName="h-full w-full"
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/60 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-8">
        <h3 className="text-lg font-semibold tracking-tight text-foreground md:text-xl md:font-bold lg:text-2xl">
          {title}
        </h3>
        {price && <p className="mt-2 text-2xl font-bold text-[#D4AF37] md:text-sm md:font-semibold">{price}</p>}
        <ul className="mt-4 flex-1 space-y-2.5 md:mt-6 md:space-y-3">
          {features.slice(0, 5).map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-foreground-secondary">
              <Check className="h-4 w-4 shrink-0 text-[#D4AF37]" strokeWidth={2.5} />
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          variant={featured ? "gold" : "dark"}
          size="md"
          href={onSelect ? undefined : href}
          disabled={loading}
          onClick={onSelect}
          className="mt-6 w-full rounded-xl py-4 text-base font-semibold md:mt-8 md:py-3 md:text-sm"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </article>
  );
}
