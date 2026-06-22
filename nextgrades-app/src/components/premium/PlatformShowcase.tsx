"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, ClipboardList, Layers } from "lucide-react";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { section, type } from "@/lib/premium/tokens";
import { theme as th } from "@/lib/theme/tokens";
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

/** Platform section — copy first, image, then features on mobile. */
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
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_1.2fr_1fr] lg:items-center lg:gap-8 xl:gap-12">
          <div className="order-1 text-left" data-animate="slideInLeft">
            <p className={`${type.eyebrow} mb-3`}>{eyebrow}</p>
            <h2 className={cn(type.h2, "text-foreground")}>{title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-muted md:text-base">{subtitle}</p>
            <Link
              href={ctaHref}
              className={cn(
                th.btnGold,
                th.focusRing,
                "mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-8 py-4 text-base font-semibold md:mt-8 md:w-auto md:min-h-12 md:rounded-2xl md:py-3 md:text-sm"
              )}
            >
              {cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="order-2 relative mx-auto w-full max-w-lg lg:max-w-none" data-animate="scaleUp">
            <div className="h-48 overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(13,27,42,0.15)] ring-1 ring-border-default md:h-auto">
              <MarketingImage
                src={image}
                fallbackSrc={fallbackImage}
                alt=""
                containerClassName="aspect-[16/10] h-full w-full md:aspect-[16/10]"
                sizes="(max-width: 1024px) 90vw, 560px"
                className="object-cover object-top"
              />
            </div>
          </div>

          <ul className="order-3 flex flex-col gap-3 md:space-y-6 lg:space-y-6" data-animate="staggerChildren" data-stagger="0.12">
            {sidebarFeatures.map((feature, i) => {
              const Icon = SIDEBAR_ICONS[i] ?? BookOpen;
              return (
                <li key={feature.title} className="flex gap-3 md:gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-gold-muted)] md:h-11 md:w-11 md:rounded-xl">
                    <Icon className="h-4 w-4 text-[var(--brand-gold)] md:h-5 md:w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground md:text-base">{feature.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-text-muted">{feature.desc}</p>
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
