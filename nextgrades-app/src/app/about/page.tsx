"use client";

import Link from "next/link";
import {
  Target,
  Eye,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  FileText,
  Users,
  TrendingUp,
  User,
  Heart,
  Quote,
  Smile,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useCmsImages, useMarketingHeroImage } from "@/hooks/useCmsImage";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { MarketingHeroMobileImage } from "@/components/marketing/MarketingHeroMobileImage";
import { MockupFeatureStrip } from "@/components/mockup/MockupFeatureStrip";
import { SectionHeader } from "@/components/premium/SectionHeader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { hero, section, type } from "@/lib/premium/tokens";
import { ABOUT_IMAGES, SHARED_PAGE_HERO_IMAGE } from "@/lib/marketing-images";
import { consultationCheckoutHref } from "@/lib/checkout/catalog-context";

const PILLAR_ICONS = [Target, Eye, Sparkles];
const FEATURE_ICONS = [GraduationCap, Target, Users, Sparkles];
const PRINCIPLE_ICONS = [User, GraduationCap, BookOpen, TrendingUp, Heart];
const MISSION_ICONS = [BookOpen, FileText, Users, TrendingUp];
const STAT_ICONS = [Smile, GraduationCap, TrendingUp, Heart];

export default function AboutPage() {
  const mt = useMarketingTheme();
  const { t } = useTranslation();
  const { getImage } = useCmsImages();

  const heroImage = useMarketingHeroImage();
  const storyImage = getImage("cmsImages.about.story", ABOUT_IMAGES.story);
  const promiseImage = getImage("cmsImages.about.promise", ABOUT_IMAGES.promise);
  const missionImages = ABOUT_IMAGES.mission.map((url, i) =>
    getImage(`cmsImages.about.mission.${i}`, url)
  );

  const pillars = useLocalizedContent<{ title: string; desc: string }[]>("aboutPage.heroPillars");
  const heroFeatures = useLocalizedContent<{ title: string; desc: string }[]>("aboutPage.heroFeatures");
  const storyParagraphs = useLocalizedContent<string[]>("aboutPage.storyParagraphs");
  const missionCards = useLocalizedContent<{ title: string; desc: string }[]>("aboutPage.missionCards");
  const principles = useLocalizedContent<{ title: string; desc: string }[]>("aboutPage.principles");
  const promiseItems = useLocalizedContent<string[]>("aboutPage.promiseItems");
  const stats = useLocalizedContent<{ value: string; label: string }[]>("aboutPage.stats");
  const communityTags = useLocalizedContent<string[]>("aboutPage.communityTags");

  const safePillars = Array.isArray(pillars) ? pillars : [];
  const safeFeatures = Array.isArray(heroFeatures) ? heroFeatures : [];
  const safeStory = Array.isArray(storyParagraphs) ? storyParagraphs : [];
  const safeMission = Array.isArray(missionCards) ? missionCards : [];
  const safePrinciples = Array.isArray(principles) ? principles : [];
  const safePromise = Array.isArray(promiseItems) ? promiseItems : [];
  const safeStats = Array.isArray(stats) ? stats : [];
  const safeTags = Array.isArray(communityTags) ? communityTags : [];

  const featureStripItems = safeFeatures.map((feat, i) => ({
    ...feat,
    icon: FEATURE_ICONS[i] ?? GraduationCap,
  }));

  const titleHighlight = t("about.heroTitleHighlight");
  const titleTail = t("about.heroTitle2");

  const cardClass = cn(
    "rounded-2xl border transition-shadow hover:shadow-lg",
    mt.isDark ? "border-white/10 bg-[#112240] hover:shadow-black/30" : "border-gray-100 bg-white hover:shadow-gray-200/80"
  );

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero — same shell as Programmes / Subjects / Home */}
        <section className={cn("relative bg-[#0D1B2A] text-white", hero.section)}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.15),transparent_45%)]" />
          <MarketingHeroBlend
            src={heroImage}
            alt={t("images.studentsCollaborating")}
            variant="dark-split-right"
            backgroundColor="#0D1B2A"
            fallbackSrc={SHARED_PAGE_HERO_IMAGE}
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
          />

          <div className={hero.inner}>
            <div className="grid min-h-0 min-w-0 flex-1 items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="relative z-10 min-w-0 max-w-xl" data-animate="hero-headline">
                <p className={cn(type.eyebrow, "mb-4 sm:mb-5")}>{t("aboutPage.heroEyebrow")}</p>
                <h1 className={type.h1} data-animate="hero-headline" data-animate-delay="0.1">
                  {t("about.heroTitle")}{" "}
                  {titleHighlight ? <span className="text-[#D4AF37]">{titleHighlight}</span> : null}
                  {titleTail ? <> {titleTail}</> : null}
                </h1>
                <p
                  className="mt-5 max-w-lg text-base leading-relaxed text-on-navy-muted sm:mt-6 sm:text-lg md:text-xl"
                  data-animate="hero-subheadline"
                >
                  {t("about.heroSubtitle")}
                </p>
              </div>

              <div className="relative z-10 max-w-xl lg:max-w-none" data-animate="hero-image">
                <MarketingHeroMobileImage
                  src={heroImage}
                  fallbackSrc={SHARED_PAGE_HERO_IMAGE}
                  alt={t("images.studentsCollaborating")}
                  priority
                  className="max-w-xl lg:max-w-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission / Vision / Values — premium band overlapping hero */}
        <section className="relative z-20 -mt-8 pb-2 md:-mt-12">
          <div className={section.container}>
            <div
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D1B2A]/95 shadow-[0_24px_64px_rgba(0,0,0,0.45)] backdrop-blur-md"
              data-animate="fadeUp"
            >
              <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(260px,320px)]">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:contents">
                  {safePillars.map((pillar, i) => {
                    const Icon = PILLAR_ICONS[i] ?? Target;
                    return (
                      <div
                        key={pillar.title}
                        className={cn(
                          "border-b border-white/10 p-6 sm:p-8 lg:border-b-0",
                          i < safePillars.length - 1 && "sm:border-r sm:border-white/10 lg:border-r lg:border-white/10"
                        )}
                      >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4AF37]/12 ring-1 ring-[#D4AF37]/25">
                          <Icon className="h-5 w-5 text-[#D4AF37]" strokeWidth={1.75} />
                        </div>
                        <p className="text-base font-bold text-white md:text-lg">{pillar.title}</p>
                        <p className="mt-2 text-sm leading-relaxed text-white/75">{pillar.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col justify-center border-t border-white/10 bg-[#0a1520]/70 p-6 sm:p-8 lg:border-t-0 lg:border-l lg:border-white/10">
                  <Quote className="mb-3 h-6 w-6 text-[#D4AF37]" aria-hidden />
                  <p className="text-sm italic leading-relaxed text-white/90 md:text-base">
                    &ldquo;{t("aboutPage.heroQuote")}&rdquo;
                  </p>
                  <p className="mt-3 text-xs font-medium text-[#D4AF37]/85">— {t("aboutPage.heroQuoteAuthor")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {featureStripItems.length > 0 && <MockupFeatureStrip items={featureStripItems} columns={4} />}

        {/* Story */}
        <section className={cn("py-14 lg:py-24", mt.sectionAlt)}>
          <div className={section.container}>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div data-animate="slideInLeft">
                <p className={cn(type.eyebrow, "mb-3")}>{t("aboutPage.storyEyebrow")}</p>
                <h2 className={cn(type.h2, mt.heading)}>{t("aboutPage.storyTitle")}</h2>
                <div className="mt-6 space-y-4">
                  {safeStory.map((para, i) => (
                    <p key={i} className={cn("whitespace-pre-line leading-relaxed", mt.body)}>
                      {para}
                    </p>
                  ))}
                </div>
                <Link href="/programs">
                  <Button variant="dark" size="md" className="mt-8">
                    {t("aboutPage.storyCta")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div data-animate="slideInRight" className="overflow-hidden rounded-2xl shadow-xl">
                <MarketingImage
                  src={storyImage}
                  alt={t("images.modernLearning")}
                  containerClassName="h-80 w-full lg:h-[420px]"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission detail */}
        <section className={cn("py-20 lg:py-24", mt.section)}>
          <div className={section.container}>
            <SectionHeader
              eyebrow={t("aboutPage.missionEyebrow")}
              title={t("aboutPage.missionTitle")}
              align="center"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" data-animate="staggerChildren" data-stagger="0.12">
              {safeMission.map((card, i) => {
                const Icon = MISSION_ICONS[i] ?? BookOpen;
                return (
                  <div key={card.title} className={cn(cardClass, "overflow-hidden")}>
                    <div className="flex h-14 items-center justify-center bg-[#D4AF37]/10">
                      <Icon className="h-6 w-6 text-[#D4AF37]" />
                    </div>
                    <div className="h-36 overflow-hidden">
                      <MarketingImage
                        src={missionImages[i] ?? missionImages[0]}
                        alt=""
                        containerClassName="h-full w-full"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className={cn("font-bold", mt.heading)}>{card.title}</h3>
                      <p className={cn("mt-2 text-sm leading-relaxed", mt.body)}>{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className={cn("py-14 lg:py-24", mt.sectionAlt)}>
          <div className={section.container}>
            <SectionHeader
              eyebrow={t("aboutPage.principlesEyebrow")}
              title={t("aboutPage.principlesTitle")}
              align="center"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5" data-animate="staggerChildren" data-stagger="0.1">
              {safePrinciples.map((item, i) => {
                const Icon = PRINCIPLE_ICONS[i] ?? Heart;
                return (
                  <div key={item.title} className={cn(cardClass, "p-6 text-center")}>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#D4AF37]/30 bg-[#D4AF37]/10">
                      <Icon className="h-6 w-6 text-[#D4AF37]" />
                    </div>
                    <h3 className={cn("text-sm font-bold", mt.heading)}>{item.title}</h3>
                    <p className={cn("mt-2 text-xs leading-relaxed", mt.body)}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Promise */}
        <section className="bg-[#0D1B2A] py-20 text-white lg:py-24">
          <div className={section.container}>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div data-animate="slideInLeft" className="overflow-hidden rounded-2xl shadow-2xl">
                <MarketingImage
                  src={promiseImage}
                  alt={t("images.nextGradesLearning")}
                  containerClassName="h-80 w-full lg:h-[440px]"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
              <div data-animate="slideInRight">
                <p className={cn(type.eyebrow, "mb-3")}>{t("aboutPage.promiseEyebrow")}</p>
                <h2 className={type.h2}>{t("aboutPage.promiseTitle")}</h2>
                <ul className="mt-8 space-y-4">
                  {safePromise.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />
                      <span className="text-on-navy-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className={cn("py-14 lg:py-24", mt.sectionAlt)}>
          <div className={section.container}>
            <SectionHeader
              eyebrow={t("aboutPage.statsEyebrow")}
              title={t("aboutPage.statsTitle")}
              align="center"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {safeStats.map((stat, i) => {
                const Icon = STAT_ICONS[i] ?? Smile;
                return (
                  <div key={stat.label} className={cn(cardClass, "p-8 text-center")}>
                    <Icon className="mx-auto mb-4 h-8 w-8 text-[#D4AF37]" />
                    <p className={cn("text-4xl font-extrabold tracking-tight", mt.heading)}>{stat.value}</p>
                    <p className={cn("mt-2 text-sm", mt.muted)}>{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 md:py-16">
          <div className={section.container}>
            <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1B2A] via-[#132942] to-[#1a3555] p-8 shadow-2xl sm:p-12">
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
                <div className="flex items-center gap-6">
                  <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 sm:flex">
                    <GraduationCap className="h-10 w-10 text-[#D4AF37]" />
                  </div>
                  <div className="text-center lg:text-left">
                    <h2 className="text-2xl font-bold text-white md:text-3xl">{t("aboutPage.communityTitle")}</h2>
                    <p className="mt-2 max-w-lg text-on-navy-muted">{t("aboutPage.communityDesc")}</p>
                  </div>
                </div>
                <Button
                  variant="gold"
                  size="xl"
                  href={consultationCheckoutHref()}
                  className="w-full shrink-0 rounded-xl py-4 text-base font-semibold lg:w-auto"
                >
                  {t("aboutPage.communityCta")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-6 border-t border-white/10 pt-8 lg:justify-start">
                {safeTags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                    <span className="text-sm font-medium text-white">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
