"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";
import { cn } from "@/lib/utils";
import { Mail, MapPin, Phone } from "lucide-react";
import { COMPANY_PHONE_DISPLAY, COMPANY_PHONE_TEL } from "@/lib/company";
import {
  FooterAccordionLink,
  FooterMobileAccordion,
} from "@/components/marketing/mobile/FooterMobileAccordion";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";

const programLinks = [
  { href: "/programs", key: "footer.program1" },
  { href: "/programs", key: "footer.program2" },
  { href: "/programs", key: "footer.program3" },
  { href: "/programs", key: "footer.program4" },
] as const;

const resourceLinks = [
  { href: "/resources", key: "footer.resource1" },
  { href: "/resources", key: "footer.resource2" },
  { href: "/resources", key: "footer.resource3" },
  { href: "/resources", key: "footer.resource4" },
] as const;

const companyLinks = [
  { href: "/about", key: "common.about" },
  { href: "/subjects", key: "common.subjects" },
  { href: "/pricing", key: "common.pricing" },
  { href: "/consultation", key: "navbar.freeConsultation" },
  { href: "/careers", key: "common.careers" },
  { href: "/contact", key: "common.contact" },
  { href: "/help", key: "common.help" },
] as const;

const legalLinks = [
  { href: "/privacy", key: "footer.privacy" },
  { href: "/privacy/cookies", key: "footer.cookies" },
  { href: "/terms", key: "footer.terms" },
  { href: "/contact", key: "footer.imprint" },
] as const;

export default function Footer() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  return (
    <footer
      className={cn(
        "border-t pb-[max(2rem,env(safe-area-inset-bottom))] pt-12 sm:pt-16",
        isDark ? "border-white/10 bg-[#0D1B2A] text-white" : "border-gray-100 bg-white text-[#0D1B2A]"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Brand + CTA — full width on mobile */}
        <div className="mb-10 flex flex-col gap-6 border-b pb-10 sm:mb-12 sm:flex-row sm:items-start sm:justify-between sm:pb-12 lg:mb-14">
          <div className="max-w-md">
            <BrandLogo size="lg" />
            <p className={cn("mt-4 text-sm leading-relaxed", isDark ? "text-gray-400" : "text-gray-600")}>
              {t("login.smartLearning")}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <a
                href="mailto:support@nextgrades.de"
                className={cn(
                  "inline-flex items-center gap-1.5 transition-colors hover:text-[#D4AF37]",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                <Mail className="h-4 w-4 shrink-0" />
                support@nextgrades.de
              </a>
              <a
                href={COMPANY_PHONE_TEL}
                className={cn(
                  "inline-flex items-center gap-1.5 transition-colors hover:text-[#D4AF37]",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                <Phone className="h-4 w-4 shrink-0" />
                {COMPANY_PHONE_DISPLAY}
              </a>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                <MapPin className="h-4 w-4 shrink-0" />
                {t("footer.location", { country: t("footer.countryAustria") })}
              </span>
            </div>
          </div>
          <Link
            href="/consultation"
            className="inline-flex min-h-[52px] w-full shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0D1B2A] shadow-md transition hover:bg-[#c9a030] touch-manipulation sm:w-auto sm:self-center"
          >
            {t("navbar.freeConsultation")}
          </Link>
        </div>

        {/* Link columns — accordion on mobile, grid on desktop */}
        <div className="space-y-3 md:hidden">
          <FooterMobileAccordion title={t("footer.programs")} isDark={isDark} defaultOpen>
            {programLinks.map((item) => (
              <FooterAccordionLink key={item.key} href={item.href} isDark={isDark}>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>

          <FooterMobileAccordion title={t("footer.resources")} isDark={isDark}>
            {resourceLinks.map((item) => (
              <FooterAccordionLink key={item.key} href={item.href} isDark={isDark}>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>

          <FooterMobileAccordion title={t("footer.company")} isDark={isDark}>
            {companyLinks.map((item) => (
              <FooterAccordionLink key={item.key} href={item.href} isDark={isDark}>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>

          <FooterMobileAccordion title={t("footer.legal")} isDark={isDark}>
            {legalLinks.map((item) => (
              <FooterAccordionLink key={item.key} href={item.href} isDark={isDark}>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>
        </div>

        <div className="hidden grid-cols-2 gap-8 md:grid md:grid-cols-4 md:gap-10">
          <FooterColumn title={t("footer.programs")} isDark={isDark}>
            {programLinks.map((item) => (
              <FooterLink key={item.key} href={item.href} isDark={isDark}>
                {t(item.key)}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t("footer.resources")} isDark={isDark}>
            {resourceLinks.map((item) => (
              <FooterLink key={item.key} href={item.href} isDark={isDark}>
                {t(item.key)}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t("footer.company")} isDark={isDark}>
            {companyLinks.map((item) => (
              <FooterLink key={item.key} href={item.href} isDark={isDark}>
                {t(item.key)}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t("footer.legal")} isDark={isDark}>
            {legalLinks.map((item) => (
              <FooterLink key={item.key} href={item.href} isDark={isDark}>
                {t(item.key)}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        {/* Bottom bar */}
        <div
          className={cn(
            "mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:mt-12 sm:flex-row",
            isDark ? "border-white/10" : "border-gray-100"
          )}
        >
          <p className={cn("text-center text-xs sm:text-left sm:text-sm", isDark ? "text-gray-500" : "text-gray-500")}>
            {t("footer.copyright")}
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs sm:text-sm">
            <FooterLink href="/privacy" isDark={isDark} inline>
              {t("footer.privacy")}
            </FooterLink>
            <FooterLink href="/terms" isDark={isDark} inline>
              {t("footer.terms")}
            </FooterLink>
            <FooterLink href="/contact" isDark={isDark} inline>
              {t("common.contact")}
            </FooterLink>
            <OpenCookieSettingsButton className="text-xs sm:text-sm" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
  isDark,
}: {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div>
      <h4 className={cn("mb-4 text-sm font-semibold tracking-wide", isDark ? "text-white" : "text-[#0D1B2A]")}>
        {title}
      </h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
  isDark,
  inline = false,
}: {
  href: string;
  children: React.ReactNode;
  isDark: boolean;
  inline?: boolean;
}) {
  const className = cn(
    "transition-colors hover:text-[#D4AF37]",
    inline ? "text-xs sm:text-sm" : "block text-sm",
    isDark ? "text-gray-400" : "text-gray-600"
  );

  if (inline) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <li>
      <Link href={href} className={className}>
        {children}
      </Link>
    </li>
  );
}
