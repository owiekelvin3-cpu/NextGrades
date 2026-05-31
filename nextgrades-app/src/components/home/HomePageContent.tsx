"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import {
  MarketingDualCTA,
  MarketingPillBadge,
  MarketingPillButton,
} from "@/components/marketing/mobile/MarketingMobileUI";
import { MobileAccordion } from "@/components/mobile/MobileAccordion";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { PlatformDashboardMockup } from "@/components/home/PlatformDashboardMockup";
import { mobile } from "@/lib/mobile/tokens";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Library,
  LineChart,
  ListChecks,
  Star,
  Target,
  Trophy,
  Users,
  Video,
  Calendar,
} from "lucide-react";

import { HERO_STUDY_IMAGE, PROGRAM_CARD_IMAGES } from "@/lib/marketing-images";

const featureIcons = [Users, Users, Video, Target, Clock];
const statIcons = [GraduationCap, Users, BookOpen, Star];
const platformIcons = [BarChart3, Library, Target, ListChecks];

const AVATAR_COLORS = ["#D4AF37", "#F5A623", "#0D1B2A", "#4DA3FF"];

type ProgramItem = {
  title: string;
  tagline: string;
  features: string[];
};

type TestimonialItem = {
  quote: string;
  name: string;
  role?: string;
};

function SocialProofRow({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex -space-x-3">
          {AVATAR_COLORS.map((bg, i) => (
            <div
              key={i}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0D1B2A] text-sm font-bold text-white"
              style={{ backgroundColor: bg }}
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <div>
          <div className="mb-1 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
            ))}
            <span className="ml-2 font-semibold text-white">{t("home.rating")}</span>
          </div>
          <p className="text-sm text-gray-300">{t("home.reviewsFrom")}</p>
        </div>
      </div>
    </div>
  );
}

