"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";
import { Mail, MapPin, Phone } from "lucide-react";
import { COMPANY_PHONE_DISPLAY, COMPANY_PHONE_TEL } from "@/lib/company";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { section } from "@/lib/premium/tokens";

const exploreLinks = [
  { href: "/programs", key: "common.programs" },
  { href: "/subjects", key: "common.subjects" },
  { href: "/resources", key: "common.resources" },
  { href: "/pricing", key: "common.pricing" },
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
  { href: "/contact", key: "footer.imprint" },
] as const;

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/10 bg-[#0D1B2A] text-white">
      <div className={`${section.container} pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 md:pt-12`}>
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <BrandLogo size="lg" href="/" onDarkBackground />
            <p className="mt-3 text-sm leading-relaxed text-gray-400">{t("footer.tagline")}</p>
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

        <div className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-3 sm:gap-8">
          <FooterColumn title={t("footer.explore", { defaultValue: "Explore" })}>
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
          <FooterColumn title={t("footer.legal")} className="col-span-2 sm:col-span-1">
            {legalLinks.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {t(item.key)}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-center text-xs text-gray-500 sm:text-left">
            {t("footer.copyright")}
          </p>
          <OpenCookieSettingsButton className="text-xs text-gray-500" />
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
      <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#D4AF37]">
        {title}
      </h4>
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
