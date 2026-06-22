"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, ClipboardList, Layers } from "lucide-react";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { section, type } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

const SIDEBAR_ICONS = [BarChart3, BookOpen, ClipboardList, Layers];

type PlatformShowcaseProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  features: { title: string; desc: string }[];
  image: string;
  fallbackImage: string;
  cta: string;
  ctaHref?: string;
};

/** Three-column platform section — laptop center, copy left, features right (mockup). */
export function PlatformShowcase({
  eyebrow,
  title,
  subtitle,
  features,
  image,
  fallbackImage,
  cta,
  ctaHref = "/resources",
}: PlatformShowcaseProps) {
  const sidebarFeatures = features.slice(0, 4);

  return (
    <section className={cn(section.py, "bg-surface-muted")}>
      <div className={section.container}>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr_1fr] lg:gap-8 xl:gap-12">
          <div>
            <p className={`${type.eyebrow} mb-4`}>{eyebrow}</p>
            <h2 className={cn(type.h2, "text-foreground")}>{title}</h2>
            <p className="mt-4 text-base leading-relaxed text-text-muted">{subtitle}</p>
            <Link
              href={ctaHref}
              className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#D4AF37] px-8 text-sm font-semibold text-[#0D1B2A] transition hover:bg-[#C9A030]"
            >
              {cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="overflow-hidden rounded-[1.5rem] shadow-[0_32px_80px_rgba(13,27,42,0.15)] ring-1 ring-border-default">
              <MarketingImage
                src={image}
                fallbackSrc={fallbackImage}
                alt=""
                containerClassName="aspect-[16/10] w-full"
                sizes="(max-width: 1024px) 90vw, 560px"
                className="object-cover object-top"
              />
            </div>
          </div>

          <ul className="space-y-6">
            {sidebarFeatures.map((feature, i) => {
              const Icon = SIDEBAR_ICONS[i] ?? BookOpen;
              return (
                <li key={feature.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-gold-muted)]">
                    <Icon className="h-5 w-5 text-[var(--brand-gold)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{feature.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-text-muted">{feature.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
