"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";

interface BrandLogoProps {
  className?: string;
  href?: string;
  /** Force light logo (for dark hero backgrounds) */
  variant?: "light" | "dark";
}

export function BrandLogo({ className = "h-12 w-auto", href = "/", variant }: BrandLogoProps) {
  const { theme } = useTheme();
  const [imgError, setImgError] = useState(false);
  const useLight = variant === "light" || (variant !== "dark" && theme === "dark");
  const src = useLight ? "/logo-dark.png" : "/logo-light.png";

  return (
    <Link href={href} className="flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0">
      {!imgError ? (
        <img
          src={src}
          alt="NextGrades"
          className={className}
          loading="eager"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center text-[#0D1B2A] font-bold text-lg">
            N
          </span>
          <span className={`font-bold text-xl ${useLight ? "text-white" : "text-[#0D1B2A]"}`}>
            NextGrades
          </span>
        </span>
      )}
    </Link>
  );
}
