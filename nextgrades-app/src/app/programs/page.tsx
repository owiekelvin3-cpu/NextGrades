"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  UserRound,
  Calendar,
  Star,
  CheckCircle2,
  ArrowRight,
  Hexagon,
  BookOpen,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useCmsImages } from "@/hooks/useCmsImage";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { PROGRAMS_HERO_IMAGE, PROGRAMS_PAGE_CARD_IMAGES } from "@/lib/marketing-images";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { MarketingHeroMobileImage } from "@/components/marketing/MarketingHeroMobileImage";
import { hero, type } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

const statIcons = [GraduationCap, UserRound, Star];
const heroFeatureIcons = [Hexagon, BookOpen, Sparkles];

type ProgramItem = {
  type: string;
  title: string;
  description: string;
  features: string[];
  price: string;
};

type CompareRow = {
  label: string;
  c1: string | boolean;
  c2: string | boolean;
  c3: string | boolean;
  c4?: string | boolean;
};

function CompareCell({ value }: { value: string | boolean }) {
  if (value === true) {
    return <CheckCircle2 className="mx-auto h-5 w-5 text-[var(--brand-gold)]" />;
  }
  return <span className="text-sm text-[var(--foreground-secondary)]">{value}</span>;
}

export default function ProgramsPage() {
  const mt = useMarketingTheme();
  const { t } = useTranslation();
  const { getImage } = useCmsImages();
  const programsHeroImage = getImage("cmsImages.programs.hero", PROGRAMS_HERO_IMAGE);
  const programCardImages = PROGRAMS_PAGE_CARD_IMAGES.map((url, i) =>
    getImage(`cmsImages.programs.card.${i}`, url)
  );
  const heroFeatures = useLocalizedContent<{ title: string; desc: string }[]>("programsPage.heroFeatures");
  const stats = useLocalizedContent<{ number: string; label: string }[]>("programsPage.stats");
  const programs = useLocalizedContent<ProgramItem[]>("programsPage.items");
  const compareRows = useLocalizedContent<CompareRow[]>("programsPage.compareRows");
  const ctaTags = useLocalizedContent<string[]>("programsPage.ctaTags");
  const compareHeadersRaw = useLocalizedContent<{
    features: string;
    oneOnOne: string;
    group: string;
    library?: string;
    math: string;
  }>("programsPage.compareHeaders");
  const compareHeaders =
    compareHeadersRaw && typeof compareHeadersRaw === "object" && "features" in compareHeadersRaw
      ? compareHeadersRaw
      : { features: "Merkmale", oneOnOne: "1:1 Premium", group: "Lerngruppe", library: "Lernbibliothek", math: "Mathe Matura" };

  const safePrograms = Array.isArray(programs) ? programs : [];
  const safeStats = Array.isArray(stats) ? stats : [];
  const safeHeroFeatures = Array.isArray(heroFeatures) ? heroFeatures : [];
  const safeCompareRows = Array.isArray(compareRows) ? compareRows : [];
  const safeCtaTags = Array.isArray(ctaTags) ? ctaTags : [];

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
            priority
          />
          <div className={hero.inner}>
            <div className="grid min-w-0 items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="hero-enter min-w-0 max-w-xl">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37] sm:text-sm">
                  {t("programsPage.heroEyebrow")}
                </p>
                <h1 className={cn(type.h1, "mb-6")}>
                  {t("programs.title")}
                </h1>
                <p className="mb-8 max-w-lg text-base leading-relaxed text-on-navy-muted sm:text-lg">
                  {t("programsPage.heroSubtitle")}
                </p>
                <ul className="mb-8 flex flex-wrap gap-2.5 sm:gap-3">
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
              <MarketingHeroMobileImage src={programsHeroImage} alt={t("images.studentStudying")} priority />
            </div>
          </div>
        </section>

        <section className="-mt-6 pb-2 md:-mt-8">
          <div className="mx-auto max-w-5xl px-4">
            <Card className={cn("rounded-2xl border p-4 shadow-xl sm:p-6", mt.card)}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-7">
                {safeStats.map((stat, index) => {
                  const Icon = statIcons[index];
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-subtle)]">
                        <Icon className="h-5 w-5 text-[var(--brand-gold)]" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-[var(--foreground)]">{stat.number}</p>
                        <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </section>

        <section className={cn("py-14 md:py-16", mt.sectionAlt)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
                {t("programsPage.sectionEyebrow")}
              </p>
              <h2 className="mb-2 text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
                {t("programsPage.sectionTitle")}
              </h2>
              <p className="mx-auto max-w-2xl text-[var(--text-muted)]">{t("programsPage.sectionDesc")}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {safePrograms.map((program, index) => {
                const featured = index === 3;
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

        <section className={cn("py-14 md:py-16", mt.section)}>
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-8 text-center text-3xl font-bold text-[var(--foreground)]">
              {t("programsPage.compareTitle")}
            </h2>
            <div className={cn("responsive-table-wrap rounded-xl border", mt.tableWrap)}>
              <table className="w-full min-w-[760px] text-sm">
                <thead className={mt.tableHead}>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold sm:px-6 sm:py-4 sm:text-sm">{compareHeaders.features}</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold sm:px-6 sm:py-4 sm:text-sm">{compareHeaders.oneOnOne}</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold sm:px-6 sm:py-4 sm:text-sm">{compareHeaders.group}</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold sm:px-6 sm:py-4 sm:text-sm">{compareHeaders.library ?? "Lernbibliothek"}</th>
                    <th className="bg-[#D4AF37]/10 px-3 py-3 text-center text-xs font-semibold text-[#D4AF37] sm:px-6 sm:py-4 sm:text-sm">
                      {compareHeaders.math}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {safeCompareRows.map((row, index) => (
                    <tr key={index} className="hover:bg-[var(--table-row-hover)]">
                      <td className="px-3 py-3 text-xs font-medium text-[var(--foreground-secondary)] sm:px-6 sm:py-4 sm:text-sm">
                        {row.label}
                      </td>
                      <td className="px-3 py-3 text-center sm:px-6 sm:py-4">
                        <CompareCell value={row.c1} />
                      </td>
                      <td className="px-3 py-3 text-center sm:px-6 sm:py-4">
                        <CompareCell value={row.c2} />
                      </td>
                      <td className="px-3 py-3 text-center sm:px-6 sm:py-4">
                        <CompareCell value={row.c3} />
                      </td>
                      <td className="bg-[var(--brand-gold-muted)] px-3 py-3 text-center sm:px-6 sm:py-4">
                        <CompareCell value={row.c4 ?? false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className={cn("pb-14 pt-4", mt.sectionAlt)}>
          <div className="mx-auto max-w-6xl px-4">
            <Card className={cn("rounded-2xl border p-5 sm:p-8", mt.card)}>
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div className="flex items-center gap-4 sm:gap-6">
                  <Calendar className="h-14 w-14 text-[var(--brand-gold)]" />
                  <div>
                    <h3 className="mb-2 text-2xl font-bold text-[var(--foreground)]">{t("programsPage.ctaTitle")}</h3>
                    <p className="text-[var(--text-muted)]">{t("programsPage.ctaDesc")}</p>
                    <div className="mt-4 flex flex-wrap gap-4">
                      {safeCtaTags.map((tag, i) => (
                        <span key={i} className="flex items-center gap-2 text-xs text-[var(--foreground-secondary)]">
                          <CheckCircle2 className="h-4 w-4 text-[var(--brand-gold)]" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button variant="gold" size="lg" className="w-full sm:w-auto" href="/consultation">
                  {t("programsPage.ctaButton")} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
