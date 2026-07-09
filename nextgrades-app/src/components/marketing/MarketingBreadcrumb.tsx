"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

type Props = {
  items: Crumb[];
  variant?: "light" | "dark";
  className?: string;
};

/** Clickable breadcrumb - Home always links to `/`. */
export function MarketingBreadcrumb({ items, variant = "light", className }: Props) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "mb-4 flex flex-wrap items-center gap-1 text-sm",
        variant === "dark" ? "text-gray-400" : "text-gray-500",
        className
      )}
    >
      <Link href="/" className="transition-colors hover:text-[#D4AF37]">
        {t("nav.home", { defaultValue: "Home" })}
      </Link>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-[#D4AF37]">
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                "font-medium",
                variant === "dark" ? "text-white/90" : "text-foreground/85"
              )}
              aria-current="page"
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
