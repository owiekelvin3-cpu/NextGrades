"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";
import { Mail } from "lucide-react";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { useConsentOptional } from "@/context/ConsentContext";
import { FooterMobileAccordion, FooterAccordionLink } from "@/components/marketing/mobile/FooterMobileAccordion";
import { section } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

const programLinks = [
  { href: "/programs", key: "footer.program1" },
  { href: "/programs", key: "footer.program2" },
  { href: "/programs", key: "footer.program3" },
  { href: "/resources", key: "footer.program4" },
] as const;

const resourceLinks = [
  { href: "/resources", key: "footer.resource1" },
  { href: "/resources", key: "footer.resource2" },
  { href: "/resources", key: "footer.resource3" },
  { href: "/resources", key: "footer.resource4" },
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
      <div
        className={cn(
          section.container,
          "pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-10 md:pt-12"
        )}
      >
        {/* Brand */}
        <div className="border-b border-[var(--footer-border)] pb-8 md:pb-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-md">
              <BrandLogo size="md" href="/" onDarkBackground className="sm:hidden" />
              <BrandLogo size="lg" href="/" onDarkBackground className="hidden sm:block" />
              <p className="mt-4 text-sm leading-relaxed text-[var(--footer-muted)]">
                {t("footer.tagline")}
              </p>
            </div>
            <a
              href="mailto:support@nextgrades.de"
              className="inline-flex w-fit items-center gap-2 text-sm text-[var(--footer-link)]"
            >
              <Mail className="h-4 w-4 shrink-0 text-[var(--footer-heading)]" aria-hidden />
              support@nextgrades.de
            </a>
          </div>
        </div>

        {/* Link columns — desktop */}
        <div className="hidden gap-10 py-9 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
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

        {/* Link columns — mobile */}
        <div className="space-y-2 py-6 sm:hidden">
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
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--footer-border)] pt-6 sm:flex-row">
          <p className="text-center text-xs text-[var(--footer-subtle)] sm:text-left">
            {t("footer.copyright")}
          </p>
          {consent ? (
            <button
              type="button"
              onClick={consent.openPreferences}
              className="text-xs text-[var(--footer-subtle)] transition-colors hover:text-[var(--footer-foreground)]"
            >
              {t("footer.cookies")}
            </button>
          ) : (
            <OpenCookieSettingsButton className="text-xs text-[var(--footer-subtle)] hover:text-[var(--footer-foreground)]" />
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--footer-heading)]">
        {title}
      </h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm leading-snug text-[var(--footer-link)] hover:text-[var(--brand-gold)]">
        {children}
      </Link>
    </li>
  );
}
