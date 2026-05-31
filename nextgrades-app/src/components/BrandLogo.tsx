"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { brandLogoForSurface, BRAND_LOGO } from "@/lib/brand";

export type BrandLogoSize = "sm" | "md" | "lg" | "xl";

const SIZE_STYLES: Record<BrandLogoSize, string> = {
  sm: "h-11 w-auto max-w-[180px] sm:h-12",
  md: "h-12 w-auto max-w-[220px] sm:h-14",
  lg: "h-14 w-auto max-w-[260px] sm:h-16 md:h-[4.25rem]",
  xl: "h-16 w-auto max-w-[300px] sm:h-[4.5rem] md:h-20 md:max-w-[340px]",
};

const SIZE_PROPS: Record<BrandLogoSize, { width: number; height: number; sizes: string }> = {
  sm: { width: 180, height: 48, sizes: "180px" },
  md: { width: 220, height: 56, sizes: "220px" },
  lg: { width: 280, height: 68, sizes: "(max-width: 768px) 240px, 280px" },
  xl: { width: 340, height: 80, sizes: "(max-width: 768px) 280px, 340px" },
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

  const src = brandLogoForSurface(theme, onDarkBackground);
  const isDarkSurface = onDarkBackground || theme === "dark";
  const dim = SIZE_PROPS[size];

  const imageClass = cn(SIZE_STYLES[size], "object-contain object-left", className);

  const content = !imgError ? (
    <Image
      src={src}
      alt="NextGrades"
      width={dim.width}
      height={dim.height}
      priority={priority}
      sizes={dim.sizes}
      className={imageClass}
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
    return <span className="flex shrink-0 items-center">{content}</span>;
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex shrink-0 items-center rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50"
      aria-label="NextGrades home"
    >
      {content}
    </Link>
  );
}
