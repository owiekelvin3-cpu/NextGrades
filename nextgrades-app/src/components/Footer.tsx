"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { useConsentOptional } from "@/context/ConsentContext";
import {
  COMPANY_MAILTO,
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_TEL,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/company";
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

const goldGradient = "bg-[linear-gradient(135deg,#F2C94C_0%,#D4AF37_100%)]";
const columnDivider = "md:border-l md:border-black/10 md:dark:border-white/10";
const navLinkClass =
  "text-[15px] text-[#0D1B2A]/80 transition-colors hover:text-[var(--brand-gold)] dark:text-zinc-300 dark:hover:text-[var(--brand-gold)]";

export default function Footer() {
  const { t } = useTranslation();
  const consent = useConsentOptional();

  const legalLinkClass =
    "text-sm text-[#6B7280] transition-colors hover:text-[var(--brand-gold)] hover:underline dark:text-[#6B7280]";

  return (
    <footer className="site-footer border-t border-black/[0.08] bg-[#F8F8F6] text-[#0D1B2A] dark:border-white/10 dark:bg-[#0D1B2A] dark:text-white">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-6 pb-10 pt-16 sm:px-8 md:pt-20 lg:px-[72px]">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.4fr_minmax(0,3.6fr)] lg:gap-14">
          {/* Column 1 — Brand */}
          <div>
            <h2 className="max-w-[15rem] text-[2rem] font-bold leading-[1.1] tracking-tight text-[#0D1B2A] sm:text-[2.375rem] dark:text-white">
              {t("footer.tagline")}
            </h2>
            <div className="mb-5 mt-3.5 h-[3px] w-14 rounded-full bg-[var(--brand-gold)]" />
            <p className="max-w-[20rem] text-[15px] leading-[1.6] text-[#0D1B2A]/60 dark:text-[#9CA3AF]">
              {t("footer.description")}
            </p>

            <ul className="mt-6 space-y-4">
              <li>
                <a
                  href={COMPANY_PHONE_TEL}
                  className="inline-flex items-center gap-3 text-[15px] text-[#0D1B2A]/85 transition-colors hover:text-[var(--brand-gold)] dark:text-zinc-100 dark:hover:text-[var(--brand-gold)]"
                >
                  <Phone className="h-5 w-5 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                  {COMPANY_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={COMPANY_MAILTO}
                  className="inline-flex items-center gap-3 text-[15px] text-[#0D1B2A]/85 transition-colors hover:text-[var(--brand-gold)] dark:text-zinc-100 dark:hover:text-[var(--brand-gold)]"
                >
                  <Mail className="h-5 w-5 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                  {COMPANY_SUPPORT_EMAIL}
                </a>
              </li>
              <li className="inline-flex items-center gap-3 text-[15px] text-[#0D1B2A]/85 dark:text-zinc-100">
                <MapPin className="h-5 w-5 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                <span>
                  {t("footer.officeAustria")} · {t("footer.officeOnline")}
                </span>
              </li>
            </ul>

            <Link
              href="/consultation"
              className={cn(
                "mt-8 inline-flex items-center gap-2 rounded-[10px] px-7 py-4 text-[15px] font-bold text-[#0D1B2A] shadow-sm transition-all hover:brightness-105",
                goldGradient
              )}
            >
              {t("footer.ctaConsultation")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {/* Columns 2–5 — link groups + newsletter */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 md:grid-cols-[1fr_1fr_1fr_1.3fr] md:gap-0">
            <FooterColumn title={t("footer.programs")} className="md:pr-8">
              {programLinks.map((item) => (
                <FooterLink key={item.key} href={item.href}>
                  {t(item.key)}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title={t("footer.company")} className={cn(columnDivider, "md:px-8")}>
              {companyLinks.map((item) => (
                <FooterLink key={item.key} href={item.href}>
                  {t(item.key)}
                </FooterLink>
              ))}
            </FooterColumn>

            <FooterColumn title={t("footer.support")} className={cn(columnDivider, "md:px-8")}>
              {supportLinks.map((item) => (
                <FooterLink key={item.key} href={item.href}>
                  {t(item.key)}
                </FooterLink>
              ))}
            </FooterColumn>

            <div className={cn("col-span-2 md:col-span-1", columnDivider, "md:pl-8")}>
              <FooterNewsletter />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-4 border-t border-black/10 pt-6 dark:border-white/10 md:flex-row md:justify-between">
          <nav
            aria-label={t("footer.legal", { defaultValue: "Legal" })}
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
          >
            {legalLinks.map((item) => (
              <span key={item.href} className="inline-flex items-center whitespace-nowrap">
                <Link href={item.href} className={legalLinkClass}>
                  {t(item.key)}
                </Link>
                <span className="pl-3 text-[#0D1B2A]/25 dark:text-white/20" aria-hidden>
                  |
                </span>
              </span>
            ))}
            {consent ? (
              <button type="button" onClick={consent.openPreferences} className={legalLinkClass}>
                {t("footer.cookieSettings")}
              </button>
            ) : (
              <OpenCookieSettingsButton className={cn(legalLinkClass, "bg-transparent p-0")} />
            )}
          </nav>

          <div className="flex flex-col items-center gap-1 text-center md:items-end md:text-right">
            <p className="text-sm text-[#6B7280]">{t("footer.copyright")}</p>
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
      <h3 className="mb-6 text-lg font-bold tracking-tight text-[var(--brand-gold)]">
        {t("footer.newsletterTitle")}
      </h3>
      <p className="text-sm leading-[1.6] text-[#0D1B2A]/60 dark:text-[#9CA3AF]">
        {t("footer.newsletterDesc")}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <label className="sr-only" htmlFor="footer-newsletter-email">
          {t("footer.newsletterPlaceholder")}
        </label>
        <div className="footer-subscribe-field">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-gold)]"
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
      <h3 className="mb-6 text-lg font-bold tracking-tight text-[var(--brand-gold)]">{title}</h3>
      <ul className="space-y-[1.375rem]">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className="mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-gold)]"
        aria-hidden
      />
      <Link href={href} className={navLinkClass}>
        {children}
      </Link>
    </li>
  );
}
