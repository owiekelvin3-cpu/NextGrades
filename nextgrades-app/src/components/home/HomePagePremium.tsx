"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  GraduationCap,
  FileText,
  Star,
  UserRound,
  Users,
  Monitor,
  ListChecks,
  Clock,
} from "lucide-react";
import { useCmsImages } from "@/hooks/useCmsImage";
import { useHomeCms } from "@/hooks/useHomeCms";
import {
  PROGRAM_CARD_IMAGES,
  HOME_PLATFORM_THUMB,
  HOME_HERO_STUDENT_IMAGE,
} from "@/lib/marketing-images";
import { HomeHero } from "@/components/premium/HomeHero";
import { MockupFeatureStrip } from "@/components/mockup/MockupFeatureStrip";
import { MockupStatsBar } from "@/components/mockup/MockupStatsBar";
import { SectionHeader } from "@/components/premium/SectionHeader";
import { ProgrammeOfferCard } from "@/components/premium/ProgrammeOfferCard";
import { PlatformShowcase } from "@/components/premium/PlatformShowcase";
import { TestimonialPremium, type TestimonialData } from "@/components/premium/TestimonialPremium";
import { CTABand } from "@/components/premium/CTABand";
import { section } from "@/lib/premium/tokens";

const STAT_ICONS = [GraduationCap, UserRound, FileText, Star];
const FEATURE_ICONS = [Users, Users, Monitor, ListChecks, Clock];

type ProgramItem = {
  title: string;
  features: string[];
  price?: string;
};

export function HomePagePremium() {
  const { t, i18n } = useTranslation();
  const { getImage } = useCmsImages();
  const { testimonials: cmsTestimonials } = useHomeCms();

  const heroImage = getImage("cmsImages.home.heroStudent", HOME_HERO_STUDENT_IMAGE);
  const platformImage = getImage("cmsImages.home.platformThumb", HOME_PLATFORM_THUMB);
  const programCardImages = PROGRAM_CARD_IMAGES.map((url, i) =>
    getImage(`cmsImages.home.programCard.${i}`, url)
  );

  const stats = useMemo(() => {
    const data = t("home.stats", { returnObjects: true });
    return Array.isArray(data) ? (data as { number: string; label: string }[]) : [];
  }, [t, i18n.language]);

  const featureItems = useMemo(() => {
    const data = t("home.features", { returnObjects: true });
    const all = Array.isArray(data) ? (data as { title: string; desc: string }[]) : [];
    return all.slice(0, 5).map((item, i) => ({
      ...item,
      icon: FEATURE_ICONS[i] ?? Users,
    }));
  }, [t, i18n.language]);

  const programs = useMemo(() => {
    const data = t("home.programsSection.items", { returnObjects: true });
    return Array.isArray(data) ? (data as ProgramItem[]) : [];
  }, [t, i18n.language]);

  const platformFeatures = useMemo(() => {
    const data = t("home.platform.features", { returnObjects: true });
    return Array.isArray(data) ? (data as { title: string; desc: string }[]) : [];
  }, [t, i18n.language]);

  const localeTestimonials = useMemo(() => {
    const data = t("home.testimonials.items", { returnObjects: true });
    return Array.isArray(data)
      ? (data as { quote: string; name: string; role?: string; school?: string }[])
      : [];
  }, [t, i18n.language]);

  const testimonials: TestimonialData[] = useMemo(() => {
    if (cmsTestimonials.length > 0) {
      return cmsTestimonials.slice(0, 3).map((item) => ({
        quote: item.content,
        name: item.name,
        role: item.role ?? undefined,
      }));
    }
    return localeTestimonials.map((item) => ({
      quote: item.quote,
      name: item.name,
      role: item.role,
      school: item.school,
    }));
  }, [cmsTestimonials, localeTestimonials]);

  const statItems = stats.map((stat, i) => ({
    number: stat.number,
    label: stat.label,
    icon: STAT_ICONS[i] ?? Star,
  }));

  return (
    <main className="flex-1 overflow-x-hidden bg-background">
      <HomeHero
        eyebrow={t("home.heroEyebrow")}
        title={t("home.heroTitle")}
        titleHighlight={t("home.heroTitleHighlight")}
        subtitle={t("home.heroSubtitle")}
        primaryCta={t("home.freeConsultation")}
        secondaryCta={t("home.explorePrograms")}
        heroImage={heroImage}
      />

      {featureItems.length > 0 && <MockupFeatureStrip items={featureItems} columns={5} />}

      <section className={`${section.py} bg-white`}>
        <div className={section.container}>
          <SectionHeader
            eyebrow={t("home.programsSection.eyebrow")}
            title={t("home.programsSection.title")}
            subtitle={t("home.programsSection.subtitle")}
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8 xl:grid-cols-4">
            {programs.map((program, index) => (
              <ProgrammeOfferCard
                key={program.title}
                title={program.title}
                features={program.features}
                image={programCardImages[index] ?? programCardImages[0]}
                fallbackImage={PROGRAM_CARD_IMAGES[index] ?? PROGRAM_CARD_IMAGES[0]}
                href="/programs"
                price={program.price}
                badge={index === 2 ? t("home.mostPopular") : undefined}
                featured={index === 2}
                ctaLabel={t("home.learnMore")}
              />
            ))}
          </div>
          <div className="mt-10 text-center md:mt-12">
            <Link
              href="/programs"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#0D1B2A]/15 bg-white px-8 py-4 text-base font-semibold text-[#0D1B2A] shadow-sm transition hover:border-[#D4AF37]/40 hover:shadow-md md:w-auto md:min-h-[48px] md:py-3 md:text-sm"
            >
              {t("home.viewAllPrograms")}
            </Link>
          </div>
        </div>
      </section>

      {statItems.length > 0 && <MockupStatsBar stats={statItems} />}

      <PlatformShowcase
        eyebrow={t("home.platform.eyebrow")}
        title={t("home.platform.title")}
        subtitle={t("home.platform.subtitle")}
        features={platformFeatures}
        image={platformImage}
        fallbackImage={HOME_PLATFORM_THUMB}
        cta={t("home.platform.discover")}
        ctaHref="/resources"
      />

      <TestimonialPremium items={testimonials} title={t("home.testimonials.title")} />

      <CTABand
        title={t("home.cta.title")}
        subtitle={t("home.cta.subtitle")}
        button={t("home.cta.button")}
        secondaryButton={t("home.explorePrograms")}
        secondaryHref="/programs"
      />
    </main>
  );
}
