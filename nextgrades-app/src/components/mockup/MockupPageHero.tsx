"use client";

import type { ReactNode } from "react";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { MarketingHeroMobileImage } from "@/components/marketing/MarketingHeroMobileImage";
import { MockupBreadcrumbs, type BreadcrumbItem } from "./MockupBreadcrumbs";
import { cn } from "@/lib/utils";
import { hero, type } from "@/lib/premium/tokens";

type Props = {
  breadcrumbs?: BreadcrumbItem[];
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  heroImage: string;
  variant?: "dark-split-right" | "light-split-right" | "dark-full";
  backgroundColor?: string;
  children?: ReactNode;
  className?: string;
};

/** Standard inner-page hero - text first, mobile card image below. */
export function MockupPageHero({
  breadcrumbs,
  eyebrow,
  title,
  subtitle,
  heroImage,
  variant = "dark-split-right",
  backgroundColor,
  children,
  className,
}: Props) {
  const isDark = variant !== "light-split-right";
  const bg = backgroundColor ?? (isDark ? "#0D1B2A" : "#FFFFFF");

  return (
    <section
      className={cn(
        hero.section,
        "relative overflow-hidden",
        isDark ? "bg-[#0D1B2A] text-white" : "bg-white text-[#0D1B2A]",
        className
      )}
    >
      <MarketingHeroBlend
        src={heroImage}
        alt=""
        variant={variant}
        backgroundColor={bg}
        priority
      />
      <div className={hero.inner}>
        <div className="grid min-h-0 min-w-0 flex-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <MockupBreadcrumbs items={breadcrumbs} light={isDark} />
            )}
            {eyebrow && (
              <p className={`${type.eyebrow} mb-3`} data-animate="hero-headline">
                {eyebrow}
              </p>
            )}
            <h1 className={cn(type.h1, "max-w-2xl")} data-animate="hero-headline" data-animate-delay="0.1">
              {title}
            </h1>
            {subtitle && (
              <p
                className={cn(
                  "mt-4 max-w-xl text-sm leading-relaxed md:mt-5 md:text-lg",
                  isDark ? "text-on-navy-muted" : "text-gray-600"
                )}
                data-animate="hero-subheadline"
              >
                {subtitle}
              </p>
            )}
            {children ? <div data-animate="hero-cta">{children}</div> : null}
          </div>
          <div data-animate="hero-image">
            <MarketingHeroMobileImage src={heroImage} priority />
          </div>
        </div>
      </div>
    </section>
  );
}
