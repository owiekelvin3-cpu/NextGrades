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
};

export function ProgrammeOfferCard({
  title,
  features,
  image,
  fallbackImage,
  href = "/programs",
  price,
  badge,
  featured = false,
  ctaLabel,
}: ProgrammeOfferCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden",
        featured ? card.featured : card.base
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-[#D4AF37] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0D1B2A]">
            {badge}
          </span>
        )}
        <MarketingImage
          src={image}
          fallbackSrc={fallbackImage}
          alt={title}
          containerClassName="h-full w-full"
          sizes="(max-width: 768px) 100vw, 25vw"
          className="transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/60 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h3 className="text-xl font-bold tracking-tight text-[#0D1B2A] sm:text-2xl">{title}</h3>
        {price && (
          <p className="mt-2 text-sm font-semibold text-[#D4AF37]">{price}</p>
        )}
        <ul className="mt-6 flex-1 space-y-3">
          {features.slice(0, 5).map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                <Check className="h-3 w-3 text-[#D4AF37]" strokeWidth={3} />
              </span>
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          variant={featured ? "gold" : "dark"}
          size="md"
          href={href}
          className="mt-8 w-full group-hover:translate-x-0"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </article>
  );
}
