"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  href?: string;
  /** When false, renders logo markup only (no link). Use when parent is already a link. */
  linked?: boolean;
  /** Force gold logo on dark sections regardless of theme */
  onDarkBackground?: boolean;
}

export function BrandLogo({
  className = "h-10 w-auto sm:h-12",
  href = "/",
  linked = true,
  onDarkBackground = false,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const [imgError, setImgError] = useState(false);

  const useDarkLogo = onDarkBackground ? false : theme === "light";
  const src = useDarkLogo ? "/logo-dark.png" : "/logo-light.png";

  const content = !imgError ? (
    <Image
      src={src}
      alt="NextGrades"
      width={180}
      height={48}
      priority
      unoptimized
      className={className}
      onError={() => setImgError(true)}
    />
  ) : (
    <span className="flex items-center gap-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37] text-lg font-bold text-[#0D1B2A]">
        N
      </span>
      <span
        className={cn(
          "text-xl font-bold",
          theme === "dark" || onDarkBackground ? "text-white" : "text-[#0D1B2A]"
        )}
      >
        NextGrades
      </span>
    </span>
  );

  if (!linked) {
    return (
      <span className="flex shrink-0 items-center gap-2">{content}</span>
    );
  }

  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-90"
    >
      {content}
    </Link>
  );
}
