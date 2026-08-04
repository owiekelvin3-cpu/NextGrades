"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/BrandLogo";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { theme as t } from "@/lib/theme/tokens";
import { authSlideFromLeft, AUTH_EASE } from "@/components/auth/auth-motion";

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
    <div className={cn("relative flex min-h-screen flex-col overflow-hidden", t.dashboard, className)}>
      <motion.div
        className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-[var(--brand-gold)]/8 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -right-16 bottom-24 h-64 w-64 rounded-full bg-[var(--brand-navy)]/20 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        aria-hidden
      />

      <motion.header
        variants={authSlideFromLeft}
        initial="hidden"
        animate="show"
        className={cn(
          "sticky top-0 z-40 border-b border-border-default backdrop-blur-md",
          "bg-surface-elevated/90"
        )}
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: AUTH_EASE }}
          >
            <BrandLogo size="lg" href="/" onDarkBackground={isDark} />
          </motion.div>
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
      </motion.header>

      <main className="relative flex flex-1 flex-col">{children}</main>
      {footer}
    </div>
  );
}
