"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  ArrowUp,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { useConsentOptional } from "@/context/ConsentContext";
import {
  COMPANY_MAILTO,
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_TEL,
  COMPANY_SOCIAL,
  COMPANY_SUPPORT_EMAIL,
} from "@/lib/company";
import { section } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

const informationLinks = [
  { href: "/about", key: "common.about" },
  { href: "/programs", key: "common.programs" },
  { href: "/subjects", key: "common.subjects" },
  { href: "/pricing", key: "common.pricing" },
  { href: "/resources", key: "common.resourcesShort" },
] as const;

const helpfulLinks = [
  { href: "/contact", key: "common.contact" },
  { href: "/consultation", key: "navbar.consultationShort" },
  { href: "/help", key: "common.help" },
  { href: "/careers", key: "common.careers" },
  { href: "/privacy", key: "footer.privacy" },
  { href: "/terms", key: "footer.terms" },
  { href: "/imprint", key: "footer.imprint" },
] as const;

const SOCIAL_ICONS = [
  { id: "instagram" as const, icon: Instagram, label: "Instagram" },
  { id: "facebook" as const, icon: Facebook, label: "Facebook" },
  { id: "linkedin" as const, icon: Linkedin, label: "LinkedIn" },
  { id: "whatsapp" as const, icon: MessageCircle, label: "WhatsApp" },
] as const;

export default function Footer() {
  const { t } = useTranslation();
  const consent = useConsentOptional();

  const socialLinks = [
    ...SOCIAL_ICONS.flatMap(({ id, icon, label }) => {
      const href = COMPANY_SOCIAL[id];
      if (!href) return [];
      return [{ id, href, icon, label, external: true as const }];
    }),
    { id: "email", href: COMPANY_MAILTO, icon: Mail, label: "E-Mail", external: false as const },
  ];

  return (
    <footer className="site-footer">
      <div className="site-footer__accent" aria-hidden />

      <div
        className={cn(
          section.container,
          "site-footer__inner pb-[max(1rem,env(safe-area-inset-bottom))] pt-10 md:pt-12"
        )}
      >
        <div
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 xl:gap-10"
          data-animate="staggerChildren"
          data-stagger="0.06"
        >
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <BrandLogo size="lg" href="/" onDarkBackground />
            <p className="text-sm font-medium text-[var(--footer-foreground)]">{t("footer.tagline")}</p>

            <div>
              <h3 className="footer-section-title">{t("footer.aboutTitle")}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--footer-muted)]">
                {t("footer.description")}
              </p>
            </div>

            <div>
              <h3 className="footer-section-title">{t("footer.contactTitle")}</h3>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <a href={COMPANY_PHONE_TEL} className="footer-contact-line">
                    <Phone className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                    {COMPANY_PHONE_DISPLAY}
                  </a>
                </li>
                <li>
                  <a href={COMPANY_MAILTO} className="footer-contact-line">
                    <Mail className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" aria-hidden />
                    {COMPANY_SUPPORT_EMAIL}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <FooterColumn title={t("footer.information")}>
            {informationLinks.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {t(item.key)}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t("footer.helpfulLinks")}>
            {helpfulLinks.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {t(item.key)}
              </FooterLink>
            ))}
            <li>
              {consent ? (
                <button type="button" onClick={consent.openPreferences} className="footer-nav-link text-left">
                  {t("footer.cookieSettings")}
                </button>
              ) : (
                <OpenCookieSettingsButton className="footer-nav-link p-0 text-left" />
              )}
            </li>
          </FooterColumn>

          <div className="relative sm:col-span-2 lg:col-span-1">
            <FooterNewsletter />
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="footer-back-top"
              aria-label={t("footer.backToTop")}
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div
          className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--footer-border)] pt-6 md:flex-row"
          data-animate="fadeIn"
        >
          <nav className="flex flex-wrap items-center justify-center gap-2.5" aria-label="Social media">
            {socialLinks.map(({ id, href, icon: Icon, label, external }) => (
              <a
                key={id}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="footer-social-icon"
                aria-label={label}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </nav>

          <p className="text-center text-[11px] text-[var(--footer-subtle)] sm:text-xs md:text-right">
            {t("footer.copyright")}
            <span className="mx-1.5 text-[var(--footer-border)]" aria-hidden>
              ·
            </span>
            {t("footer.madeInGermany")}
          </p>
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
      <h3 className="footer-section-title">{t("footer.newsletterTitle")}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--footer-muted)]">{t("footer.newsletterDesc")}</p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="sr-only" htmlFor="footer-newsletter-email">
          {t("footer.newsletterPlaceholder")}
        </label>
        <div className="footer-subscribe-field">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-navy)]/50" aria-hidden />
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
        <p className="mt-2 text-xs text-red-300">{t("footer.newsletterError")}</p>
      )}
    </div>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="footer-section-title">{title}</h3>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="footer-nav-link">
        {children}
      </Link>
    </li>
  );
}
