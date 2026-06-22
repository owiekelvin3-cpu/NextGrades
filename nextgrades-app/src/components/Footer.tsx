"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";
import { Mail, Phone, MessageCircle, Calendar } from "lucide-react";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { useConsentOptional } from "@/context/ConsentContext";
import { FooterMobileAccordion, FooterAccordionLink } from "@/components/marketing/mobile/FooterMobileAccordion";
import { FooterNewsletter } from "@/components/FooterNewsletter";
import { section } from "@/lib/premium/tokens";
import {
  COMPANY_COUNTRY,
  COMPANY_MAILTO,
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_TEL,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/company";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const supportLinks = [
  { href: "/contact", labelKey: "common.contact" },
  { href: "/help", labelKey: "common.help" },
  { href: "/resources", labelKey: "footer.resource1" },
  { href: "/consultation", labelKey: "common.freeConsultation" },
  { href: "/pricing", labelKey: "common.pricing" },
  { href: "/login", labelKey: "common.login" },
] as const;

const companyLinks = [
  { href: "/about", labelKey: "common.about" },
  { href: "/programs", labelKey: "common.programs" },
  { href: "/subjects", labelKey: "common.subjects" },
  { href: "/careers", labelKey: "common.careers" },
  { href: "/signup", labelKey: "common.signup" },
] as const;

const legalLinks = [
  { href: "/terms", key: "footer.terms" },
  { href: "/privacy", key: "footer.privacy" },
  { href: "/privacy/cookies", key: "footer.cookies" },
  { href: "/imprint", key: "footer.imprint" },
] as const;

const contactChannels = [
  { href: COMPANY_MAILTO, icon: Mail, label: COMPANY_SUPPORT_EMAIL, external: true },
  { href: COMPANY_PHONE_TEL, icon: Phone, label: COMPANY_PHONE_DISPLAY, external: true },
  { href: "/contact", icon: MessageCircle, labelKey: "common.contact" },
  { href: "/consultation", icon: Calendar, labelKey: "common.freeConsultation" },
] as const;

export default function Footer() {
  const { t, i18n } = useTranslation();
  const consent = useConsentOptional();
  const { theme } = useTheme();
  const onDarkFooter = theme === "dark";
  const country =
    i18n.language?.startsWith("de") ? COMPANY_COUNTRY.de : COMPANY_COUNTRY.en;

  return (
    <footer className="site-footer">
      <div className="site-footer__accent" aria-hidden />

      <div
        className={cn(
          section.container,
          "site-footer__inner pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-12 md:pt-16"
        )}
      >
        {/* Main grid — reference: brand | support | company | newsletter */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          {/* Brand + contact channels */}
          <div className="lg:col-span-3">
            <BrandLogo size="lg" href="/" onDarkBackground={onDarkFooter} className="mb-6" />

            <p className="mb-1 text-sm font-semibold text-[var(--footer-foreground)]">
              {t("footer.tagline")}
            </p>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-[var(--footer-muted)]">
              {t("footer.description")}
            </p>

            <div className="flex flex-wrap gap-2">
              {contactChannels.map((item) => {
                const Icon = item.icon;
                const label =
                  "labelKey" in item ? t(item.labelKey) : item.label;
                const className = "footer-social-btn";
                if ("external" in item && item.external) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={className}
                      aria-label={label}
                      title={label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                }
                return (
                  <Link key={item.href} href={item.href} className={className} aria-label={label} title={label}>
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>

            <p className="mt-5 text-xs text-[var(--footer-subtle)]">
              {t("footer.location", { country, defaultValue: `Made with ♥ in ${country}` })}
            </p>
          </div>

          {/* Desktop link columns */}
          <div className="hidden gap-8 md:grid md:grid-cols-3 lg:col-span-6 lg:gap-10">
            <FooterColumn title={t("footer.support", { defaultValue: "Support" })}>
              {supportLinks.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {t(item.labelKey)}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title={t("common.brand", { defaultValue: "NextGrades" })}>
              {companyLinks.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {t(item.labelKey)}
                </FooterLink>
              ))}
            </FooterColumn>

            <div>
              <h4 className="footer-column-title">
                {t("footer.newsletterTitle", { defaultValue: "Newsletter" })}
              </h4>
              <FooterNewsletter />
            </div>
          </div>

          {/* Mobile accordions */}
          <div className="space-y-2 md:hidden lg:col-span-6">
            <FooterMobileAccordion title={t("footer.support", { defaultValue: "Support" })} defaultOpen>
              {supportLinks.map((item) => (
                <FooterAccordionLink key={item.href} href={item.href}>
                  {t(item.labelKey)}
                </FooterAccordionLink>
              ))}
            </FooterMobileAccordion>

            <FooterMobileAccordion title={t("common.brand", { defaultValue: "NextGrades" })}>
              {companyLinks.map((item) => (
                <FooterAccordionLink key={item.href} href={item.href}>
                  {t(item.labelKey)}
                </FooterAccordionLink>
              ))}
            </FooterMobileAccordion>

            <FooterMobileAccordion title={t("footer.newsletterTitle", { defaultValue: "Newsletter" })}>
              <li className="px-2 py-3">
                <FooterNewsletter />
              </li>
            </FooterMobileAccordion>
          </div>
        </div>

        {/* Legal bar */}
        <div className="footer-legal-bar relative z-[1] -mx-5 mt-12 px-5 py-5 md:-mx-6 md:mt-14 md:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <nav
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:justify-start"
              aria-label={t("footer.legal", { defaultValue: "Legal" })}
            >
              {legalLinks.map((item) => (
                <Link key={item.href} href={item.href} className="footer-legal-link">
                  {t(item.key)}
                </Link>
              ))}
              {consent ? (
                <button
                  type="button"
                  onClick={consent.openPreferences}
                  className="footer-legal-link"
                >
                  {t("footer.cookieSettings", { defaultValue: "Cookie settings" })}
                </button>
              ) : (
                <OpenCookieSettingsButton className="footer-legal-link" />
              )}
            </nav>

            <p className="shrink-0 text-center text-xs text-[var(--footer-subtle)] lg:text-right">
              {t("footer.copyright")}
            </p>
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
      <ul className="space-y-3">{children}</ul>
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
