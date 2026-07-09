"use client";

import { MapPin } from "lucide-react";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { MarketingHeroMobileImage } from "@/components/marketing/MarketingHeroMobileImage";
import { MarketingCtaButtons } from "@/components/premium/MarketingCtaButtons";
import { SHARED_PAGE_HERO_IMAGE } from "@/lib/marketing-images";
import { hero, type } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

type HomeHeroProps = {
  eyebrow: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  heroImage: string;
};

/** Full-bleed hero — matches uploaded homepage mockup. */
export function HomeHero({
  eyebrow,
  title,
  titleHighlight,
  subtitle,
  primaryCta,
  secondaryCta,
  heroImage,
}: HomeHeroProps) {
  return (
    <section className={cn("relative overflow-hidden bg-[#0D1B2A] text-white", hero.section)}>
      <MarketingHeroBlend
        src={heroImage}
        alt=""
        variant="dark-split-right"
        backgroundColor="#0D1B2A"
        fallbackSrc={SHARED_PAGE_HERO_IMAGE}
        priority
      />

      <div className={hero.inner}>
        <div className="grid min-h-0 min-w-0 flex-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="max-w-xl">
            <p className={`${type.eyebrow} mb-4 sm:mb-5`} data-animate="hero-headline">
              {eyebrow}
            </p>
            <h1 className={type.h1} data-animate="hero-headline" data-animate-delay="0.1">
              {title}{" "}
              <span className="text-[#D4AF37]">{titleHighlight}</span>
            </h1>
            <p
              className="mt-5 max-w-lg text-base leading-relaxed text-on-navy-muted sm:mt-6 sm:text-lg md:text-xl"
              data-animate="hero-subheadline"
            >
              {subtitle}
            </p>

            <div data-animate="hero-cta">
              <MarketingCtaButtons
                className="mt-8 sm:mt-10"
                primaryLabel={primaryCta}
                secondaryLabel={secondaryCta}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-2 sm:mt-10 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-on-navy-subtle">
                <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                Österreich
              </span>
            </div>
          </div>
          <div data-animate="hero-image" className="max-w-xl lg:max-w-none">
            <MarketingHeroMobileImage src={heroImage} fallbackSrc={SHARED_PAGE_HERO_IMAGE} priority className="max-w-xl lg:max-w-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
