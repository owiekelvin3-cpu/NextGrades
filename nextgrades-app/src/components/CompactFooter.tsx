"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/** Minimal footer for login/auth pages (owner spec P11-06). */
export function CompactFooter() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  const links = [
    { href: "/privacy", label: t("footer.privacy") },
    { href: "/terms", label: t("footer.terms") },
    { href: "/contact", label: t("footer.imprint") },
    { href: "/contact", label: t("common.contact") },
  ] as const;

  return (
    <footer
      className={cn(
        "border-t px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
        isDark ? "border-white/10 bg-[#0D1B2A] text-gray-400" : "border-gray-200 bg-white text-gray-600"
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-center text-[11px] leading-snug sm:text-left sm:text-xs">{t("footer.copyright")}</p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] sm:text-xs">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="whitespace-nowrap transition-colors hover:text-[#D4AF37]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
