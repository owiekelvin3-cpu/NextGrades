"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/BrandLogo";
import { useTheme } from "@/context/ThemeContext";
import { changeAppLanguage } from "@/components/I18nProvider";
import { normalizeLanguage } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

type AuthPageShellProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

/** Minimal chrome for login, verify, and password flows — no marketing nav clutter. */
export function AuthPageShell({ children, footer, className }: AuthPageShellProps) {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  useEffect(() => {
    if (normalizeLanguage(i18n.language) !== "de") {
      void changeAppLanguage("de");
    }
  }, [i18n.language]);

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col",
        isDark ? "bg-[#0D1B2A] text-white" : "bg-gradient-to-b from-[#EEF1F6] via-[#F4F6F9] to-[#F0F2F5] text-[#0D1B2A]",
        className
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-40 border-b backdrop-blur-md",
          isDark ? "border-white/10 bg-[#0D1B2A]/90" : "border-gray-200/80 bg-white/90"
        )}
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandLogo size="lg" href="/" onDarkBackground={isDark} />
          <Link
            href="/"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-[#D4AF37]",
              isDark ? "text-gray-300" : "text-gray-600"
            )}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {t("login.backToHome", { defaultValue: "Zur Startseite" })}
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>
      {footer}
    </div>
  );
}
