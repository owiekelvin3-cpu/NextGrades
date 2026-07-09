"use client";

import type { ReactNode } from "react";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { cn } from "@/lib/utils";

export const MARKETING_NAVY = "#0D1B2A";
/** Light marketing page background - matches `--background` in design-tokens.css */
export const MARKETING_LIGHT_BG = "#faf9f6";

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
  fallbackSrc?: string;
  children?: ReactNode;
};

const DEFAULT_BG: Record<HeroBlendVariant, string> = {
  "dark-split-right": MARKETING_NAVY,
  "dark-full": MARKETING_NAVY,
  "light-split-right": MARKETING_LIGHT_BG,
  "dark-fade-bottom": MARKETING_NAVY,
};

/** Alpha blend stop - works with hex and CSS variables (unlike `${hex}cc`). */
function mixBg(bg: string, opacityPercent: number): string {
  return `color-mix(in srgb, ${bg} ${opacityPercent}%, transparent)`;
}

/** Blended hero photo layer - no borders; gradients match mockup fades. */
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
  fallbackSrc,
  children,
}: MarketingHeroBlendProps) {
  const bg = backgroundColor ?? DEFAULT_BG[variant];

  const position =
    variant === "dark-fade-bottom"
      ? "inset-0"
      : cn(
          "inset-y-0 right-0 hidden md:block",
          widthClassName ?? "w-[72%] lg:w-[58%] xl:w-[52%]"
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
        fallbackSrc={fallbackSrc}
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
              background: `linear-gradient(to right, ${bg} 0%, ${mixBg(bg, 94)} 55%, ${mixBg(bg, 50)} 75%, transparent 100%)`,
            }}
          />
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background: `linear-gradient(to right, ${bg} 0%, ${mixBg(bg, 90)} 28%, ${mixBg(bg, 60)} 42%, transparent 72%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${mixBg(bg, 80)} 0%, transparent 45%)`,
            }}
          />
        </>
      )}

      {variant === "light-split-right" && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${bg} 0%, ${mixBg(bg, 95)} 28%, ${mixBg(bg, 72)} 46%, ${mixBg(bg, 35)} 62%, transparent 82%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${mixBg(bg, 88)} 0%, ${mixBg(bg, 40)} 28%, transparent 52%)`,
            }}
          />
        </>
      )}

      {variant === "dark-full" && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${bg} 0%, ${mixBg(bg, 96)} 35%, ${mixBg(bg, 50)} 55%, ${mixBg(bg, 25)} 75%, transparent 100%)`,
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
              background: `linear-gradient(to bottom, transparent 0%, ${mixBg(bg, 60)} 55%, ${bg} 100%)`,
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
  const bg = backgroundColor ?? (isDark ? MARKETING_NAVY : MARKETING_LIGHT_BG);

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        isDark ? "bg-[#0D1B2A] text-white" : "bg-background text-[#0D1B2A]",
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
