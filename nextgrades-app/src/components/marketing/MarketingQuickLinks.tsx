"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const links = [
  { href: "/programs", key: "programs" },
  { href: "/subjects", key: "subjects" },
  { href: "/resources", key: "resources" },
  { href: "/pricing", key: "pricing" },
  { href: "/consultation", labelKey: "navbar.freeConsultation" },
] as const;

/** Horizontal category strip — Coursera-style explore row on mobile home. */
export function MarketingQuickLinks() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="md:hidden -mx-5 px-5 pb-2">
      <div
        className="snap-carousel gap-2 py-1"
        role="navigation"
        aria-label={t("marketingNav.explore")}
      >
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "mobile-card-press shrink-0 scroll-snap-align-start rounded-full border px-4 py-2.5 text-sm font-semibold touch-manipulation",
              isDark
                ? "border-white/15 bg-white/5 text-white active:bg-white/10"
                : "border-gray-200 bg-white text-[#0D1B2A] shadow-sm active:bg-gray-50"
            )}
          >
            {"labelKey" in item ? t(item.labelKey) : t(`common.${item.key}`)}
          </Link>
        ))}
      </div>
    </div>
  );
}
