"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { useConsentOptional } from "@/context/ConsentContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", key: "navBar.home" },
  { href: "/programs", key: "navBar.programs" },
  { href: "/subjects", key: "navBar.subjects" },
  { href: "/resources", key: "navBar.resources" },
  { href: "/pricing", key: "navBar.pricing" },
  { href: "/contact", key: "navBar.contact" },
  { href: "/careers", key: "common.careers" },
] as const;

const legalLinks = [
  { href: "/privacy", key: "footer.privacy" },
  { href: "/terms", key: "footer.terms" },
  { href: "/imprint", key: "footer.imprint" },
] as const;

const navLinkClass =
  "text-sm text-[#0D1B2A]/75 transition-[color,box-shadow] duration-200 hover:text-[var(--brand-gold)] dark:text-zinc-300 dark:hover:text-[var(--brand-gold)] underline-offset-4 hover:underline";

const legalLinkClass =
  "text-xs text-[#0D1B2A]/55 transition-colors duration-200 hover:text-[var(--brand-gold)] dark:text-zinc-400 dark:hover:text-[var(--brand-gold)]";

const ctaClass =
  "inline-flex shrink-0 items-center justify-center rounded-lg border border-[var(--brand-gold)] px-3 py-1.5 text-xs font-semibold tracking-tight text-[var(--brand-gold)] transition-all duration-200 hover:bg-[var(--brand-gold)] hover:text-[#0D1B2A] dark:hover:text-[#0D1B2A] touch-manipulation whitespace-nowrap";

export default function Footer() {
  const { t } = useTranslation();
  const consent = useConsentOptional();
  const { theme } = useTheme();
  const logoOnDark = theme === "dark";

  return (
    <footer
      className={cn(
        "site-footer border-t border-black/[0.08] bg-[#F8F8F6] text-[#0D1B2A]",
        "shadow-[0_-1px_0_rgba(13,27,42,0.04)]",
        "dark:border-white/10 dark:bg-[#0D1B2A] dark:text-white dark:shadow-[0_-1px_0_rgba(255,255,255,0.06)]"
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:py-6">
        {/* Top row */}
        <div className="flex flex-col items-center gap-4 md:relative md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start">
            <BrandLogo
              size="sm"
              href="/"
              onDarkBackground={logoOnDark}
              className="h-8 w-auto max-w-[148px] sm:h-9 sm:max-w-[168px]"
            />
            <Link href="/consultation" className={cn(ctaClass, "md:hidden")}>
              {t("footer.ctaConsultation")}
            </Link>
          </div>

          <nav
            aria-label={t("footer.helpfulLinks", { defaultValue: "Site links" })}
            className="flex max-w-full flex-wrap justify-center gap-x-4 gap-y-2 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:gap-x-5"
          >
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass}>
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <Link href="/consultation" className={cn(ctaClass, "hidden md:inline-flex")}>
            {t("footer.ctaConsultation")}
          </Link>
        </div>

        <div
          className="my-4 h-px bg-black/10 dark:bg-white/10 md:my-3.5"
          role="separator"
          aria-hidden
        />

        {/* Bottom row */}
        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:items-center md:justify-between md:gap-4 md:text-left">
          <p className="order-3 text-[11px] leading-snug text-[#0D1B2A]/50 dark:text-zinc-500 md:order-1">
            {t("footer.copyright")}
          </p>

          <nav
            aria-label={t("footer.legal", { defaultValue: "Legal" })}
            className="order-2 flex flex-wrap items-center justify-center gap-x-1 gap-y-1"
          >
            {legalLinks.map((item, index) => (
              <span key={item.href} className="inline-flex items-center">
                {index > 0 && (
                  <span className="mx-1.5 text-[#0D1B2A]/25 dark:text-white/20" aria-hidden>
                    ·
                  </span>
                )}
                <Link href={item.href} className={legalLinkClass}>
                  {t(item.key)}
                </Link>
              </span>
            ))}
            <span className="mx-1.5 text-[#0D1B2A]/25 dark:text-white/20" aria-hidden>
              ·
            </span>
            {consent ? (
              <button type="button" onClick={consent.openPreferences} className={legalLinkClass}>
                {t("footer.cookieSettings")}
              </button>
            ) : (
              <OpenCookieSettingsButton className={cn(legalLinkClass, "bg-transparent p-0")} />
            )}
          </nav>

          <p className="order-1 text-[11px] font-medium tracking-wide text-[#0D1B2A]/45 dark:text-zinc-500 md:order-3 md:text-right">
            {t("footer.madeInAustria")}
          </p>
        </div>
      </div>
    </footer>
  );
}
