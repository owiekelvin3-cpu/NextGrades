"use client";

import { Calendar } from "lucide-react";
import { MarketingCtaButtons } from "@/components/premium/MarketingCtaButtons";
import { section } from "@/lib/premium/tokens";

type CTABandProps = {
  title: string;
  subtitle: string;
  button: string;
  secondaryButton?: string;
  secondaryHref?: string;
  primaryHref?: string;
};

export function CTABand({
  title,
  subtitle,
  button,
  secondaryButton,
  secondaryHref = "/programs",
  primaryHref = "/consultation",
}: CTABandProps) {
  return (
    <section className="bg-[#0D1B2A] py-14 md:py-28">
      <div className={section.container}>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#112240] to-[#0D1B2A] px-6 py-12 text-center shadow-2xl sm:px-12 md:py-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className="relative mx-auto max-w-2xl" data-animate="fadeUp">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/15">
              <Calendar className="h-7 w-7 text-[#D4AF37]" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
            <p className="mt-4 text-lg leading-relaxed text-on-navy-subtle">{subtitle}</p>
            <div data-animate="fadeUp" data-animate-delay="0.15">
              <MarketingCtaButtons
              className="mt-10"
              align="center"
              primaryLabel={button}
              secondaryLabel={secondaryButton}
              primaryHref={primaryHref}
              secondaryHref={secondaryHref}
            />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
