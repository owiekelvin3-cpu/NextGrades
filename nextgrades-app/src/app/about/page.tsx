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
import { useCmsImages } from "@/hooks/useCmsImage";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { MarketingHeroMobileImage } from "@/components/marketing/MarketingHeroMobileImage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { hero, section, type } from "@/lib/premium/tokens";
import {
  ABOUT_IMAGES,
} from "@/lib/marketing-images";

const PILLAR_ICONS = [Target, Eye, Sparkles];
const FEATURE_ICONS = [GraduationCap, Target, Users, Sparkles];
const PRINCIPLE_ICONS = [User, GraduationCap, BookOpen, TrendingUp, Heart];
const MISSION_ICONS = [BookOpen, FileText, Users, TrendingUp];
const STAT_ICONS = [Smile, GraduationCap, TrendingUp, Heart];

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]", className)}>
      {children}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
  mt,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  mt: ReturnType<typeof useMarketingTheme>;
}) {
  return (
    <div className={cn("mb-12", center && "text-center")} data-animate="fadeUp">
      {eyebrow && <Eyebrow className={cn("mb-3", center && "mx-auto")}>{eyebrow}</Eyebrow>}
      <h2 className={cn("text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl", mt.heading)}>{title}</h2>
      {subtitle && (
        <p className={cn("mt-3 max-w-2xl text-lg", mt.body, center && "mx-auto")}>{subtitle}</p>
      )}
    </div>
  );
}

export default function AboutPage() {
  const mt = useMarketingTheme();
  const { t } = useTranslation();
  const { getImage } = useCmsImages();

  const heroImage = getImage("cmsImages.about.hero", ABOUT_IMAGES.hero);
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

  const cardClass = cn(
    "rounded-2xl border transition-shadow hover:shadow-lg",
    mt.isDark ? "border-white/10 bg-[#112240] hover:shadow-black/30" : "border-gray-100 bg-white hover:shadow-gray-200/80"
  );

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero — always dark */}
        <section className={cn("bg-[#0D1B2A] text-white", hero.section)}>
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-1/4 top-0 h-[min(500px,100vw)] w-[min(500px,100vw)] rounded-full bg-[#D4AF37]/8 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 max-w-[80vw] rounded-full bg-[#4DA3FF]/8 blur-3xl" />
          </div>
          <MarketingHeroBlend
            src={heroImage}
            alt={t("images.studentsCollaborating")}
            variant="dark-split-right"
            priority
          />

          <div className={hero.inner}>
            <div className="grid min-w-0 items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div data-animate="hero-headline">
                <Eyebrow className="mb-4">{t("aboutPage.heroEyebrow")}</Eyebrow>
                <h1 className={type.h1} data-animate="hero-headline" data-animate-delay="0.1">
                  {t("about.heroTitle")}{" "}
                  <span className="text-[#D4AF37]">{t("about.heroTitleHighlight")}</span>{" "}
                  {t("about.heroTitle2")}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-on-navy-muted md:mt-6 md:text-xl" data-animate="hero-subheadline">
                  {t("about.heroSubtitle")}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {safePillars.map((pillar, i) => {
                    const Icon = PILLAR_ICONS[i] ?? Target;
                    return (
                      <div key={pillar.title} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                        <Icon className="mb-2 h-5 w-5 text-[#D4AF37]" />
                        <p className="text-sm font-bold">{pillar.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-on-navy-subtle">{pillar.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 hidden rounded-xl border border-white/10 bg-[#0D1B2A]/90 p-5 shadow-xl backdrop-blur-md lg:block">
                  <Quote className="mb-2 h-6 w-6 text-[#D4AF37]" />
                  <p className="text-sm italic leading-relaxed text-on-navy-muted">&ldquo;{t("aboutPage.heroQuote")}&rdquo;</p>
                  <p className="mt-2 text-xs text-on-navy-faint">— {t("aboutPage.heroQuoteAuthor")}</p>
                </div>
              </div>

              <div data-animate="hero-image">
                <MarketingHeroMobileImage src={heroImage} alt={t("images.studentsCollaborating")} priority />
              </div>
            </div>
          </div>

          {/* Feature bar */}
          <div className="relative mt-10 border-t border-white/10 bg-[#0a1520]/80 backdrop-blur-sm md:mt-14">
            <div className={cn(section.container, "grid grid-cols-1 gap-4 py-8 md:grid-cols-2 lg:grid-cols-4 md:gap-6")} data-animate="staggerChildren" data-stagger="0.12">
              {safeFeatures.map((feat, i) => {
                const Icon = FEATURE_ICONS[i] ?? GraduationCap;
                return (
                  <div key={feat.title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:border-0 md:bg-transparent md:p-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/15">
                      <Icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{feat.title}</p>
                      <p className="mt-0.5 text-xs text-on-navy-subtle">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className={cn("py-14 lg:py-24", mt.sectionAlt)}>
          <div className={section.container}>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div data-animate="slideInLeft">
                <Eyebrow className="mb-3">{t("aboutPage.storyEyebrow")}</Eyebrow>
                <h2 className={cn("text-3xl font-bold md:text-4xl", mt.heading)}>{t("aboutPage.storyTitle")}</h2>
                <div className="mt-6 space-y-4">
                  {safeStory.map((para, i) => (
                    <p key={i} className={cn("leading-relaxed", mt.body)}>{para}</p>
                  ))}
                </div>
                <Link href="/consultation">
                  <Button variant="dark" size="md" className="mt-8">
                    {t("aboutPage.storyCta")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div
                data-animate="slideInRight"
                className="overflow-hidden rounded-2xl shadow-xl"
              >
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
            <SectionHeading
              eyebrow={t("aboutPage.missionEyebrow")}
              title={t("aboutPage.missionTitle")}
              center
              mt={mt}
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
            <SectionHeading
              eyebrow={t("aboutPage.principlesEyebrow")}
              title={t("aboutPage.principlesTitle")}
              center
              mt={mt}
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

        {/* Promise — always dark */}
        <section className="bg-[#0D1B2A] py-20 text-white lg:py-24">
          <div className={section.container}>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div
                data-animate="slideInLeft"
                className="overflow-hidden rounded-2xl shadow-2xl"
              >
                <MarketingImage
                  src={promiseImage}
                  alt={t("images.nextGradesLearning")}
                  containerClassName="h-80 w-full lg:h-[440px]"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
              <div data-animate="slideInRight">
                <Eyebrow className="mb-3">{t("aboutPage.promiseEyebrow")}</Eyebrow>
                <h2 className="text-3xl font-bold md:text-4xl">{t("aboutPage.promiseTitle")}</h2>
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
            <SectionHeading
              eyebrow={t("aboutPage.statsEyebrow")}
              title={t("aboutPage.statsTitle")}
              center
              mt={mt}
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
              <Button variant="gold" size="xl" href="/consultation" className="w-full shrink-0 rounded-xl py-4 text-base font-semibold lg:w-auto">
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
