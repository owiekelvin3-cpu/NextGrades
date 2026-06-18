"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { section } from "@/lib/premium/tokens";

type CTABandProps = {
  title: string;
  subtitle: string;
  button: string;
  secondaryButton?: string;
  secondaryHref?: string;
};

export function CTABand({ title, subtitle, button, secondaryButton, secondaryHref }: CTABandProps) {
  return (
    <section className="bg-[#0D1B2A] py-20 md:py-28">
      <div className={section.container}>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#112240] to-[#0D1B2A] px-8 py-14 text-center shadow-2xl sm:px-12 md:py-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/15">
              <Calendar className="h-7 w-7 text-[#D4AF37]" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-400">{subtitle}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="lg" href="/consultation" className="min-h-[52px] w-full sm:w-auto px-10">
                {button}
              </Button>
              {secondaryButton && secondaryHref && (
                <Button
                  variant="outline"
                  size="lg"
                  href={secondaryHref}
                  className="min-h-[52px] w-full border-white/30 text-white hover:bg-white/10 sm:w-auto"
                >
                  {secondaryButton}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
