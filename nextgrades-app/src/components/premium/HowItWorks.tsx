"use client";

import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { cn } from "@/lib/utils";
import { card, section } from "@/lib/premium/tokens";

type Step = { title: string; desc: string; icon: LucideIcon };

type HowItWorksProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  steps: Step[];
};

export function HowItWorks({ eyebrow, title, subtitle, steps }: HowItWorksProps) {
  return (
    <section className={cn(section.py, "bg-white")}>
      <div className={section.container}>
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                {index < steps.length - 1 && (
                  <div
                    className="absolute left-1/2 top-8 hidden h-px w-full bg-gradient-to-r from-[#D4AF37]/40 to-transparent lg:block"
                    aria-hidden
                  />
                )}
                <div className={cn("relative h-full p-8", card.base)}>
                  <span className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D1B2A] text-sm font-bold text-[#D4AF37]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37]/10">
                    <Icon className="h-6 w-6 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0D1B2A]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
