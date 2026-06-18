"use client";

import { cn } from "@/lib/utils";
import { type } from "@/lib/premium/tokens";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  dark = false,
  className,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <header className={cn(centered && "text-center", "mb-14 md:mb-16 lg:mb-20", className)}>
      {eyebrow && (
        <p className={cn(type.eyebrow, centered && "mx-auto", "mb-4")}>{eyebrow}</p>
      )}
      <h2
        className={cn(
          type.h2,
          dark ? "text-white" : "text-[#0D1B2A]",
          centered && "mx-auto max-w-3xl"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-5 max-w-2xl text-base leading-relaxed sm:text-lg",
            dark ? "text-gray-400" : "text-gray-600",
            centered && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}
