"use client";

import type { ReactNode } from "react";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { cn } from "@/lib/utils";

export const MARKETING_NAVY = "#0D1B2A";

export type HeroBlendVariant =
  /** Photo on the right; fades into navy on the left (programs, home, about). */
  | "dark-split-right"
  /** Full-bleed photo with navy overlay for legible copy (resources hub, subject dark). */
  | "dark-full"
  /** Photo on the right; fades into white/light on the left (contact light hero). */
  | "light-split-right"
  /** Photo bleeds from top; fades to page background at bottom (login page backdrop). */
  | "dark-fade-bottom";

type MarketingHeroBlendProps = {
  src: string;
  alt?: string;
  variant: HeroBlendVariant;
  /** Background the image should melt into (defaults by variant). */
  backgroundColor?: string;
  className?: string;
  imageClassName?: string;
  widthClassName?: string;
  priority?: boolean;
  sizes?: string;
  opacity?: number;
  children?: ReactNode;
};

const DEFAULT_BG: Record<HeroBlendVariant, string> = {
  "dark-split-right": MARKETING_NAVY,
  "dark-full": MARKETING_NAVY,
  "light-split-right": "#FFFFFF",
  "dark-fade-bottom": MARKETING_NAVY,
};

/** Blended hero photo layer — no borders; gradients match mockup fades. */
export function MarketingHeroBlend({
  src,
  alt = "",
  variant,
  backgroundColor,
  className,
  imageClassName,
  widthClassName,
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 55vw",
  opacity = 1,
  children,
}: MarketingHeroBlendProps) {
  const bg = backgroundColor ?? DEFAULT_BG[variant];

  const position =
    variant === "dark-fade-bottom"
      ? "inset-0"
      : cn(
          "inset-y-0 right-0 max-lg:opacity-[0.42] lg:opacity-100",
          widthClassName ?? "w-full sm:w-[88%] md:w-[72%] lg:w-[58%] xl:w-[52%]"
        );

  return (
    <div
      className={cn("pointer-events-none absolute overflow-hidden", position, className)}
      aria-hidden={!alt}
      style={{ opacity }}
    >
      <MarketingImage
        src={src}
        alt={alt}
        containerClassName="absolute inset-0"
        className={cn(
          "object-cover",
          variant === "dark-split-right" || variant === "light-split-right"
            ? "object-right"
            : "object-center",
          imageClassName
        )}
        sizes={sizes}
        priority={priority}
      />

      {variant === "dark-split-right" && (
        <>
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              background: `linear-gradient(to right, ${bg} 0%, ${bg}f0 55%, ${bg}80 75%, transparent 100%)`,
            }}
          />
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background: `linear-gradient(to right, ${bg} 0%, ${bg}e6 28%, ${bg}99 42%, transparent 72%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${bg}cc 0%, transparent 45%)`,
            }}
          />
        </>
      )}

      {variant === "light-split-right" && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${bg} 0%, ${bg}f2 32%, ${bg}bf 48%, transparent 78%)`,
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"
          />
        </>
      )}

      {variant === "dark-full" && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${bg} 0%, ${bg}f5 35%, ${bg}80 55%, ${bg}40 75%, transparent 100%)`,
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#0D1B2A]/55 via-[#0D1B2A]/25 to-[#0D1B2A]/90"
          />
        </>
      )}

      {variant === "dark-fade-bottom" && (
        <>
          <div className="absolute inset-0 bg-[#0D1B2A]/50" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, ${bg}99 55%, ${bg} 100%)`,
            }}
          />
          <div
            className="absolute inset-0 max-w-[55%]"
            style={{
              background: `linear-gradient(to right, ${bg} 0%, transparent 100%)`,
            }}
          />
        </>
      )}

      {children}
    </div>
  );
}

type MarketingHeroSectionProps = {
  variant: HeroBlendVariant;
  src?: string;
  alt?: string;
  backgroundColor?: string;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
  showBlendImage?: boolean;
  imagePriority?: boolean;
};

/** Section shell with optional blended background image. */
export function MarketingHeroSection({
  variant,
  src,
  alt,
  backgroundColor,
  className,
  contentClassName,
  children,
  showBlendImage = true,
  imagePriority = true,
}: MarketingHeroSectionProps) {
  const isDark = variant !== "light-split-right";
  const bg = backgroundColor ?? (isDark ? MARKETING_NAVY : "#FFFFFF");

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        isDark ? "bg-[#0D1B2A] text-white" : "bg-white text-[#0D1B2A]",
        className
      )}
      style={backgroundColor ? { backgroundColor: bg } : undefined}
    >
      {showBlendImage && src && (
        <MarketingHeroBlend
          src={src}
          alt={alt ?? ""}
          variant={variant}
          backgroundColor={bg}
          priority={imagePriority}
          sizes={variant === "dark-full" ? "100vw" : "(max-width: 1024px) 100vw, 55vw"}
        />
      )}
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </section>
  );
}
