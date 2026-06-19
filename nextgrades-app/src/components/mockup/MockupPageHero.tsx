"use client";

import type { ReactNode } from "react";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { MockupBreadcrumbs, type BreadcrumbItem } from "./MockupBreadcrumbs";
import { cn } from "@/lib/utils";
import { hero } from "@/lib/premium/tokens";

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

/** Standard inner-page hero — matches uploaded mockups (contact, help, resources, etc.). */
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
        {breadcrumbs && breadcrumbs.length > 0 && (
          <MockupBreadcrumbs items={breadcrumbs} light={isDark} />
        )}
        {eyebrow && (
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">{eyebrow}</p>
        )}
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-[3.25rem]">
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "mt-5 max-w-xl text-lg leading-relaxed",
              isDark ? "text-gray-300" : "text-gray-600"
            )}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
