"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/BrandLogo";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { theme as t } from "@/lib/theme/tokens";

type AuthPageShellProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

/** Minimal chrome for login, verify, and password flows - no marketing nav clutter. */
export function AuthPageShell({ children, footer, className }: AuthPageShellProps) {
  const { theme } = useTheme();
  const { t: translate } = useTranslation();
  const isDark = theme === "dark";

  return (
    <div className={cn("flex min-h-screen flex-col", t.dashboard, className)}>
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-border-default backdrop-blur-md",
          "bg-surface-elevated/90"
        )}
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandLogo size="lg" href="/" onDarkBackground={isDark} />
          <Link
            href="/"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-[var(--brand-gold)]",
              t.textMuted
            )}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {translate("login.backToHome", { defaultValue: "Zur Startseite" })}
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>
      {footer}
    </div>
  );
}
