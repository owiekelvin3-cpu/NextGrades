"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  FileText,
  Mail,
  Scale,
  Shield,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";
import { section, type } from "@/lib/premium/tokens";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { Button } from "@/components/ui/Button";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { MARKETING_LIGHT_BG } from "@/components/marketing/MarketingHeroBlend";
import { useMarketingHeroImage } from "@/hooks/useCmsImage";
import { LegalTableOfContents } from "@/components/legal/LegalTableOfContents";

type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type LegalDocumentPageProps = {
  namespace: "terms" | "privacy" | "cookiesPolicy" | "imprint";
};

const RELATED_DOCS: { href: string; namespace: LegalDocumentPageProps["namespace"]; icon: typeof FileText }[] = [
  { href: "/terms", namespace: "terms", icon: Scale },
  { href: "/privacy", namespace: "privacy", icon: Shield },
  { href: "/privacy/cookies", namespace: "cookiesPolicy", icon: BookOpen },
  { href: "/imprint", namespace: "imprint", icon: FileText },
];

function sectionId(index: number): string {
  return `legal-section-${index + 1}`;
}

export function LegalDocumentPage({ namespace }: LegalDocumentPageProps) {
  const mt = useMarketingTheme();
  const { t, i18n } = useTranslation();
  const privacyHeroImage = useMarketingHeroImage();
  const showPrivacyHero = namespace === "privacy";
  const isTerms = namespace === "terms";
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = useMemo(() => {
    const data = t(`${namespace}.sections`, { returnObjects: true });
    return Array.isArray(data) ? (data as LegalSection[]) : [];
  }, [t, i18n.language, namespace]);

  const highlights = useMemo(() => {
    const data = t(`${namespace}.highlights`, { returnObjects: true, defaultValue: [] });
    return Array.isArray(data) ? (data as string[]) : [];
  }, [t, i18n.language, namespace]);

  const tocItems = useMemo(
    () => sections.map((s, i) => ({ id: sectionId(i), label: s.title })),
    [sections]
  );

  const relatedDocs = RELATED_DOCS.filter((doc) => doc.namespace !== namespace);

  const observeSections = useCallback(() => {
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5] }
    );

    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections.length, tocItems]);

  useEffect(() => {
    const cleanup = observeSections();
    return cleanup;
  }, [observeSections]);

  useEffect(() => {
    if (tocItems.length && !activeSection) {
      setActiveSection(tocItems[0].id);
    }
  }, [tocItems, activeSection]);

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1">
        {/* Premium hero */}
        <section
          className={cn(
            "relative overflow-hidden border-b",
            showPrivacyHero
              ? "border-border-default bg-background text-foreground"
              : "border-white/10 bg-[#0D1B2A] text-white"
          )}
        >
          {!showPrivacyHero ? (
            <>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(212,175,55,0.18),transparent_55%)]" />
              <div className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[#1e3a5f]/80 blur-3xl" />
            </>
          ) : null}

          {showPrivacyHero ? (
            <MarketingHeroBlend
              src={privacyHeroImage}
              alt=""
              variant="light-split-right"
              backgroundColor={MARKETING_LIGHT_BG}
              priority
              widthClassName="w-[65%] lg:w-[55%]"
            />
          ) : null}

          <div
            className={cn(
              "relative z-10 mx-auto max-w-4xl px-5 pb-14 pt-site-nav text-center sm:px-6 md:pb-16 md:pt-28 lg:px-8",
              showPrivacyHero && "md:pt-32"
            )}
          >
            <div
              className={cn(
                "mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]",
                showPrivacyHero
                  ? "border-[var(--brand-gold)]/30 bg-[var(--brand-gold)]/10 text-[var(--brand-gold)]"
                  : "border-white/15 bg-white/5 text-[#D4AF37]"
              )}
              data-animate="hero-headline"
            >
              {isTerms ? <Scale className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              {t(`${namespace}.eyebrow`)}
            </div>

            <h1
              className={cn(
                type.h1,
                showPrivacyHero ? "text-foreground" : "text-white"
              )}
              data-animate="hero-headline"
              data-animate-delay="0.1"
            >
              {t(`${namespace}.title`)}
            </h1>

            <p
              className={cn(
                "mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg",
                showPrivacyHero ? "text-foreground-secondary" : "text-on-navy-muted"
              )}
              data-animate="hero-subheadline"
            >
              {t(`${namespace}.subtitle`)}
            </p>

            <p
              className={cn(
                "mt-4 text-sm",
                showPrivacyHero ? "text-text-muted" : "text-on-navy-subtle"
              )}
              data-animate="hero-subheadline"
              data-animate-delay="0.15"
            >
              {t(`${namespace}.lastUpdated`)}
            </p>

            {isTerms ? (
              <div
                className="mt-8 flex flex-wrap items-center justify-center gap-3"
                data-animate="hero-cta"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/90">
                  <Shield className="h-3.5 w-3.5 text-[#D4AF37]" />
                  {t("terms.trustBadge1", { defaultValue: "Consumer-friendly policies" })}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/90">
                  <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                  {t("terms.trustBadge2", { defaultValue: "Clear billing & cancellation" })}
                </span>
              </div>
            ) : null}
          </div>
        </section>

        {/* Highlights strip — Terms */}
        {highlights.length > 0 ? (
          <section className="border-b border-border-default bg-surface-muted">
            <div className={cn(section.container, "py-8 md:py-10")}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-border-default bg-surface-elevated p-4 shadow-sm"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-gold-muted)]">
                      <ChevronRight className="h-4 w-4 text-[var(--brand-gold)]" />
                    </span>
                    <p className="text-sm font-medium leading-snug text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Body */}
        <section className={cn(section.pyCompact, "bg-background")}>
          <div className={cn(section.container)}>
            <div className="lg:grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] xl:gap-16">
              {/* Sticky TOC — desktop */}
              {tocItems.length > 0 ? (
                <aside className="mb-10 hidden lg:block">
                  <div className="sticky top-28 rounded-2xl border border-border-default bg-surface-elevated p-5 shadow-[var(--card-shadow)]">
                    <LegalTableOfContents
                      items={tocItems}
                      activeId={activeSection}
                      title={t("legal.toc")}
                    />
                  </div>
                </aside>
              ) : null}

              <div className="min-w-0">
                {/* Lead intro */}
                <div
                  className={cn(
                    "mb-10 rounded-2xl border p-6 md:mb-12 md:p-8",
                    isTerms
                      ? "border-[var(--brand-gold)]/25 bg-gradient-to-br from-[var(--brand-gold)]/[0.07] to-transparent"
                      : "border-border-default bg-surface-elevated"
                  )}
                >
                  <p className="text-lg font-medium leading-relaxed text-foreground md:text-xl md:leading-relaxed">
                    {t(`${namespace}.intro`)}
                  </p>
                </div>

                {/* Mobile TOC */}
                {tocItems.length > 0 ? (
                  <details className="mb-8 rounded-2xl border border-border-default bg-surface-elevated p-4 lg:hidden">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                      {t("legal.toc")}
                    </summary>
                    <div className="mt-4 border-t border-border-default pt-4">
                      <LegalTableOfContents items={tocItems} activeId={activeSection} title="" />
                    </div>
                  </details>
                ) : null}

                {/* Sections */}
                <div className="space-y-6 md:space-y-8" data-animate="staggerChildren" data-stagger="0.08">
                  {sections.map((legalSection, index) => (
                    <article
                      key={sectionId(index)}
                      id={sectionId(index)}
                      className={cn(
                        "scroll-mt-28 rounded-2xl border border-border-default bg-surface-elevated p-6 shadow-sm transition-shadow hover:shadow-md md:p-8",
                        "border-l-[3px] border-l-[var(--brand-gold)]/60"
                      )}
                    >
                      <header className="mb-5 flex items-start gap-4 border-b border-border-default pb-5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-gold-muted)] text-sm font-bold text-[var(--brand-gold)]">
                          {index + 1}
                        </span>
                        <h2 className={cn("pt-1.5 text-xl font-bold leading-snug text-foreground md:text-2xl")}>
                          {legalSection.title}
                        </h2>
                      </header>

                      <div className="space-y-4 pl-0 md:pl-14">
                        {legalSection.paragraphs.map((paragraph, pIndex) => (
                          <p
                            key={pIndex}
                            className="text-base leading-[1.75] text-foreground-secondary"
                          >
                            {paragraph}
                          </p>
                        ))}

                        {legalSection.bullets && legalSection.bullets.length > 0 ? (
                          <ul className="space-y-3 pt-1">
                            {legalSection.bullets.map((item, bIndex) => (
                              <li
                                key={bIndex}
                                className="flex gap-3 text-base leading-relaxed text-foreground-secondary"
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-gold)]" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>

                {/* Related documents */}
                {relatedDocs.length > 0 ? (
                  <div className="mt-12 md:mt-16">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
                      {t("legal.related")}
                    </p>
                    <p className="mt-2 text-sm text-text-muted">{t("legal.relatedHint")}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {relatedDocs.map((doc) => {
                        const Icon = doc.icon;
                        const labelKey =
                          doc.namespace === "cookiesPolicy"
                            ? "footer.cookies"
                            : doc.namespace === "terms"
                              ? "footer.terms"
                              : doc.namespace === "privacy"
                                ? "footer.privacy"
                                : "footer.imprint";
                        return (
                          <Link
                            key={doc.href}
                            href={doc.href}
                            className="group flex items-center justify-between gap-3 rounded-xl border border-border-default bg-surface-elevated px-5 py-4 transition-all hover:border-[var(--brand-gold)]/40 hover:shadow-md"
                          >
                            <span className="flex items-center gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-gold-muted)]">
                                <Icon className="h-4 w-4 text-[var(--brand-gold)]" />
                              </span>
                              <span className="text-sm font-semibold text-foreground">{t(labelKey)}</span>
                            </span>
                            <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--brand-gold)]" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Contact CTA */}
                <div
                  className={cn(
                    "mt-10 overflow-hidden rounded-2xl border md:mt-12",
                    mt.isDark
                      ? "border-[var(--brand-gold)]/25 bg-gradient-to-br from-[var(--brand-gold)]/10 to-transparent"
                      : "border-[var(--brand-gold)]/30 bg-gradient-to-br from-[#0D1B2A] to-[#132942] text-white"
                  )}
                >
                  <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          mt.isDark ? "text-foreground" : "text-white"
                        )}
                      >
                        {t(`${namespace}.contactTitle`)}
                      </p>
                      <p
                        className={cn(
                          "mt-2 max-w-lg text-sm leading-relaxed",
                          mt.isDark ? "text-foreground-secondary" : "text-on-navy-muted"
                        )}
                      >
                        {t(`${namespace}.contactNote`)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
                      {namespace === "cookiesPolicy" ? (
                        <OpenCookieSettingsButton variant="button" className="w-full sm:w-auto" />
                      ) : null}
                      <Button variant="gold" size="md" href="/contact" className="w-full sm:w-auto">
                        <Mail className="h-4 w-4" />
                        {t(`${namespace}.contactCta`)}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
