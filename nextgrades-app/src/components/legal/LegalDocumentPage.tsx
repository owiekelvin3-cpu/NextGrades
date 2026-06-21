"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Mail, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";
import { hero } from "@/lib/premium/tokens";
import { OpenCookieSettingsButton } from "@/components/cookies/OpenCookieSettingsButton";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { useCmsImage } from "@/hooks/useCmsImage";
import { PRIVACY_HERO_IMAGE } from "@/lib/marketing-images";

type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type LegalDocumentPageProps = {
  namespace: "terms" | "privacy" | "cookiesPolicy" | "imprint";
};

export function LegalDocumentPage({ namespace }: LegalDocumentPageProps) {
  const mt = useMarketingTheme();
  const { t, i18n } = useTranslation();
  const privacyHeroImage = useCmsImage("cmsImages.privacy.hero", PRIVACY_HERO_IMAGE);
  const showPrivacyHero = namespace === "privacy";

  const sections = useMemo(() => {
    const data = t(`${namespace}.sections`, { returnObjects: true });
    return Array.isArray(data) ? (data as LegalSection[]) : [];
  }, [t, i18n.language, namespace]);

  return (
    <div className={cn("min-h-screen flex flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section
          className={cn(
            hero.section,
            "border-b",
            showPrivacyHero
              ? "border-white/10 bg-[#0D1B2A] text-white"
              : mt.isDark
                ? "border-white/10 bg-[#112240]"
                : "border-gray-100 bg-[#F5F6F8]"
          )}
        >
          {showPrivacyHero && (
            <MarketingHeroBlend
              src={privacyHeroImage}
              alt=""
              variant="light-split-right"
              backgroundColor="#F5F6F8"
              priority
            />
          )}
          <div className={hero.innerCentered}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
              <FileText className="h-3.5 w-3.5" />
              {t(`${namespace}.eyebrow`)}
            </div>
            <h1
              className={cn(
                "text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl",
                showPrivacyHero ? "text-[#0D1B2A]" : mt.heading
              )}
            >
              {t(`${namespace}.title`)}
            </h1>
            <p className={cn("mt-4 text-lg", showPrivacyHero ? "text-gray-600" : mt.body)}>
              {t(`${namespace}.subtitle`)}
            </p>
            <p className={cn("mt-3 text-sm", showPrivacyHero ? "text-gray-500" : mt.muted)}>
              {t(`${namespace}.lastUpdated`)}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <p className={cn("mb-10 text-base leading-relaxed", mt.body)}>{t(`${namespace}.intro`)}</p>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <article
                  key={index}
                  className={cn("rounded-2xl border p-6 sm:p-8", mt.card)}
                >
                  <div className="mb-4 flex items-start gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-sm font-bold text-[#D4AF37]">
                      {index + 1}
                    </span>
                    <h2 className={cn("pt-1 text-lg font-bold leading-snug sm:text-xl", mt.heading)}>
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-4 sm:ml-13">
                    {section.paragraphs.map((paragraph, pIndex) => (
                      <p key={pIndex} className={cn("text-sm leading-relaxed sm:text-base", mt.body)}>
                        {paragraph}
                      </p>
                    ))}

                    {section.bullets && section.bullets.length > 0 && (
                      <ul className={cn("list-disc space-y-2 pl-5 text-sm sm:text-base", mt.body)}>
                        {section.bullets.map((item, bIndex) => (
                          <li key={bIndex}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Contact CTA */}
            <div
              className={cn(
                "mt-12 rounded-2xl border p-6 sm:flex sm:items-center sm:justify-between sm:gap-6",
                mt.isDark ? "border-[#D4AF37]/20 bg-[#D4AF37]/5" : "border-[#D4AF37]/30 bg-amber-50/80"
              )}
            >
              <div>
                <p className={cn("font-semibold", mt.heading)}>{t(`${namespace}.contactTitle`)}</p>
                <p className={cn("mt-1 text-sm", mt.body)}>{t(`${namespace}.contactNote`)}</p>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:flex-wrap sm:items-center">
                {namespace === "cookiesPolicy" ? (
                  <OpenCookieSettingsButton variant="button" className="w-full sm:w-auto" />
                ) : null}
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-[#0D1B2A] transition-opacity hover:opacity-90"
                >
                  <Mail className="h-4 w-4" />
                  {t(`${namespace}.contactCta`)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
