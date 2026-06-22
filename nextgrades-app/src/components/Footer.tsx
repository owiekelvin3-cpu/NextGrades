"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "./BrandLogo";
import { ExternalLink, GraduationCap, Send } from "lucide-react";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { useConsentOptional } from "@/context/ConsentContext";
import { FooterMobileAccordion, FooterAccordionLink } from "@/components/marketing/mobile/FooterMobileAccordion";
import { section } from "@/lib/premium/tokens";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

const companyLinks = [
  { href: "/pricing", key: "common.pricing", external: false },
  { href: "/contact", key: "common.contact", external: false },
  { href: "/careers", key: "common.careers", external: true },
  { href: "/programs", key: "footer.explore", external: true },
] as const;

const socialLinks = [
  { href: "https://www.instagram.com/nextgrades", label: "Instagram" },
  { href: "https://www.linkedin.com/company/nextgrades", label: "LinkedIn" },
  { href: "https://twitter.com/nextgrades", label: "Twitter / X" },
] as const;

const legalLinks = [
  { href: "/privacy", key: "footer.privacy" },
  { href: "/terms", key: "footer.terms" },
  { href: "/privacy/cookies", key: "footer.cookies" },
  { href: "/imprint", key: "footer.imprint" },
] as const;

function FooterCtaGraphic() {
  const nodes = [
    { top: "12%", left: "18%", color: "#2563EB", label: "M" },
    { top: "8%", left: "72%", color: "#16A34A", label: "E" },
    { top: "58%", left: "8%", color: "#D4AF37", label: "S" },
    { top: "62%", left: "78%", color: "#9333EA", label: "D" },
    { top: "38%", left: "88%", color: "#DC2626", label: "A" },
  ];

  return (
    <div className="relative mx-auto flex h-48 w-full max-w-sm items-center justify-center sm:h-56 lg:mx-0 lg:max-w-none lg:flex-1" aria-hidden>
      <div className="absolute h-40 w-40 rounded-full border border-dashed border-[var(--footer-border)] sm:h-48 sm:w-48" />
      <div className="absolute h-28 w-28 rounded-full border border-dashed border-[var(--footer-border)]/80 sm:h-32 sm:w-32" />
      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-navy)] text-[var(--brand-gold)] shadow-lg sm:h-[4.5rem] sm:w-[4.5rem]">
        <GraduationCap className="h-8 w-8 sm:h-9 sm:w-9" />
      </div>
      {nodes.map((node) => (
        <span
          key={node.label}
          className="absolute flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-md sm:h-10 sm:w-10"
          style={{ top: node.top, left: node.left, backgroundColor: node.color }}
        >
          {node.label}
        </span>
      ))}
    </div>
  );
}

