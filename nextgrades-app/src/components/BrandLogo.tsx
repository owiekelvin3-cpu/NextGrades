"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { brandLogoForSurface, BRAND_LOGO } from "@/lib/brand";

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
  /** Use dark-mode logo on navy sections regardless of site theme */
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

  const logoSrc = brandLogoForSurface(theme, onDarkBackground);
  const isDarkSurface = onDarkBackground || theme === "dark";
  const dim = SIZE_PROPS[size];
  const imageClass = cn(
    SIZE_STYLES[size],
    "object-contain object-left transition-opacity duration-200 group-hover:opacity-90",
    className
  );

  const content = !imgError ? (
    <Image
      key={logoSrc}
      src={logoSrc}
      alt="NextGrades"
      width={dim.width}
      height={dim.height}
      priority={priority}
      sizes={dim.sizes}
      style={{ width: "auto", height: "auto" }}
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
    return <span className="group flex shrink-0 items-center">{content}</span>;
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50"
      aria-label="NextGrades home"
    >
      {content}
    </Link>
  );
}
