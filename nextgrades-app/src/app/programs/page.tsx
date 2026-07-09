"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  UserRound,
  Star,
  CheckCircle2,
  ArrowRight,
  Hexagon,
  BookOpen,
  GraduationCap,
  Sparkles,
  FileText,
  Heart,
  Users,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useCmsImages } from "@/hooks/useCmsImage";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { PROGRAMS_PAGE_CARD_IMAGES, SHARED_PAGE_HERO_IMAGE } from "@/lib/marketing-images";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { MarketingHeroMobileImage } from "@/components/marketing/MarketingHeroMobileImage";
import {
  ProgramCompareTable,
  type ProgramCompareRow,
  type ProgramCompareHeaders,
} from "@/components/programs/ProgramCompareTable";
import { hero, type, section } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

const statIcons = [UserRound, GraduationCap, FileText, Star];
const heroFeatureIcons = [Hexagon, BookOpen, Sparkles];
const parentsTrustIcons = [Heart, Users, BookOpen, TrendingUp];

type ProgramItem = {
  type: string;
  title: string;
  description: string;
  features: string[];
  price: string;
};

export default function ProgramsPage() {
  const mt = useMarketingTheme();
  const { t } = useTranslation();
  const { getImage, marketingHeroImage: programsHeroImage } = useCmsImages();
  const programCardImages = PROGRAMS_PAGE_CARD_IMAGES.map((url, i) =>
    getImage(`cmsImages.programs.card.${i}`, url)
  );
  const heroFeatures = useLocalizedContent<{ title: string; desc: string }[]>("programsPage.heroFeatures");
  const stats = useLocalizedContent<{ number: string; label: string }[]>("programsPage.stats");
  const programs = useLocalizedContent<ProgramItem[]>("programsPage.items");
  const compareRows = useLocalizedContent<ProgramCompareRow[]>("programsPage.compareRows");
  const ctaTags = useLocalizedContent<string[]>("programsPage.ctaTags");
  const compareHeadersRaw = useLocalizedContent<ProgramCompareHeaders>("programsPage.compareHeaders");
  const compareHeaders: ProgramCompareHeaders =
    compareHeadersRaw && typeof compareHeadersRaw === "object" && "features" in compareHeadersRaw
      ? compareHeadersRaw
      : {
          features: "Merkmale",
          oneOnOne: "1:1 Premium",
          group: "Lerngruppe",
          library: "Lernbibliothek",
          math: "Mathematik Matura Komplettpaket",
        };

  const safePrograms = Array.isArray(programs) ? programs : [];
  const safeStats = Array.isArray(stats) ? stats : [];
  const safeHeroFeatures = Array.isArray(heroFeatures) ? heroFeatures : [];
  const safeCompareRows = Array.isArray(compareRows) ? compareRows : [];
  const ctaParentsItems = useLocalizedContent<string[]>("programsPage.ctaParentsItems");
  const safeCtaTags = Array.isArray(ctaTags) ? ctaTags : [];
  const safeCtaParentsItems = Array.isArray(ctaParentsItems) ? ctaParentsItems : [];

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        <section className={cn("bg-[#0D1B2A] text-white", hero.section)}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.15),transparent_45%)]" />
          <MarketingHeroBlend
            src={programsHeroImage}
            alt={t("images.studentStudying")}
            variant="dark-split-right"
            fallbackSrc={SHARED_PAGE_HERO_IMAGE}
            priority
          />
          <div className={hero.inner}>
            <div className="grid min-h-0 min-w-0 flex-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="hero-enter min-w-0 max-w-xl">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37] sm:text-sm" data-animate="hero-headline">
                  {t("programsPage.heroEyebrow")}
                </p>
                <h1 className={cn(type.h1, "mb-4")} data-animate="hero-headline" data-animate-delay="0.1">
                  {t("programs.title")}
                </h1>
                <p className="mb-8 max-w-lg text-base leading-relaxed text-on-navy-muted sm:text-lg" data-animate="hero-subheadline">
                  {t("programs.subtitle")}
                </p>
                <ul className="mb-8 flex flex-wrap gap-2.5 sm:gap-3" data-animate="hero-cta">
                  {safeHeroFeatures.slice(0, 3).map((feature, index) => {
                    const Icon = heroFeatureIcons[index] ?? Hexagon;
                    return (
                      <li key={index}>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-white/90">
                          <Icon className="h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden />
                          {feature.title}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <Button variant="gold" size="md" className="w-full px-8 sm:w-auto" href="/consultation">
                  {t("programsPage.freeConsultation")}
                </Button>
              </div>
              <div data-animate="hero-image">
                <MarketingHeroMobileImage src={programsHeroImage} fallbackSrc={SHARED_PAGE_HERO_IMAGE} alt={t("images.studentStudying")} priority />
              </div>
            </div>
          </div>
        </section>

        <section className="-mt-6 pb-2 md:-mt-8">
          <div className={section.container}>
            <Card className={cn("rounded-2xl border p-4 shadow-xl sm:p-6", mt.card)}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                {safeStats.map((stat, index) => {
                  const Icon = statIcons[index];
                  return (
                    <div key={index} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-subtle)] sm:h-11 sm:w-11">
                        <Icon className="h-5 w-5 text-[var(--brand-gold)]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">{stat.number}</p>
                        <p className="text-xs text-[var(--text-muted)] sm:text-sm">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </section>

        <section className={cn("py-14 md:py-16", mt.sectionAlt)}>
          <div className={section.container}>
            <div className="mb-10 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
                {t("programsPage.sectionEyebrow")}
              </p>
              <h2 className="mb-2 text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
                {t("programsPage.sectionTitle")}
              </h2>
              <p className="mx-auto max-w-2xl text-[var(--text-muted)]">{t("programsPage.sectionDesc")}</p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-4" data-animate="staggerChildren" data-stagger="0.15">
              {safePrograms.map((program, index) => {
                const featured = index === 2;
                return (
                  <Card
                    key={program.title}
                    className={cn(
                      "relative flex h-full flex-col overflow-hidden rounded-2xl border",
                      featured ? "border-2 border-[var(--brand-gold)] shadow-xl" : "border-border-default"
                    )}
                  >
                    {featured && (
                      <div className="absolute right-3 top-3 z-10">
                        <Badge className="bg-[#D4AF37] text-[#0D1B2A] px-3 py-1 text-xs font-bold uppercase">
                          {t("programsPage.mostPopular")}
                        </Badge>
                      </div>
                    )}
                    <div className="relative h-44 overflow-hidden">
                      <Badge className="absolute left-3 top-3 z-10 bg-[#0D1B2A] px-3 py-1 text-xs text-white">
                        {program.type}
                      </Badge>
                      <MarketingImage
                        src={programCardImages[index]}
                        alt={program.title}
                        containerClassName="h-full w-full"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-2 text-[1.45rem] font-bold leading-tight text-[var(--foreground)]">
                        {program.title}
                      </h3>
                      <p className="mb-3 text-sm font-semibold text-[var(--brand-gold)]">{program.price}</p>
                      <p className="mb-5 text-[var(--text-muted)]">{program.description}</p>
                      <ul className="mb-7 flex-1 space-y-2.5">
                        {program.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[var(--brand-gold)]" />
                            <span className="text-sm text-[var(--foreground-secondary)]">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button variant={featured ? "gold" : "dark"} size="md" className="w-full rounded-lg" href="/pricing">
                        {t("programsPage.learnMore")} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <ProgramCompareTable
          title={t("programsPage.compareTitle")}
          headers={compareHeaders}
          rows={safeCompareRows}
          partialLabel={t("programsPage.comparePartial", { defaultValue: "Teilweise" })}
          includedLabel={t("programsPage.compareIncluded", { defaultValue: "Inklusive" })}
          excludedLabel={t("programsPage.compareExcluded", { defaultValue: "Nicht enthalten" })}
          scrollHint={`← ${t("marketingNav.scrollHint", { defaultValue: "Scroll horizontally to compare" })} →`}
          className={mt.section}
        />

        <section className={cn("pb-14 pt-4", mt.sectionAlt)}>
          <div className={section.container}>
            <Card className={cn("rounded-2xl border p-5 sm:p-8 lg:p-10", mt.card)}>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-[var(--foreground)] md:text-3xl">
                    {t("programsPage.ctaTitle")}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)] md:text-base">
                    {t("programsPage.ctaDesc")}
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                    {safeCtaTags.map((tag, i) => (
                      <span key={i} className="flex items-center gap-2 text-xs text-[var(--foreground-secondary)] sm:text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--brand-gold)]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button variant="gold" size="lg" className="mt-6 w-full rounded-xl py-4 text-base font-semibold sm:w-auto" href="/consultation">
                    {t("programsPage.ctaButton")} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>

                {safeCtaParentsItems.length > 0 && (
                  <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-subtle)]/80 p-5 sm:p-6">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-gold)]">
                      {t("programsPage.ctaParentsTitle", { defaultValue: t("contact.sideTitle") })}
                    </p>
                    <ul className="space-y-3">
                      {safeCtaParentsItems.map((item, i) => {
                        const Icon = parentsTrustIcons[i] ?? CheckCircle2;
                        return (
                          <li key={item} className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gold-muted)]">
                              <Icon className="h-4 w-4 text-[var(--brand-gold)]" aria-hidden />
                            </span>
                            <span className="text-sm font-medium text-[var(--foreground)]">{item}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