function NewsletterForm() {
  const { t } = useTranslation();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Newsletter",
          email: email.trim(),
          subject: "Newsletter signup",
          message: "Please add this email to the NextGrades newsletter list.",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.error === "string" ? data.error : "Failed");
      }
      toast.success(t("footer.newsletterSuccess", { defaultValue: "Thanks! We'll be in touch." }));
      setEmail("");
    } catch {
      toast.error(t("misc.errorGeneric", { defaultValue: "Something went wrong." }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mt-4">
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("footer.newsletterPlaceholder", { defaultValue: "Enter your email…" })}
          required
          className="site-footer__newsletter-input w-full pr-14"
        />
        <button
          type="submit"
          disabled={busy}
          className="site-footer__newsletter-btn"
          aria-label={t("footer.newsletterSubmit", { defaultValue: "Subscribe" })}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  const consent = useConsentOptional();

  return (
    <footer className="site-footer">
      <div
        className={cn(
          section.container,
          "site-footer__inner pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10 md:pt-14 lg:pt-16"
        )}
      >
        {/* CTA card */}
        <div className="site-footer__cta">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-xl text-center lg:text-left">
              <p className="text-sm font-medium text-[var(--footer-muted)]">
                {t("footer.ctaEyebrow", { defaultValue: "Start learning today" })}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--footer-foreground)] sm:text-3xl">
                {t("footer.ctaTitle", { defaultValue: "Book your free consultation" })}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--footer-muted)] sm:text-base">
                {t("footer.ctaDescription", {
                  defaultValue:
                    "Talk with our team and discover the right tutoring program for your goals — no commitment required.",
                })}
              </p>
              <Link href="/consultation" className="site-footer__cta-btn mt-6 inline-flex">
                {t("footer.ctaButton", { defaultValue: "Free consultation" })}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            <FooterCtaGraphic />
          </div>
        </div>

        {/* Link grid — desktop */}
        <div className="mt-12 hidden gap-10 md:mt-14 lg:grid lg:grid-cols-4 lg:gap-8 xl:gap-12">
          <div className="space-y-4">
            <BrandLogo size="md" href="/" className="!h-10" />
            <p className="max-w-xs text-sm leading-relaxed text-[var(--footer-muted)]">{t("footer.description")}</p>
          </div>

          <FooterColumn title={t("footer.company")}>
            {companyLinks.map((item) => (
              <FooterLink key={item.href} href={item.href} external={item.external}>
                {t(item.key)}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t("footer.socials", { defaultValue: "Socials" })}>
            {socialLinks.map((item) => (
              <FooterLink key={item.href} href={item.href} external>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <div>
            <h4 className="footer-column-title">{t("footer.newsletter", { defaultValue: "Newsletter" })}</h4>
            <p className="text-sm leading-relaxed text-[var(--footer-muted)]">
              {t("footer.newsletterDesc", {
                defaultValue: "Receive learning tips, product updates, and exclusive offers.",
              })}
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Mobile accordions */}
        <div className="mt-10 space-y-2 lg:hidden">
          <div className="mb-6 flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            <BrandLogo size="md" href="/" className="!h-10" />
            <p className="max-w-sm text-sm text-[var(--footer-muted)]">{t("footer.description")}</p>
          </div>
          <FooterMobileAccordion title={t("footer.company")} defaultOpen>
            {companyLinks.map((item) => (
              <FooterAccordionLink key={item.href} href={item.href}>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>
          <FooterMobileAccordion title={t("footer.socials", { defaultValue: "Socials" })}>
            {socialLinks.map((item) => (
              <FooterAccordionLink key={item.href} href={item.href}>
                {item.label}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>
          <FooterMobileAccordion title={t("footer.newsletter", { defaultValue: "Newsletter" })}>
            <li className="px-2 py-2">
              <p className="mb-3 text-xs text-[var(--footer-muted)]">
                {t("footer.newsletterDesc", {
                  defaultValue: "Receive learning tips, product updates, and exclusive offers.",
                })}
              </p>
              <NewsletterForm />
            </li>
          </FooterMobileAccordion>
          <FooterMobileAccordion title={t("footer.legal")}>
            {legalLinks.map((item) => (
              <FooterAccordionLink key={item.href} href={item.href}>
                {t(item.key)}
              </FooterAccordionLink>
            ))}
          </FooterMobileAccordion>
        </div>

        {/* Bottom bar */}
        <div className="site-footer__bottom mt-10 flex flex-col items-center justify-between gap-4 pt-6 md:mt-12 md:flex-row">
          <p className="text-center text-xs leading-relaxed text-[var(--footer-subtle)] md:text-left">
            {t("footer.copyright")} · {t("footer.madeInGermany")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {legalLinks.map((item) => (
              <Link key={item.href} href={item.href} className="footer-bottom-link">
                {t(item.key)}
              </Link>
            ))}
            {consent ? (
              <button type="button" onClick={consent.openPreferences} className="footer-bottom-link">
                {t("footer.cookies")}
              </button>
            ) : (
              <OpenCookieSettingsButton className="footer-bottom-link" />
            )}
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

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const isExternal = external || href.startsWith("http");
  return (
    <li>
      <Link
        href={href}
        className="footer-nav-link inline-flex items-center gap-1"
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
        {isExternal && <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />}
      </Link>
    </li>
  );
}
