"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { brandLogoForSurface, brandLogoHoverForSurface, BRAND_LOGO } from "@/lib/brand";

export type BrandLogoSize = "sm" | "md" | "lg" | "xl";

const SIZE_STYLES: Record<BrandLogoSize, string> = {
  sm: "h-9 w-auto max-w-[150px] sm:h-10",
  md: "h-10 w-auto max-w-[190px] sm:h-11",
  lg: "h-11 w-auto max-w-[220px] sm:h-12 md:h-14",
  xl: "h-14 w-auto max-w-[260px] sm:h-[3.75rem] md:h-16 md:max-w-[300px]",
};

const SIZE_PROPS: Record<BrandLogoSize, { width: number; height: number; sizes: string }> = {
  sm: { width: 150, height: 40, sizes: "150px" },
  md: { width: 190, height: 44, sizes: "190px" },
  lg: { width: 220, height: 56, sizes: "(max-width: 768px) 200px, 220px" },
  xl: { width: 300, height: 64, sizes: "(max-width: 768px) 260px, 300px" },
};

interface BrandLogoProps {
  className?: string;
  href?: string;
  size?: BrandLogoSize;
  /** When false, renders logo markup only (no link). Use when parent is already a link. */
  linked?: boolean;
  /** Use dark-background logo on navy sections regardless of site theme */
  onDarkBackground?: boolean;
  priority?: boolean;
  onClick?: () => void;
}

function LogoImages({
  defaultSrc,
  hoverSrc,
  size,
  className,
  priority,
  onError,
}: {
  defaultSrc: string;
  hoverSrc: string;
  size: BrandLogoSize;
  className?: string;
  priority?: boolean;
  onError: () => void;
}) {
  const dim = SIZE_PROPS[size];
  const imageClass = cn(SIZE_STYLES[size], "object-contain object-left", className);

  const imageStyle = { width: "auto", height: "auto" } as const;

  return (
    <span className="relative inline-flex shrink-0 items-center">
      <Image
        src={defaultSrc}
        alt="NextGrades"
        width={dim.width}
        height={dim.height}
        priority={priority}
        sizes={dim.sizes}
        style={imageStyle}
        className={cn(
          imageClass,
          "relative z-[1] transition-opacity duration-[250ms] ease-out group-hover:opacity-0"
        )}
        onError={onError}
      />
      <Image
        src={hoverSrc}
        alt=""
        width={dim.width}
        height={dim.height}
        sizes={dim.sizes}
        aria-hidden
        style={imageStyle}
        className={cn(
          imageClass,
          "pointer-events-none absolute left-0 top-0 z-[2] opacity-0 transition-opacity duration-[250ms] ease-out group-hover:opacity-100"
        )}
      />
    </span>
  );
}

export function BrandLogo({
  className,
  href = "/",
  size = "lg",
  linked = true,
  onDarkBackground = false,
  priority = true,
  onClick,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const [imgError, setImgError] = useState(false);

  const defaultSrc = brandLogoForSurface(theme, onDarkBackground);
  const hoverSrc = brandLogoHoverForSurface(theme, onDarkBackground);
  const isDarkSurface = onDarkBackground || theme === "dark";

  const content = !imgError ? (
    <LogoImages
      defaultSrc={defaultSrc}
      hoverSrc={hoverSrc}
      size={size}
      className={className}
      priority={priority}
      onError={() => setImgError(true)}
    />
  ) : (
    <span className="flex items-center gap-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] sm:h-14 sm:w-14">
        <Image
          src={BRAND_LOGO.dark}
          alt=""
          width={48}
          height={48}
          className="h-10 w-10 object-contain sm:h-11 sm:w-11"
          aria-hidden
        />
      </span>
      <span
        className={cn(
          "text-xl font-bold tracking-tight sm:text-2xl",
          isDarkSurface ? "text-white" : "text-[#0D1B2A]"
        )}
      >
        NextGrades
      </span>
    </span>
  );

  if (!linked) {
    return <span className="group flex shrink-0 items-center">{content}</span>;
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex shrink-0 items-center rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50"
      aria-label="NextGrades home"
    >
      {content}
    </Link>
  );
}
