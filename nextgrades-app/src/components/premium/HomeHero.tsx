"use client";

import Link from "next/link";
import { ArrowRight, Shield, MapPin } from "lucide-react";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { Button } from "@/components/ui/Button";
import { type } from "@/lib/premium/tokens";
import { section } from "@/lib/premium/tokens";

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
    <section className="relative min-h-[520px] overflow-hidden bg-[#0D1B2A] text-white md:min-h-[600px] lg:min-h-[680px]">
      <MarketingHeroBlend
        src={heroImage}
        alt=""
        variant="dark-split-right"
        backgroundColor="#0D1B2A"
        priority
      />

      <div className={`${section.container} relative z-10 flex min-h-[520px] flex-col justify-center pb-16 pt-site-nav md:min-h-[600px] md:pb-20 md:pt-28 lg:min-h-[680px]`}>
        <div className="max-w-xl">
          <p className={`${type.eyebrow} mb-5`}>{eyebrow}</p>
          <h1 className={type.h1}>
            {title}{" "}
            <span className="text-[#D4AF37]">{titleHighlight}</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-300 sm:text-xl">{subtitle}</p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button variant="gold" size="lg" href="/consultation" className="min-h-[52px] w-full px-8 sm:w-auto">
              {primaryCta}
            </Button>
            <Link
              href="/programs"
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10 sm:w-auto"
            >
              {secondaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-400">
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
