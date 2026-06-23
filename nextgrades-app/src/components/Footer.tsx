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

const primaryLinks = [
  { href: "/programs", key: "common.programs" },
  { href: "/subjects", key: "common.subjects" },
  { href: "/pricing", key: "common.pricing" },
  { href: "/resources", key: "common.resourcesShort" },
  { href: "/consultation", key: "navbar.consultationShort" },
] as const;

const secondaryLinks = [
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
  "inline-flex min-h-9 items-center rounded-lg px-1 text-sm text-foreground/80 transition-colors hover:text-[var(--brand-gold)] touch-manipulation";

const footerLinkMutedClass =
  "inline-flex min-h-8 items-center rounded-lg px-1 text-xs text-text-muted transition-colors hover:text-[var(--brand-gold)] touch-manipulation";

export default function Footer() {
  const { t } = useTranslation();
  const consent = useConsentOptional();

  return (
    <footer className="site-footer">
      <div
        className={cn(
          section.container,
          "pb-[max(1rem,env(safe-area-inset-bottom))] pt-8 md:pt-10"
        )}
      >
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="flex max-w-sm flex-col items-center gap-2 md:items-start">
            <BrandLogo size="sm" href="/" />
            <p className="text-xs leading-relaxed text-text-muted">{t("footer.tagline")}</p>
          </div>

          <div className="flex flex-col items-center gap-1 text-xs text-text-muted md:items-end">
            <a href={COMPANY_PHONE_TEL} className={footerLinkMutedClass}>
              {COMPANY_PHONE_DISPLAY}
            </a>
            <a href={COMPANY_MAILTO} className={footerLinkMutedClass}>
              {COMPANY_SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        <nav
          aria-label={t("marketingNav.explore", { defaultValue: "Explore" })}
          className="mt-8 flex flex-wrap justify-center gap-x-1 gap-y-1 md:mt-9 md:gap-x-2"
        >
          {primaryLinks.map((item) => (
            <Link key={item.href} href={item.href} className={footerLinkClass}>
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <nav
          aria-label={t("footer.company", { defaultValue: "Company" })}
          className="mt-2 flex flex-wrap justify-center gap-x-1 gap-y-1 md:gap-x-2"
        >
          {secondaryLinks.map((item) => (
            <Link key={item.href} href={item.href} className={footerLinkClass}>
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-1 gap-y-1 border-t border-border-default pt-5">
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

        <p className="mt-4 text-center text-[11px] leading-relaxed text-text-muted/90">
          {t("footer.copyright")}
          <span className="mx-2 text-border-default" aria-hidden>
            ·
          </span>
          {t("footer.madeInGermany")}
        </p>
      </div>
    </footer>
  );
}
