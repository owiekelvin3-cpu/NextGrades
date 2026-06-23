"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";
import { Mail } from "lucide-react";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { useConsentOptional } from "@/context/ConsentContext";
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
          "site-footer__inner pb-[max(1rem,env(safe-area-inset-bottom))] pt-8 md:pt-10"
        )}
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10 xl:gap-14">
          <div className="max-w-[17rem] space-y-3" data-animate="fadeUp">
            <BrandLogo size="md" href="/" onDarkBackground />
            <p className="text-sm leading-snug text-[var(--footer-muted)]">{t("footer.tagline")}</p>
            <a
              href="mailto:support@nextgrades.at"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--footer-link)] transition-colors hover:text-[var(--brand-gold)]"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--brand-gold)]" aria-hidden />
              support@nextgrades.at
            </a>
          </div>

          <div
            className="grid grid-cols-2 gap-x-8 gap-y-6 sm:gap-x-12 md:max-w-md lg:max-w-none lg:gap-x-14"
            data-animate="staggerChildren"
            data-stagger="0.08"
          >
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
        </div>

        <div
          className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[var(--footer-border)] pt-5 md:mt-9 md:flex-row md:gap-4"
          data-animate="fadeIn"
        >
          <p className="text-center text-[11px] leading-relaxed text-[var(--footer-subtle)] sm:text-xs md:text-left">
            {t("footer.copyright")}
            <span className="mx-1.5 hidden text-[var(--footer-border)] sm:inline" aria-hidden>
              ·
            </span>
            <span className="mt-0.5 block sm:mt-0 sm:inline">{t("footer.madeInGermany")}</span>
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
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
      <h4 className="footer-column-title">{title}</h4>
      <ul className="space-y-1.5">{children}</ul>
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
