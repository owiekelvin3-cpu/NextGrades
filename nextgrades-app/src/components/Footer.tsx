"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";
import { Mail, MapPin, Phone } from "lucide-react";
import { COMPANY_PHONE_DISPLAY, COMPANY_PHONE_TEL } from "@/lib/company";
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
    <footer className="border-t border-white/10 bg-[var(--brand-navy)] text-[var(--sidebar-text-active)]">
      <div
        className={cn(
          section.container,
          "pb-[max(1rem,env(safe-area-inset-bottom))] pt-10 md:pt-12"
        )}
      >
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <BrandLogo size="lg" href="/" onDarkBackground />
            <p className="mt-3 text-sm leading-relaxed text-gray-400">{t("footer.tagline")}</p>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">{t("footer.description")}</p>
          </div>

          <div className="flex flex-col gap-2 text-sm text-gray-400 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <a
              href="mailto:support@nextgrades.de"
              className="inline-flex items-center gap-2 transition hover:text-[#D4AF37]"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              support@nextgrades.de
            </a>
            <a
              href={COMPANY_PHONE_TEL}
              className="inline-flex items-center gap-2 transition hover:text-[#D4AF37]"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {COMPANY_PHONE_DISPLAY}
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {t("footer.location", { country: t("footer.countryAustria") })}
            </span>
          </div>
        </div>

        <div className="hidden gap-8 py-8 sm:grid sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="space-y-3 py-6 sm:hidden">
          <FooterMobileAccordion title={t("footer.programs")} isDark>
            {programLinks.map((item) => (
              <FooterAccordionLink key={item.key} href={item.href} isDark>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>
          <FooterMobileAccordion title={t("footer.resources")} isDark>
            {resourceLinks.map((item) => (
              <FooterAccordionLink key={item.key} href={item.href} isDark>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>
          <FooterMobileAccordion title={t("footer.company")} isDark>
            {companyLinks.map((item) => (
              <FooterAccordionLink key={item.href + item.key} href={item.href} isDark>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>
          <FooterMobileAccordion title={t("footer.legal")} isDark>
            {legalLinks.map((item) => (
              <FooterAccordionLink key={item.href + item.key} href={item.href} isDark>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-center text-xs text-gray-500 sm:text-left">{t("footer.copyright")}</p>
          {consent ? (
            <button
              type="button"
              onClick={consent.openPreferences}
              className="text-xs text-gray-500 transition-colors hover:text-gray-300"
            >
              {t("footer.cookies")}
            </button>
          ) : (
            <OpenCookieSettingsButton className="text-xs text-gray-500 hover:text-gray-300" />
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#D4AF37]">{title}</h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-gray-400 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
