"use client";

import { useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useCmsImages } from "@/hooks/useCmsImage";
import { HOME_HERO_STUDENT_IMAGE, PROGRAM_CARD_IMAGES, HERO_STUDY_IMAGE, HOME_PLATFORM_THUMB, HOME_TESTIMONIALS_BG } from "@/lib/marketing-images";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { RevealOnScroll } from "@/components/marketing/RevealOnScroll";
import { MobileCarousel, CarouselCard } from "@/components/mobile/MobileCarousel";
import {
  ArrowRight,
  Users,
  Video,
  Target,
  Clock,
  Star,
  CheckCircle2,
  Trophy,
  Calendar,
  GraduationCap,
  FileText,
} from "lucide-react";

const featureIcons = [Users, Video, Target, Clock, CheckCircle2];
const statIcons = [GraduationCap, Users, FileText, Star];

export default function Home() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { getImage } = useCmsImages();

  const heroStudentImage = getImage("cmsImages.home.heroStudent", HOME_HERO_STUDENT_IMAGE);
  const studyBannerImage = getImage("cmsImages.home.studyBanner", HERO_STUDY_IMAGE);
  const platformThumb = getImage("cmsImages.home.platformThumb", HOME_PLATFORM_THUMB);
  const testimonialsBg = getImage("cmsImages.home.testimonialsBg", HOME_TESTIMONIALS_BG);
  const programCardImages = PROGRAM_CARD_IMAGES.map((url, i) =>
    getImage(`cmsImages.home.programCard.${i}`, url)
  );

  const features = useMemo(() => {
    const data = t("home.features", { returnObjects: true });
    return Array.isArray(data) ? (data as { title: string; desc: string }[]) : [];
  }, [t, i18n.language]);
  const programs = useMemo(() => {
    const data = t("home.programsSection.items", { returnObjects: true });
    return Array.isArray(data) ? (data as { title: string; features: string[] }[]) : [];
  }, [t, i18n.language]);
  const stats = useMemo(() => {
    const data = t("home.stats", { returnObjects: true });
    return Array.isArray(data) ? (data as { number: string; label: string }[]) : [];
  }, [t, i18n.language]);
  const testimonials = useMemo(() => {
    const data = t("home.testimonials.items", { returnObjects: true });
    return Array.isArray(data) ? (data as { quote: string; name: string }[]) : [];
  }, [t, i18n.language]);

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-white"}`}>
      <Navbar />

      <main className="flex-1">
        {/* Hero — CSS-only entrance (no scroll observer) */}
        <section className="relative overflow-hidden bg-[#0D1B2A] pb-16 pt-site-nav text-white md:pb-20 md:pt-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.08)_0%,_transparent_55%)]" />
          <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <p
                  data-cms-field="home.heroEyebrow"
                  className="hero-enter mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37] sm:text-sm"
                >
                  {t("home.heroEyebrow")}
                </p>
                <h1
                  data-cms-field="home.heroTitle"
                  className="hero-enter hero-enter-delay-1 mb-6 text-4xl font-bold leading-[1.08] md:text-5xl lg:text-[3.25rem]"
                >
                  {t("home.heroTitle")}{" "}
                  <span data-cms-field="home.heroTitleHighlight" className="text-[#D4AF37]">
                    {t("home.heroTitleHighlight")}
                  </span>
                </h1>
                <p
                  data-cms-field="home.heroSubtitle"
                  className="hero-enter hero-enter-delay-2 mb-8 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg"
                >
                  {t("home.heroSubtitle")}
                </p>
                <div className="hero-enter hero-enter-delay-3 mb-10 flex flex-col gap-4 sm:flex-row">
                  <Button variant="gold" size="md" className="px-8" href="/consultation" data-cms-field="home.freeConsultation">
                    {t("home.freeConsultation")}
                  </Button>
                  <Link
                    data-cms-field="home.explorePrograms"
                    href="/programs"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/80 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white hover:text-[#0D1B2A]"
                  >
                    {t("home.explorePrograms")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="hero-enter hero-enter-delay-4 flex flex-wrap items-center gap-5">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0D1B2A] bg-gradient-to-br from-[#D4AF37] to-[#F5A623] text-sm font-bold text-white"
                      >
                        {String.fromCharCode(64 + i)}
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
                    <p className="text-sm text-gray-400">{t("home.reviewsFrom")}</p>
                  </div>
                </div>
              </div>

                <div
                  data-cms-field="cmsImages.home.heroStudent"
                  className="hero-enter hero-enter-delay-2 relative mx-auto w-full max-w-lg lg:max-w-none"
                >
                <div className="relative aspect-[4/5] max-h-[520px] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 sm:aspect-[5/6] lg:aspect-auto lg:h-[480px]">
                  <MarketingImage
                    src={heroStudentImage}
                    fallbackSrc={HOME_HERO_STUDENT_IMAGE}
                    alt={t("images.studentStudying")}
                    priority
                    containerClassName="absolute inset-0"
                    className="object-cover object-[center_20%]"
                    sizes="(max-width: 1024px) 90vw, 560px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/80 via-[#0D1B2A]/10 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0D1B2A]/20" />
                </div>

                <div className="hero-enter hero-enter-delay-4 absolute -bottom-5 right-2 z-10 max-w-[280px] sm:right-4 lg:-bottom-6 lg:right-6">
                  <Card className="border border-[#D4AF37]/30 bg-[#0D1B2A]/95 p-4 shadow-xl backdrop-blur-sm sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/20">
                        <Trophy className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{t("home.floatingCardTitle")}</p>
                        <p className="text-sm text-gray-400">{t("home.floatingCardDesc")}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className={`py-10 md:py-12 ${theme === "dark" ? "bg-[#112240]" : "bg-[#FAFAFA]"}`}>
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <MobileCarousel
              ariaLabel="Platform features"
              slideWidth="full"
              desktopClassName="md:grid md:grid-cols-5 md:gap-6 lg:gap-8"
            >
              {features.map((feature, index) => {
                const Icon = featureIcons[index];
                return (
                  <RevealOnScroll key={index} delay={index * 70} direction="up">
                    <CarouselCard
                      className={`text-center ${theme === "dark" ? "border-white/10 bg-[#112240]" : "bg-white"}`}
                    >
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/15">
                        <Icon className="h-7 w-7 text-[#D4AF37]" />
                      </div>
                      <h3 className={`mb-2 text-base font-bold leading-snug ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {feature.desc}
                      </p>
                    </CarouselCard>
                  </RevealOnScroll>
                );
              })}
            </MobileCarousel>
          </div>
        </section>

        {/* Programs */}
        <section className={`py-20 ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-white"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RevealOnScroll direction="up" className="text-center mb-12">
              <h2 className={`text-3xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                {t("home.programsSection.title")}
              </h2>
              <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {t("home.programsSection.subtitle")}
              </p>
            </RevealOnScroll>

            <MobileCarousel
              ariaLabel="Programs"
              slideWidth="full"
              desktopClassName="md:grid md:grid-cols-3 md:gap-8"
            >
              {programs.map((program, index) => {
                const featured = index === 2;
                return (
                  <RevealOnScroll
                    key={index}
                    delay={index * 90}
                    direction={index % 2 === 0 ? "left" : "right"}
                  >
                    <Card
                      className={`relative flex h-full flex-col overflow-hidden p-0 transition-all duration-300 ${
                        featured ? "border-2 border-[#D4AF37] shadow-xl" : "border border-gray-100"
                      }`}
                    >
                      {featured && (
                        <div className="absolute right-4 top-4 z-10">
                          <Badge className="bg-[#D4AF37] px-3 py-1 text-xs font-semibold uppercase text-[#0D1B2A]">
                            {t("home.mostPopular")}
                          </Badge>
                        </div>
                      )}
                      <div className="relative h-44 overflow-hidden">
                        <MarketingImage
                          src={programCardImages[index] ?? programCardImages[0]}
                          fallbackSrc={PROGRAM_CARD_IMAGES[index] ?? PROGRAM_CARD_IMAGES[0]}
                          alt={program.title}
                          containerClassName="h-full w-full"
                          sizes="(max-width: 768px) 90vw, 33vw"
                          className="transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className={`mb-4 text-xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                          {program.title}
                        </h3>
                        <ul className="mb-6 flex-1 space-y-3">
                          {program.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                              <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Link
                          href="/programs"
                          className={`group flex items-center gap-2 font-semibold transition-all ${
                            featured ? "text-[#D4AF37]" : theme === "dark" ? "text-white" : "text-[#0D1B2A]"
                          }`}
                        >
                          {t("home.learnMore")}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </Card>
                  </RevealOnScroll>
                );
              })}
            </MobileCarousel>
          </div>
        </section>

        {/* Stats */}
        <section className={`py-12 md:py-14 ${theme === "dark" ? "bg-[#112240] text-white" : "bg-[#FAFAFA] text-[#0D1B2A]"}`}>
          <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
            <MobileCarousel
              ariaLabel="Statistics"
              slideWidth="compact"
              desktopClassName="md:grid md:grid-cols-4 md:gap-8"
            >
              {stats.map((stat, index) => {
                const Icon = statIcons[index];
                return (
                  <RevealOnScroll key={index} delay={index * 80} direction="scale">
                    <CarouselCard
                      className={`items-center text-center ${theme === "dark" ? "border-white/10 bg-[#0D1B2A]/50" : "bg-white"}`}
                    >
                      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${theme === "dark" ? "bg-white/10" : "bg-[#D4AF37]/15"}`}>
                        <Icon className="h-7 w-7 text-[#D4AF37]" />
                      </div>
                      <p className={`mb-2 text-3xl font-bold leading-none ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                        {stat.number}
                      </p>
                      <p className={`text-sm leading-snug ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                        {stat.label}
                      </p>
                    </CarouselCard>
                  </RevealOnScroll>
                );
              })}
            </MobileCarousel>
          </div>
        </section>

        {/* Platform Preview */}
        <section className={`py-10 md:py-12 ${theme === "dark" ? "bg-[#112240]" : "bg-[#FAFAFA]"}`}>
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <RevealOnScroll direction="up" className="overflow-hidden rounded-3xl bg-[#0D1B2A] shadow-2xl md:hidden">
              <div className="relative h-52 w-full">
                <MarketingImage
                  src={studyBannerImage}
                  fallbackSrc={HERO_STUDY_IMAGE}
                  alt={t("images.modernLearning")}
                  containerClassName="h-full w-full"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/40 to-transparent" />
              </div>
              <div className="px-5 pb-8 pt-2">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
                  {t("images.modernLearning")}
                </p>
                <h2 className="mb-3 text-2xl font-bold leading-tight text-white">
                  {t("home.platform.title")}
                </h2>
                <p className="mb-6 text-base leading-relaxed text-gray-300">
                  {t("home.platform.subtitle")}
                </p>
                <div className="mb-8 flex flex-col gap-3">
                  <Button variant="gold" size="md" href="/resources" className="w-full">
                    {t("home.platform.discover")}
                  </Button>
                  <Button variant="outline" size="md" href="/about" className="w-full border-white/40 text-white hover:bg-white hover:text-[#0D1B2A]">
                    {t("home.platform.learnMore")}
                  </Button>
                </div>
                <MobileCarousel ariaLabel="Platform highlights" slideWidth="full" desktopClassName="hidden">
                  <CarouselCard className="bg-white">
                    <h3 className="mb-3 text-sm font-semibold text-[#0D1B2A]">{t("home.platform.trackProgress")}</h3>
                    <div className="flex gap-4">
                      <MarketingImage
                        src={platformThumb}
                        fallbackSrc={HOME_PLATFORM_THUMB}
                        alt={t("images.studentStudying")}
                        width={64}
                        height={64}
                        sizes="64px"
                        className="rounded-xl"
                      />
                      <p className="flex-1 text-sm leading-relaxed text-gray-600">{t("home.platform.trackProgressDesc")}</p>
                    </div>
                  </CarouselCard>
                  <CarouselCard className="items-center bg-white text-center">
                    <p className="text-3xl font-bold text-[#0D1B2A]">{t("home.platform.availability")}</p>
                    <p className="mt-1 text-sm text-gray-500">{t("home.platform.availabilityLabel")}</p>
                  </CarouselCard>
                  <CarouselCard className="items-center bg-white text-center">
                    <p className="text-3xl font-bold text-[#0D1B2A]">{stats[2]?.number ?? "1,000+"}</p>
                    <p className="mt-1 text-sm text-gray-500">{t("home.platform.materials")}</p>
                  </CarouselCard>
                </MobileCarousel>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="up" className="relative hidden overflow-hidden rounded-3xl shadow-2xl md:block">
              <div className="relative">
                <MarketingImage
                  src={studyBannerImage}
                  fallbackSrc={HERO_STUDY_IMAGE}
                  alt={t("images.modernLearning")}
                  containerClassName="h-[500px] w-full"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/80 via-[#0D1B2A]/40 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                      <div>
                        <h2 className="mb-4 text-4xl font-bold leading-tight text-white lg:text-5xl">
                          {t("home.platform.title")}
                        </h2>
                        <p className="mb-8 text-lg text-gray-200">{t("home.platform.subtitle")}</p>
                        <div className="flex flex-row gap-4">
                          <Button variant="gold" size="md" href="/resources">{t("home.platform.discover")}</Button>
                          <Button variant="outline" size="md" href="/about" className="border-white text-white hover:bg-white hover:text-[#0D1B2A]">
                            {t("home.platform.learnMore")}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-2xl bg-white p-6 shadow-xl">
                          <h3 className="mb-2 text-sm font-semibold text-[#0D1B2A]">{t("home.platform.trackProgress")}</h3>
                          <div className="flex gap-4">
                            <MarketingImage src={platformThumb} fallbackSrc={HOME_PLATFORM_THUMB} alt={t("images.studentStudying")} width={64} height={64} sizes="64px" className="rounded-xl" />
                            <p className="flex-1 text-sm text-gray-600">{t("home.platform.trackProgressDesc")}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-2xl bg-white p-4 shadow-xl">
                            <div className="text-3xl font-bold text-[#0D1B2A]">{t("home.platform.availability")}</div>
                            <div className="text-sm text-gray-500">{t("home.platform.availabilityLabel")}</div>
                          </div>
                          <div className="rounded-2xl bg-white p-4 shadow-xl">
                            <div className="text-3xl font-bold text-[#0D1B2A]">{stats[2]?.number ?? "1,000+"}</div>
                            <div className="text-sm text-gray-500">{t("home.platform.materials")}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <MarketingImage
              src={testimonialsBg}
              fallbackSrc={HOME_TESTIMONIALS_BG}
              alt=""
              containerClassName="absolute inset-0"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/90 via-[#0D1B2A]/70 to-[#0D1B2A]/90" />
          </div>

          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <RevealOnScroll direction="up" className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">
                {t("home.testimonials.title")}
              </h2>
            </RevealOnScroll>

            <MobileCarousel
              ariaLabel="Testimonials"
              slideWidth="full"
              desktopClassName="md:grid md:grid-cols-3 md:gap-8"
            >
              {testimonials.map((testimonial, index) => (
                <RevealOnScroll key={index} delay={index * 90} direction="up">
                  <Card className="h-full border border-white/20 bg-white/10 p-8 backdrop-blur-xl">
                    <div className="mb-6 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
                      ))}
                    </div>
                    <p className="mb-6 text-base leading-relaxed text-white">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37]/30">
                        <span className="text-sm font-bold text-[#D4AF37]">{testimonial.name.charAt(0)}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-200">{testimonial.name}</p>
                    </div>
                  </Card>
                </RevealOnScroll>
              ))}
            </MobileCarousel>
          </div>
        </section>

        {/* CTA */}
        <section className={`py-12 md:py-16 ${theme === "dark" ? "bg-[#112240] text-white" : "bg-[#FAFAFA] text-[#0D1B2A]"}`}>
          <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
            <RevealOnScroll direction="scale">
              <div className={`rounded-3xl p-6 md:p-8 ${theme === "dark" ? "bg-[#0D1B2A]/60 border border-white/10" : "border border-gray-100 bg-white shadow-lg"}`}>
                <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${theme === "dark" ? "bg-white/10" : "bg-[#D4AF37]/15"}`}>
                    <Calendar className="h-8 w-8 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-bold md:text-2xl">{t("home.cta.title")}</h3>
                    <p className={`text-base leading-relaxed ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      {t("home.cta.subtitle")}
                    </p>
                  </div>
                  <Button variant="gold" size="lg" href="/consultation" className="w-full shrink-0 md:w-auto">
                    {t("home.cta.button")}
                  </Button>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
