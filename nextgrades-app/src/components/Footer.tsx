"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { useConsentOptional } from "@/context/ConsentContext";
import {
  COMPANY_COUNTRY,
  COMPANY_MAILTO,
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_TEL,
  COMPANY_SOCIAL,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/company";
import { section } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

const legalLinks = [
  { href: "/privacy", key: "footer.privacy" },
  { href: "/terms", key: "footer.terms" },
  { href: "/imprint", key: "footer.imprint" },
] as const;

const resourceLinks = [
  { href: "/programs", key: "common.programs" },
  { href: "/subjects", key: "common.subjects" },
  { href: "/pricing", key: "common.pricing" },
  { href: "/resources", key: "common.resourcesShort" },
] as const;

const mainLinks = [
  { href: "/about", key: "common.about" },
  { href: "/contact", key: "common.contact" },
  { href: "/help", key: "common.help" },
  { href: "/careers", key: "common.careers" },
  { href: "/consultation", key: "navbar.consultationShort" },
] as const;

const bottomLinks = [
  { href: "/about", key: "common.about" },
  { href: "/programs", key: "common.programs" },
  { href: "/pricing", key: "common.pricing" },
  { href: "/consultation", key: "navbar.consultationShort" },
] as const;

export default function Footer() {
  const { t, i18n } = useTranslation();
  const consent = useConsentOptional();
  const country = i18n.language.startsWith("de") ? COMPANY_COUNTRY.de : COMPANY_COUNTRY.en;

  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className={cn(section.container, "site-footer__inner pt-10 pb-8 md:pt-12 md:pb-10")}>
          <div className="mb-8 flex justify-center md:mb-10">
            <BrandLogo size="lg" href="/" onDarkBackground className="mx-auto" />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
            <FooterColumn title={t("footer.legal")}>
              {legalLinks.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {t(item.key)}
                </FooterLink>
              ))}
              <li>
                {consent ? (
                  <button type="button" onClick={consent.openPreferences} className="footer-col-link">
                    {t("footer.cookieSettings")}
                  </button>
                ) : (
                  <OpenCookieSettingsButton className="footer-col-link p-0" />
                )}
              </li>
            </FooterColumn>

            <FooterColumn title={t("footer.resourcesHeading")}>
              {resourceLinks.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {t(item.key)}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title={t("footer.linksHeading")}>
              {mainLinks.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {t(item.key)}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title={t("footer.officesHeading")}>
              <li className="footer-col-text">{t("footer.officeAustria")}</li>
              <li className="footer-col-text">{t("footer.officeOnline")}</li>
            </FooterColumn>

            <FooterColumn title={t("footer.stayConnected")} className="col-span-2 sm:col-span-1">
              <li>
                <a href={COMPANY_PHONE_TEL} className="footer-col-contact">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                  {COMPANY_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={COMPANY_MAILTO} className="footer-col-contact">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                  {COMPANY_SUPPORT_EMAIL}
                </a>
              </li>
              <li className="footer-col-contact">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                <span>{country}</span>
              </li>
              <li className="pt-2">
                <div className="flex flex-wrap gap-2">
                  {COMPANY_SOCIAL.whatsapp ? (
                    <a
                      href={COMPANY_SOCIAL.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-social-square"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden />
                    </a>
                  ) : null}
                  <a href={COMPANY_MAILTO} className="footer-social-square" aria-label="E-Mail">
                    <Mail className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </li>
            </FooterColumn>
          </div>
        </div>
      </div>

      <div className="site-footer__bar">
        <div
          className={cn(
            section.container,
            "flex flex-col items-center justify-between gap-3 py-3.5 sm:flex-row sm:gap-4"
          )}
        >
          <p className="text-center text-[11px] text-[#0D1B2A]/90 sm:text-left sm:text-xs">
            {t("footer.copyright")}
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {bottomLinks.map((item) => (
              <Link key={item.href} href={item.href} className="site-footer__bar-link">
                {t(item.key)}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="footer-col-heading">{title}</h3>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="footer-col-link">
        {children}
      </Link>
    </li>
  );
}
