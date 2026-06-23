"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Mail, Phone } from "lucide-react";
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

const exploreLinks = [
  { href: "/programs", key: "common.programs" },
  { href: "/subjects", key: "common.subjects" },
  { href: "/pricing", key: "common.pricing" },
  { href: "/resources", key: "common.resourcesShort" },
  { href: "/consultation", key: "navbar.consultationShort" },
] as const;

const companyLinks = [
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

export default function Footer() {
  const { t } = useTranslation();
  const consent = useConsentOptional();

  return (
    <footer className="site-footer">
      <div className="site-footer__accent" aria-hidden />

      <div
        className={cn(
          section.container,
          "site-footer__inner pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-7 md:pt-8"
        )}
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <BrandLogo size="md" href="/" onDarkBackground />
            <p className="max-w-[16rem] text-sm leading-snug text-[var(--footer-muted)]">{t("footer.tagline")}</p>
            <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-4">
              <a href={COMPANY_PHONE_TEL} className="footer-contact-line text-[0.8125rem]">
                <Phone className="h-3.5 w-3.5 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                {COMPANY_PHONE_DISPLAY}
              </a>
              <a href={COMPANY_MAILTO} className="footer-contact-line text-[0.8125rem]">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                {COMPANY_SUPPORT_EMAIL}
              </a>
            </div>
          </div>

          <FooterColumn title={t("marketingNav.explore")}>
            {exploreLinks.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {t(item.key)}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t("footer.company")}>
            {companyLinks.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {t(item.key)}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-[var(--footer-border)] pt-4 md:mt-7 md:flex-row">
          <p className="text-center text-[11px] text-[var(--footer-subtle)] sm:text-xs md:text-left">
            {t("footer.copyright")}
            <span className="mx-1.5 text-[var(--footer-border)]" aria-hidden>
              ·
            </span>
            {t("footer.madeInGermany")}
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1">
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[11px] text-[var(--footer-subtle)] transition-colors hover:text-[var(--brand-gold)] sm:text-xs"
              >
                {t(item.key)}
              </Link>
            ))}
            {consent ? (
              <button
                type="button"
                onClick={consent.openPreferences}
                className="text-[11px] text-[var(--footer-subtle)] transition-colors hover:text-[var(--brand-gold)] sm:text-xs"
              >
                {t("footer.cookieSettings")}
              </button>
            ) : (
              <OpenCookieSettingsButton className="text-[11px] text-[var(--footer-subtle)] hover:text-[var(--brand-gold)] sm:text-xs" />
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="footer-section-title text-[0.9375rem]">{title}</h3>
      <ul className="mt-2 space-y-1.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="footer-nav-link text-[0.8125rem]">
        {children}
      </Link>
    </li>
  );
}
