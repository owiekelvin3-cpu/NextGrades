"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";
import { ArrowRight, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { useConsentOptional } from "@/context/ConsentContext";
import { FooterMobileAccordion, FooterAccordionLink } from "@/components/marketing/mobile/FooterMobileAccordion";
import { section } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

const programLinks = [
  { href: "/consultation", key: "footer.program1" },
  { href: "/programs", key: "footer.program2" },
  { href: "/programs", key: "footer.program3" },
  { href: "/resources", key: "footer.program4" },
] as const;

const resourceLinks = [
  { href: "/resources", key: "footer.resource1" },
  { href: "/resources", key: "footer.resource2" },
  { href: "/resources", key: "footer.resource3" },
  { href: "/resources/upgrade", key: "footer.resource4" },
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
  { href: "/privacy/cookies", key: "footer.cookies" },
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
          "site-footer__inner pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-10 md:pt-14"
        )}
      >
        {/* Main grid */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)] lg:gap-14 xl:gap-20">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <BrandLogo size="md" href="/" onDarkBackground className="sm:hidden" />
            <BrandLogo size="lg" href="/" onDarkBackground className="hidden sm:block" />

            <div className="space-y-2">
              <p className="text-base font-semibold tracking-tight text-[var(--footer-foreground)]">
                {t("footer.tagline")}
              </p>
              <p className="max-w-sm text-sm leading-relaxed text-[var(--footer-muted)]">
                {t("footer.description")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a href="mailto:support@nextgrades.de" className="footer-contact-btn">
                <Mail className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                support@nextgrades.de
              </a>
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--footer-subtle)]">
                <MapPin className="h-3.5 w-3.5 text-[var(--brand-gold)]" aria-hidden />
                {t("footer.madeInGermany")}
              </span>
            </div>

            <Button variant="gold" size="sm" href="/consultation" className="w-full sm:w-auto">
              {t("common.freeConsultation")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Link columns — desktop */}
          <div className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <FooterColumn title={t("footer.programs")}>
              {programLinks.map((item) => (
                <FooterLink key={item.key} href={item.href}>
                  {t(item.key)}
                </FooterLink>
              ))}
            </FooterColumn>
            <FooterColumn title={t("footer.resources")}>
              {resourceLinks.map((item) => (
                <FooterLink key={item.key} href={item.href}>
                  {t(item.key)}
                </FooterLink>
              ))}
            </FooterColumn>
            <FooterColumn title={t("footer.company")}>
              {companyLinks.map((item) => (
                <FooterLink key={item.href + item.key} href={item.href}>
                  {t(item.key)}
                </FooterLink>
              ))}
            </FooterColumn>
            <FooterColumn title={t("footer.legal")}>
              {legalLinks.map((item) => (
                <FooterLink key={item.href + item.key} href={item.href}>
                  {t(item.key)}
                </FooterLink>
              ))}
            </FooterColumn>
          </div>
        </div>

        {/* Link columns — mobile */}
        <div className="mt-8 space-y-2 sm:hidden">
          <FooterMobileAccordion title={t("footer.programs")}>
            {programLinks.map((item) => (
              <FooterAccordionLink key={item.key} href={item.href}>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>
          <FooterMobileAccordion title={t("footer.resources")}>
            {resourceLinks.map((item) => (
              <FooterAccordionLink key={item.key} href={item.href}>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>
          <FooterMobileAccordion title={t("footer.company")}>
            {companyLinks.map((item) => (
              <FooterAccordionLink key={item.href + item.key} href={item.href}>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>
          <FooterMobileAccordion title={t("footer.legal")}>
            {legalLinks.map((item) => (
              <FooterAccordionLink key={item.href + item.key} href={item.href}>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--footer-border)] pt-6 md:mt-12 md:flex-row">
          <p className="text-center text-xs leading-relaxed text-[var(--footer-subtle)] md:text-left">
            {t("footer.copyright")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {legalLinks.slice(0, 3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-[var(--footer-subtle)] transition-colors hover:text-[var(--brand-gold)]"
              >
                {t(item.key)}
              </Link>
            ))}
            {consent ? (
              <button
                type="button"
                onClick={consent.openPreferences}
                className="text-xs text-[var(--footer-subtle)] transition-colors hover:text-[var(--brand-gold)]"
              >
                {t("footer.cookies")}
              </button>
            ) : (
              <OpenCookieSettingsButton className="text-xs text-[var(--footer-subtle)] hover:text-[var(--brand-gold)]" />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="footer-column-title">{title}</h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="footer-nav-link">
        {children}
      </Link>
    </li>
  );
}
