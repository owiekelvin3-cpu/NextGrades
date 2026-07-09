"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { brandLogoForSurface, BRAND_LOGO } from "@/lib/brand";

export type BrandLogoSize = "sm" | "md" | "nav" | "navbar" | "navbarWide" | "lg" | "xl";

const SIZE_STYLES: Record<BrandLogoSize, string> = {
  sm: "h-10 w-auto max-w-[180px] sm:h-11",
  md: "h-12 w-auto max-w-[220px] sm:h-[3.25rem]",
  nav: "h-12 w-auto max-w-[240px] sm:h-[3.25rem] sm:max-w-[280px] lg:h-16 lg:max-w-[360px]",
  /** Navbar logo (10% above md, then +10% for nav bar) */
  navbar: "h-[3.63rem] w-auto max-w-[266px] sm:h-[3.93rem]",
  /** Navbar on 2xl+ */
  navbarWide: "h-[3.63rem] w-auto max-w-[290px] sm:h-[3.93rem] sm:max-w-[339px] lg:h-[4.84rem] lg:max-w-[436px]",
  lg: "h-[3.25rem] w-auto max-w-[280px] sm:h-14 md:h-16",
  xl: "h-[4.25rem] w-auto max-w-[340px] sm:h-[4.5rem] md:h-[4.75rem] md:max-w-[400px]",
};

const SIZE_PROPS: Record<BrandLogoSize, { width: number; height: number; sizes: string }> = {
  sm: { width: 180, height: 44, sizes: "180px" },
  md: { width: 220, height: 52, sizes: "220px" },
  nav: { width: 360, height: 64, sizes: "(max-width: 1024px) 260px, 360px" },
  navbar: { width: 266, height: 63, sizes: "266px" },
  navbarWide: { width: 436, height: 77, sizes: "(max-width: 1024px) 315px, 436px" },
  lg: { width: 280, height: 64, sizes: "(max-width: 768px) 240px, 280px" },
  xl: { width: 400, height: 80, sizes: "(max-width: 768px) 320px, 400px" },
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
