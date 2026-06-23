"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { useConsentOptional } from "@/context/ConsentContext";
import {
  COMPANY_MAILTO,
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_TEL,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/company";
import { section } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/programs", key: "common.programs" },
  { href: "/subjects", key: "common.subjects" },
  { href: "/pricing", key: "common.pricing" },
  { href: "/resources", key: "common.resourcesShort" },
  { href: "/consultation", key: "navbar.consultationShort" },
  { href: "/about", key: "common.about" },
  { href: "/contact", key: "common.contact" },
  { href: "/help", key: "common.help" },
  { href: "/careers", key: "common.careers" },
] as const;

const legalLinks = [
  { href: "/privacy", key: "footer.privacy" },
  { href: "/terms", key: "footer.terms" },
  { href: "/imprint", key: "footer.imprint" },
] as const;

const footerLinkClass =
  "inline-flex items-center rounded-md px-1.5 py-1 text-[13px] leading-tight text-foreground/80 transition-colors hover:text-[var(--brand-gold)] touch-manipulation";

const footerLinkMutedClass =
  "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] leading-tight text-text-muted transition-colors hover:text-[var(--brand-gold)] touch-manipulation";

export default function Footer() {
  const { t } = useTranslation();
  const consent = useConsentOptional();

  return (
    <footer className="site-footer">
      <div
        className={cn(
          section.container,
          "py-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:py-5"
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <BrandLogo size="sm" href="/" className="h-9 max-h-9 w-auto sm:h-10" />
            <p className="text-[11px] leading-snug text-text-muted">{t("footer.tagline")}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[11px] text-text-muted sm:justify-end">
            <a href={COMPANY_PHONE_TEL} className={footerLinkMutedClass}>
              {COMPANY_PHONE_DISPLAY}
            </a>
            <span className="hidden text-border-default sm:inline" aria-hidden>
              ·
            </span>
            <a href={COMPANY_MAILTO} className={footerLinkMutedClass}>
              {COMPANY_SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        <nav
          aria-label={t("footer.helpfulLinks", { defaultValue: "Site links" })}
          className="mt-3 flex flex-wrap justify-center gap-x-0.5 gap-y-0 sm:mt-3.5 sm:justify-start"
        >
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className={footerLinkClass}>
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-0.5 gap-y-0 border-t border-border-default pt-2.5 sm:justify-start">
          {legalLinks.map((item) => (
            <Link key={item.href} href={item.href} className={footerLinkMutedClass}>
              {t(item.key)}
            </Link>
          ))}
          {consent ? (
            <button type="button" onClick={consent.openPreferences} className={footerLinkMutedClass}>
              {t("footer.cookieSettings")}
            </button>
          ) : (
            <OpenCookieSettingsButton className={cn(footerLinkMutedClass, "bg-transparent p-0")} />
          )}
        </div>

        <p className="mt-2 text-center text-[10px] leading-snug text-text-muted/90 sm:text-left">
          {t("footer.copyright")}
          <span className="mx-1.5 text-border-default" aria-hidden>
            ·
          </span>
          {t("footer.madeInGermany")}
        </p>
      </div>
    </footer>
  );
}
