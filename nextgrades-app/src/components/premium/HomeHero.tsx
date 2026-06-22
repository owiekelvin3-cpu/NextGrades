"use client";

import { Shield, MapPin } from "lucide-react";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { MarketingCtaButtons } from "@/components/premium/MarketingCtaButtons";
import { type, hero } from "@/lib/premium/tokens";
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
        priority
      />

      <div className={hero.inner}>
        <div className="max-w-xl">
          <p className={`${type.eyebrow} mb-5`}>{eyebrow}</p>
          <h1 className={type.h1}>
            {title}{" "}
            <span className="text-[#D4AF37]">{titleHighlight}</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-on-navy-muted sm:text-xl">{subtitle}</p>

          <MarketingCtaButtons
            className="mt-10"
            primaryLabel={primaryCta}
            secondaryLabel={secondaryCta}
          />

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-on-navy-subtle">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#D4AF37]" />
              Österreich
            </span>
            <span className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#D4AF37]" />
              DSGVO-konform
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
