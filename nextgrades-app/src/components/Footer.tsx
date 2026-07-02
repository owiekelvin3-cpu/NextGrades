"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { useConsentOptional } from "@/context/ConsentContext";
import { useTheme } from "@/context/ThemeContext";
import {
  COMPANY_MAILTO,
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_TEL,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/company";
import { section } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

const programLinks = [
  { href: "/programs", key: "footer.program1" },
  { href: "/programs", key: "footer.program2" },
  { href: "/programs", key: "footer.program3" },
  { href: "/resources", key: "footer.program4" },
] as const;

const companyLinks = [
  { href: "/about", key: "common.about" },
  { href: "/subjects", key: "common.subjects" },
  { href: "/pricing", key: "common.pricing" },
  { href: "/resources", key: "common.resourcesShort" },
] as const;

const supportLinks = [
  { href: "/help", key: "common.help" },
  { href: "/help", key: "footer.faq" },
  { href: "/consultation", key: "footer.process" },
  { href: "/careers", key: "common.careers" },
] as const;

const legalLinks = [
  { href: "/privacy", key: "footer.privacy" },
  { href: "/terms", key: "footer.terms" },
  { href: "/imprint", key: "footer.imprint" },
] as const;

const dividerClass = "md:border-l md:border-black/10 md:dark:border-white/10";

export default function Footer() {
  const { t } = useTranslation();
  const consent = useConsentOptional();
  const { theme } = useTheme();
  const logoOnDark = theme === "dark";

  const bodyMutedClass = "text-sm leading-relaxed text-[#0D1B2A]/70 dark:text-zinc-300";
  const navLinkClass =
    "text-sm text-[#0D1B2A]/80 transition-colors hover:text-[var(--brand-gold)] dark:text-zinc-300 dark:hover:text-[var(--brand-gold)]";
  const contactLinkClass =
    "inline-flex items-center gap-2.5 text-sm text-[#0D1B2A]/85 transition-colors hover:text-[var(--brand-gold)] dark:text-zinc-100 dark:hover:text-[var(--brand-gold)]";
  const legalLinkClass =
    "text-xs text-[#0D1B2A]/60 transition-colors hover:text-[var(--brand-gold)] dark:text-zinc-400 dark:hover:text-[var(--brand-gold)]";
  const ctaClass =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-gold)] px-6 py-3.5 text-sm font-semibold text-[#0D1B2A] shadow-sm transition-all hover:brightness-105";

  return (
    <footer
      className={cn(
        "site-footer border-t border-black/[0.08] bg-[#F8F8F6] text-[#0D1B2A]",
        "dark:border-white/10 dark:bg-[#0D1B2A] dark:text-white"
      )}
    >
      <div
        className={cn(
          section.container,
          "px-6 py-14 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:py-16"
        )}
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,290px)_minmax(0,1fr)] lg:gap-14">
          {/* Brand & contact */}
          <div className="space-y-6">
            <BrandLogo
              size="md"
              href="/"
              onDarkBackground={logoOnDark}
              className="h-9 w-auto max-w-[190px] sm:h-10"
            />
            <p className="text-[1.75rem] font-extrabold leading-[1.15] tracking-tight">
              {t("footer.tagline")}
            </p>
            <p className={cn(bodyMutedClass, "max-w-[17rem]")}>{t("footer.description")}</p>

            <ul className="space-y-3.5">
              <li>
                <a href={COMPANY_PHONE_TEL} className={contactLinkClass}>
                  <Phone className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                  {COMPANY_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={COMPANY_MAILTO} className={contactLinkClass}>
                  <Mail className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                  {COMPANY_SUPPORT_EMAIL}
                </a>
              </li>
              <li className={cn(contactLinkClass, "pointer-events-none")}>
                <MapPin className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                <span>
                  {t("footer.officeAustria")} · {t("footer.officeOnline")}
                </span>
              </li>
            </ul>

            <Link href="/consultation" className={ctaClass}>
              {t("footer.ctaConsultation")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {/* Link columns + newsletter */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-[1fr_1fr_0.85fr_1.6fr] md:gap-0">
            <FooterColumn title={t("footer.programs")} className="md:pr-8">
              {programLinks.map((item) => (
                <FooterLink key={item.key} href={item.href} className={navLinkClass}>
                  {t(item.key)}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title={t("footer.company")} className={cn(dividerClass, "md:px-8")}>
              {companyLinks.map((item) => (
                <FooterLink key={item.key} href={item.href} className={navLinkClass}>
                  {t(item.key)}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title={t("footer.support")} className={cn(dividerClass, "md:px-8")}>
              {supportLinks.map((item) => (
                <FooterLink key={item.key} href={item.href} className={navLinkClass}>
                  {t(item.key)}
                </FooterLink>
              ))}
            </FooterColumn>

            <div className={cn("col-span-2 md:col-span-1", dividerClass, "md:pl-8")}>
              <FooterNewsletter />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-black/10 pt-6 dark:border-white/10 md:flex-row md:justify-between">
          <nav
            aria-label={t("footer.legal", { defaultValue: "Legal" })}
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
          >
            {legalLinks.map((item, index) => (
              <span key={item.href} className="inline-flex items-center gap-x-3">
                {index > 0 && (
                  <span className="text-[#0D1B2A]/25 dark:text-white/20" aria-hidden>
                    |
                  </span>
                )}
                <Link href={item.href} className={legalLinkClass}>
                  {t(item.key)}
                </Link>
              </span>
            ))}
            <span className="text-[#0D1B2A]/25 dark:text-white/20" aria-hidden>
              |
            </span>
            {consent ? (
              <button type="button" onClick={consent.openPreferences} className={legalLinkClass}>
                {t("footer.cookieSettings")}
              </button>
            ) : (
              <OpenCookieSettingsButton className={cn(legalLinkClass, "bg-transparent p-0")} />
            )}
          </nav>

          <div className="flex flex-col items-center gap-1 text-center md:items-end md:text-right">
            <p className="text-[11px] leading-snug text-[#0D1B2A]/55 dark:text-zinc-500">
              {t("footer.copyright")}
            </p>
            <p className="text-[11px] font-medium text-[#0D1B2A]/50 dark:text-zinc-500">
              {t("footer.madeInAustria")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterNewsletter() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("loading");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Newsletter",
          email: trimmed,
          message: t("footer.newsletterSignupMessage"),
          subject: t("footer.newsletterSignupSubject"),
        }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <h3 className="text-sm font-bold tracking-tight text-[var(--brand-gold)]">
        {t("footer.newsletterTitle")}
      </h3>
      <p className="mt-4 text-sm leading-relaxed text-[#0D1B2A]/70 dark:text-zinc-300">
        {t("footer.newsletterDesc")}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <label className="sr-only" htmlFor="footer-newsletter-email">
          {t("footer.newsletterPlaceholder")}
        </label>
        <div className="footer-subscribe-field">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0D1B2A]/45 dark:text-zinc-400"
            aria-hidden
          />
          <input
            id="footer-newsletter-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status !== "idle") setStatus("idle");
            }}
            placeholder={t("footer.newsletterPlaceholder")}
            className="footer-subscribe-input"
            disabled={status === "loading"}
          />
        </div>
        <button type="submit" className="footer-subscribe-btn" disabled={status === "loading"}>
          {status === "loading" ? "…" : t("footer.newsletterCta")}
        </button>
      </form>

      {status === "success" && (
        <p className="mt-2 text-xs text-[var(--brand-gold)]">{t("footer.newsletterSuccess")}</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-300">{t("footer.newsletterError")}</p>
      )}
    </div>
  );
}

function FooterColumn({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-sm font-bold tracking-tight text-[var(--brand-gold)]">{title}</h3>
      <ul className="mt-4 space-y-3.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className="mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-gold)]"
        aria-hidden
      />
      <Link href={href} className={className}>
        {children}
      </Link>
    </li>
  );
}