export function HomePageContent() {
  const { t, i18n } = useTranslation();
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const features = useMemo(
    () => t("home.features", { returnObjects: true }) as { title: string; desc: string }[],
    [t, i18n.language]
  );
  const programs = useMemo(
    () => t("home.programsSection.items", { returnObjects: true }) as ProgramItem[],
    [t, i18n.language]
  );
  const stats = useMemo(
    () => t("home.stats", { returnObjects: true }) as { number: string; label: string }[],
    [t, i18n.language]
  );
  const platformFeatures = useMemo(() => {
    const fromTranslation = t("home.platform.features", { returnObjects: true });
    if (Array.isArray(fromTranslation)) {
      return fromTranslation as { title: string; desc: string }[];
    }
    return [
      { title: t("home.platform.trackProgress"), desc: t("home.platform.trackProgressDesc") },
      {
        title: t("home.platform.availability"),
        desc: t("home.platform.availabilityLabel"),
      },
      { title: "1,000+", desc: t("home.platform.materials") },
      { title: t("home.platform.learnMore"), desc: t("home.platform.subtitle") },
    ];
  }, [t, i18n.language]);
  const testimonials = useMemo(
    () => t("home.testimonials.items", { returnObjects: true }) as TestimonialItem[],
    [t, i18n.language]
  );

  const featureAccordionItems = useMemo(
    () =>
      features.map((feature, index) => {
        const Icon = featureIcons[index] ?? Award;
        return {
          id: `feature-${index}`,
          icon: <Icon className="h-5 w-5" strokeWidth={1.5} />,
          title: feature.title,
          summary: feature.desc,
          content: feature.desc,
        };
      }),
    [features]
  );

  const platformAccordionItems = useMemo(
    () =>
      platformFeatures.map((item, index) => {
        const Icon = platformIcons[index] ?? LineChart;
        return {
          id: `platform-${index}`,
          icon: <Icon className="h-5 w-5" strokeWidth={1.5} />,
          title: item.title,
          summary: item.desc,
          content: item.desc,
        };
      }),
    [platformFeatures]
  );

  const testimonialAccordionItems = useMemo(
    () =>
      testimonials.map((item, index) => ({
        id: `testimonial-${index}`,
        icon: <Star className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />,
        title: item.name,
        summary: item.quote.slice(0, 72) + (item.quote.length > 72 ? "…" : ""),
        content: (
          <div>
            <div className="mb-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>
            <p>&ldquo;{item.quote}&rdquo;</p>
            {item.role && <p className="mt-2 text-xs opacity-80">{item.role}</p>}
          </div>
        ),
      })),
    [testimonials]
  );

  const nextTestimonial = useCallback(() => {
    setTestimonialIndex((i) => (i + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setTestimonialIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const id = window.setInterval(nextTestimonial, 8000);
    return () => window.clearInterval(id);
  }, [nextTestimonial, testimonials.length]);

  const visibleTestimonials =
    testimonials.length <= 3
      ? testimonials
      : [
          testimonials[testimonialIndex],
          testimonials[(testimonialIndex + 1) % testimonials.length],
          testimonials[(testimonialIndex + 2) % testimonials.length],
        ];

  return (
    <main className="flex-1 bg-white text-[#0D1B2A]">
      {/* Mobile hero — stacked Pathora-style layout */}
      <section className="md:hidden bg-[#0D1B2A] pb-10 pt-[calc(4.5rem+env(safe-area-inset-top,0px))]">
        <div className="mx-auto max-w-7xl px-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MarketingPillBadge dark className="mb-4 normal-case tracking-normal">
              {t("home.heroEyebrow")}
            </MarketingPillBadge>
            <h1 className="mb-4 text-[1.75rem] font-bold leading-[1.12] text-white">
              {t("home.heroTitle")}{" "}
              <span className="text-[#D4AF37]">{t("home.heroTitleHighlight")}</span>
            </h1>
            <p className="mb-6 text-[15px] leading-relaxed text-gray-300">
              {t("home.heroSubtitle")}
            </p>

            <MarketingDualCTA
              className="mb-8"
              primary={
              <Button
                variant="gold"
                size="md"
                className="w-full px-3 text-sm"
                href="/consultation"
              >
                {t("home.freeConsultation")}
              </Button>
              }
              secondary={
              <Link
                href="/programs"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border-2 border-white/30 px-3 text-sm font-semibold text-white transition-colors active:scale-[0.98] touch-manipulation"
              >
                {t("home.explorePrograms")}
              </Link>
              }
            />

            <SocialProofRow className="mb-8" />

            <div className="marketing-mobile-hero-image relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
              <MarketingImage
                src={HERO_STUDY_IMAGE}
                alt=""
                containerClassName="absolute inset-0"
                priority
                className="object-cover object-center"
                sizes="100vw"
              />
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-3xl border border-[#D4AF37]/25 bg-white/[0.06] p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/20">
                <Trophy className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <div>
                <p className="font-semibold text-white">{t("home.floatingCardTitle")}</p>
                <p className="text-sm text-gray-400">{t("home.floatingCardDesc")}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Desktop hero — full-bleed background */}
      <section className="relative hidden min-h-[92vh] items-center overflow-hidden md:flex">
        <MarketingImage
          src={HERO_STUDY_IMAGE}
          alt=""
          containerClassName="absolute inset-0"
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/95 via-[#0D1B2A]/75 to-[#0D1B2A]/40" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37] sm:text-sm">
                {t("home.heroEyebrow")}
              </p>
              <h1 className="mb-6 text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-[3.25rem]">
                {t("home.heroTitle")}{" "}
                <span className="text-[#D4AF37]">{t("home.heroTitleHighlight")}</span>
              </h1>
              <p className="mb-8 max-w-xl text-base leading-relaxed text-gray-200 sm:text-lg">
                {t("home.heroSubtitle")}
              </p>
              <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                <Button variant="gold" size="md" className="px-8" href="/consultation">
                  {t("home.freeConsultation")}
                </Button>
                <Link
                  href="/programs"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/80 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white hover:text-[#0D1B2A]"
                >
                  {t("home.explorePrograms")}
                </Link>
              </div>
              <SocialProofRow />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="absolute bottom-8 right-0 z-10 max-w-[260px] rounded-xl border border-[#D4AF37]/25 bg-[#0D1B2A]/90 p-5 shadow-xl backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/20">
                    <Trophy className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t("home.floatingCardTitle")}</p>
                    <p className="text-sm text-gray-400">{t("home.floatingCardDesc")}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features — mobile accordion on dark / desktop grid */}
      <section className="md:hidden bg-[#0D1B2A] py-10">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="mb-2 text-2xl font-bold text-white">
            {t("home.heroTitle")}{" "}
            <span className="text-[#D4AF37]">{t("home.heroTitleHighlight")}</span>
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-300">{t("home.heroSubtitle")}</p>
          <MobileAccordion variant="dark" items={featureAccordionItems} />
          <div className="mt-6">
            <MarketingPillButton href="/consultation" variant="inverse">
              {t("home.freeConsultation")}
            </MarketingPillButton>
          </div>
        </div>
      </section>

      <section className="hidden border-b border-gray-100 bg-white py-12 md:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {features.map((feature, index) => {
              const Icon = featureIcons[index] ?? Award;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10">
                    <Icon className="h-6 w-6 text-[#D4AF37]" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-[#0D1B2A]">{feature.title}</h3>
                  <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="bg-white py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center md:mb-12"
          >
            <h2 className="mb-3 text-2xl font-bold text-[#0D1B2A] md:text-3xl">
              {t("home.programsSection.title")}
            </h2>
            <p className="text-sm text-gray-600 md:text-base">
              {t("home.programsSection.subtitle")}
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3 md:gap-8">
            {programs.map((program, index) => {
              const featured = index === 2;
              return (
                <motion.article
                  key={program.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className={`flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-md transition-shadow hover:shadow-xl md:rounded-2xl ${
                    featured ? "ring-2 ring-[#D4AF37]" : "border border-gray-100"
                  }`}
                >
                  <div className="relative h-44 overflow-hidden md:h-48">
                    {featured && (
                      <span className="absolute right-4 top-4 z-10 rounded-full bg-[#D4AF37] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0D1B2A]">
                        {t("home.mostPopular")}
                      </span>
                    )}
                    <MarketingImage
                      src={PROGRAM_CARD_IMAGES[index]}
                      alt=""
                      containerClassName="absolute inset-0"
                      className={`transition-transform duration-500 hover:scale-105 ${featured ? "opacity-90" : ""}`}
                    />
                    {featured && (
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/80 to-transparent" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <h3 className="mb-1 text-lg font-bold text-[#0D1B2A] md:text-xl">{program.title}</h3>
                    <p className="mb-4 text-sm text-gray-500">{program.tagline}</p>
                    <ul className="mb-6 flex-1 space-y-2.5">
                      {program.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/programs"
                      className={`inline-flex min-h-12 items-center gap-2 rounded-2xl text-sm font-semibold transition-colors touch-manipulation ${
                        featured ? "text-[#D4AF37]" : "text-[#0D1B2A] hover:text-[#D4AF37]"
                      }`}
                    >
                      {t("home.learnMore")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats — swipe row on mobile */}
      <section className="bg-[#0D1B2A] py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className={mobile.swipeRow}>
            {stats.map((stat, index) => {
              const Icon = statIcons[index] ?? Star;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={`${mobile.swipeCard} rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center md:border-0 md:bg-transparent md:p-0`}
                >
                  <Icon className="mx-auto mb-3 h-8 w-8 text-[#D4AF37]" strokeWidth={1.5} />
                  <p className="text-3xl font-bold text-white md:text-4xl">{stat.number}</p>
                  <p className="mt-1 text-sm text-gray-300">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform showcase */}
      <section className="bg-[#F5F6F8] py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {/* Mobile */}
          <div className="space-y-8 md:hidden">
            <div>
              <MarketingPillBadge className="mb-3">{t("home.platform.eyebrow")}</MarketingPillBadge>
              <h2 className="mb-3 text-2xl font-bold leading-tight text-[#0D1B2A]">
                {t("home.platform.title")}
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">{t("home.platform.subtitle")}</p>
            </div>
            <PlatformDashboardMockup />
            <MobileAccordion items={platformAccordionItems} />
            <MarketingPillButton href="/login">{t("home.platform.discover")}</MarketingPillButton>
          </div>

          {/* Desktop */}
          <div className="hidden items-center gap-12 md:grid lg:grid-cols-[1fr_1.1fr_1fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                {t("home.platform.eyebrow")}
              </p>
              <h2 className="mb-4 text-3xl font-bold leading-tight text-[#0D1B2A]">
                {t("home.platform.title")}
              </h2>
              <p className="mb-8 text-gray-600">{t("home.platform.subtitle")}</p>
              <Button variant="gold" size="md" href="/login">
                {t("home.platform.discover")}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <PlatformDashboardMockup />
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {platformFeatures.map((item, index) => {
                const Icon = platformIcons[index] ?? LineChart;
                return (
                  <li key={item.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10">
                      <Icon className="h-5 w-5 text-[#D4AF37]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-bold text-[#0D1B2A]">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </li>
                );
              })}
            </motion.ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold text-[#0D1B2A] md:mb-12 md:text-3xl">
            {t("home.testimonials.title")}
          </h2>

          <div className="md:hidden">
            <MobileAccordion items={testimonialAccordionItems} defaultOpenId="testimonial-0" />
          </div>

          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={prevTestimonial}
              className="absolute -left-12 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-md transition hover:border-[#D4AF37] md:flex"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5 text-[#0D1B2A]" />
            </button>
            <button
              type="button"
              onClick={nextTestimonial}
              className="absolute -right-12 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-md transition hover:border-[#D4AF37] md:flex"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5 text-[#0D1B2A]" />
            </button>

            <div className="grid gap-6 md:grid-cols-3">
              {visibleTestimonials.map((item, index) => (
                <motion.div
                  key={`${item.name}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
                >
                  <div className="mb-4 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-700">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/20 text-sm font-bold text-[#D4AF37]">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0D1B2A]">{item.name}</p>
                      {item.role && <p className="text-xs text-gray-500">{item.role}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTestimonialIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === testimonialIndex ? "w-8 bg-[#D4AF37]" : "w-2 bg-gray-300"
                  }`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-white px-5 pb-12 pt-4 sm:px-6 md:pb-20 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-[#0D1B2A] px-5 py-8 sm:rounded-2xl sm:px-10 sm:py-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:gap-8">
            <div className="flex w-full items-start gap-4 md:gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/15 md:h-14 md:w-14 md:rounded-xl">
                <Calendar className="h-6 w-6 text-[#D4AF37] md:h-7 md:w-7" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white sm:text-2xl">{t("home.cta.title")}</h3>
                <p className="mt-2 max-w-lg text-sm text-gray-300 sm:text-base">
                  {t("home.cta.subtitle")}
                </p>
              </div>
            </div>
            <Button
              variant="gold"
              size="lg"
              href="/consultation"
              className="w-full shrink-0 md:w-auto"
            >
              {t("home.cta.button")}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
