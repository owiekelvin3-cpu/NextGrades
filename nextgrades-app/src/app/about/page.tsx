"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
  Rocket,
  Quote,
  Smile,
  Globe,
  Share2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useCmsImages } from "@/hooks/useCmsImage";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  ABOUT_IMAGES,
  ABOUT_TEAM_IMAGES,
} from "@/lib/marketing-images";

const PILLAR_ICONS = [Target, Eye, Sparkles];
const FEATURE_ICONS = [GraduationCap, Target, Users, Rocket];
const PRINCIPLE_ICONS = [User, GraduationCap, BookOpen, TrendingUp, Heart];
const MISSION_ICONS = [BookOpen, FileText, Users, TrendingUp];
const STAT_ICONS = [Smile, GraduationCap, TrendingUp, Heart];
const MILESTONE_ICONS = [Rocket, Users, BookOpen, TrendingUp, Sparkles];

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
    <div className={cn("mb-12", center && "text-center")}>
      {eyebrow && <Eyebrow className={cn("mb-3", center && "mx-auto")}>{eyebrow}</Eyebrow>}
      <h2 className={cn("text-3xl font-bold tracking-tight md:text-4xl", mt.heading)}>{title}</h2>
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
  const teamImages = ABOUT_TEAM_IMAGES.map((url, i) =>
    getImage(`cmsImages.about.team.${i}`, url)
  );

  const pillars = useLocalizedContent<{ title: string; desc: string }[]>("aboutPage.heroPillars");
  const heroFeatures = useLocalizedContent<{ title: string; desc: string }[]>("aboutPage.heroFeatures");
  const storyParagraphs = useLocalizedContent<string[]>("aboutPage.storyParagraphs");
  const missionCards = useLocalizedContent<{ title: string; desc: string }[]>("aboutPage.missionCards");
  const principles = useLocalizedContent<{ title: string; desc: string }[]>("aboutPage.principles");
  const promiseItems = useLocalizedContent<string[]>("aboutPage.promiseItems");
  const stats = useLocalizedContent<{ value: string; label: string }[]>("aboutPage.stats");
  const team = useLocalizedContent<{ name: string; role: string; bio: string }[]>("aboutPage.team");
  const milestones = useLocalizedContent<{ year: string; title: string; desc: string }[]>("aboutPage.milestones");
  const communityTags = useLocalizedContent<string[]>("aboutPage.communityTags");

  const safePillars = Array.isArray(pillars) ? pillars : [];
  const safeFeatures = Array.isArray(heroFeatures) ? heroFeatures : [];
  const safeStory = Array.isArray(storyParagraphs) ? storyParagraphs : [];
  const safeMission = Array.isArray(missionCards) ? missionCards : [];
  const safePrinciples = Array.isArray(principles) ? principles : [];
  const safePromise = Array.isArray(promiseItems) ? promiseItems : [];
  const safeStats = Array.isArray(stats) ? stats : [];
  const safeTeam = Array.isArray(team) ? team : [];
  const safeMilestones = Array.isArray(milestones) ? milestones : [];
  const safeTags = Array.isArray(communityTags) ? communityTags : [];

  const cardClass = cn(
    "rounded-2xl border transition-shadow hover:shadow-lg",
    mt.isDark ? "border-white/10 bg-[#112240] hover:shadow-black/30" : "border-gray-100 bg-white hover:shadow-gray-200/80"
  );

  return (
    <div className={cn("flex min-h-screen flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1">
        {/* Hero — always dark */}
        <section className="relative overflow-hidden bg-[#0D1B2A] pt-28 text-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 top-0 h-[500px] w-[500px] rounded-full bg-[#D4AF37]/8 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#4DA3FF]/8 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 pb-0 sm:px-6 lg:px-8">
            <p className="mb-6 text-sm text-gray-400">{t("aboutPage.breadcrumb")}</p>

            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Eyebrow className="mb-4">{t("aboutPage.heroEyebrow")}</Eyebrow>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-[3.25rem]">
                  {t("about.heroTitle")}{" "}
                  <span className="text-[#D4AF37]">{t("about.heroTitle2")}</span>
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-300">{t("about.heroSubtitle")}</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {safePillars.map((pillar, i) => {
                    const Icon = PILLAR_ICONS[i] ?? Target;
                    return (
                      <div key={pillar.title} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                        <Icon className="mb-2 h-5 w-5 text-[#D4AF37]" />
                        <p className="text-sm font-bold">{pillar.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-400">{pillar.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative"
              >
                <div className="overflow-hidden rounded-2xl shadow-2xl shadow-black/40">
                  <MarketingImage
                    src={heroImage}
                    alt={t("images.studentsCollaborating")}
                    containerClassName="h-[320px] w-full md:h-[420px]"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute -bottom-6 -left-4 max-w-xs rounded-xl border border-white/10 bg-[#0D1B2A]/90 p-5 shadow-xl backdrop-blur-md sm:-left-8">
                  <Quote className="mb-2 h-6 w-6 text-[#D4AF37]" />
                  <p className="text-sm italic leading-relaxed text-gray-200">&ldquo;{t("aboutPage.heroQuote")}&rdquo;</p>
                  <p className="mt-2 text-xs text-gray-500">— {t("aboutPage.heroQuoteAuthor")}</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Feature bar */}
          <div className="relative mt-14 border-t border-white/10 bg-[#0a1520]/80 backdrop-blur-sm">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
              {safeFeatures.map((feat, i) => {
                const Icon = FEATURE_ICONS[i] ?? GraduationCap;
                return (
                  <div key={feat.title} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/15">
                      <Icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{feat.title}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className={cn("py-20 lg:py-24", mt.sectionAlt)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
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
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="overflow-hidden rounded-2xl shadow-xl"
              >
                <MarketingImage
                  src={storyImage}
                  alt={t("images.modernLearning")}
                  containerClassName="h-80 w-full lg:h-[420px]"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission detail */}
        <section className={cn("py-20 lg:py-24", mt.section)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t("aboutPage.missionEyebrow")}
              title={t("aboutPage.missionTitle")}
              center
              mt={mt}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {safeMission.map((card, i) => {
                const Icon = MISSION_ICONS[i] ?? BookOpen;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={cn(cardClass, "overflow-hidden")}
                  >
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
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className={cn("py-20 lg:py-24", mt.sectionAlt)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t("aboutPage.principlesEyebrow")}
              title={t("aboutPage.principlesTitle")}
              center
              mt={mt}
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {safePrinciples.map((item, i) => {
                const Icon = PRINCIPLE_ICONS[i] ?? Heart;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className={cn(cardClass, "p-6 text-center")}
                  >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#D4AF37]/30 bg-[#D4AF37]/10">
                      <Icon className="h-6 w-6 text-[#D4AF37]" />
                    </div>
                    <h3 className={cn("text-sm font-bold", mt.heading)}>{item.title}</h3>
                    <p className={cn("mt-2 text-xs leading-relaxed", mt.body)}>{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Promise — always dark */}
        <section className="bg-[#0D1B2A] py-20 text-white lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="overflow-hidden rounded-2xl shadow-2xl"
              >
                <MarketingImage
                  src={promiseImage}
                  alt={t("images.nextGradesLearning")}
                  containerClassName="h-80 w-full lg:h-[440px]"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Eyebrow className="mb-3">{t("aboutPage.promiseEyebrow")}</Eyebrow>
                <h2 className="text-3xl font-bold md:text-4xl">{t("aboutPage.promiseTitle")}</h2>
                <ul className="mt-8 space-y-4">
                  {safePromise.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6">
                  <Quote className="mb-3 h-8 w-8 text-[#D4AF37]" />
                  <p className="text-lg italic leading-relaxed text-gray-200">&ldquo;{t("aboutPage.heroQuote")}&rdquo;</p>
                  <p className="mt-3 text-sm text-gray-500">— {t("aboutPage.heroQuoteAuthor")}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className={cn("py-20 lg:py-24", mt.sectionAlt)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

        {/* Team */}
        <section className={cn("py-20 lg:py-24", mt.section)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t("aboutPage.teamEyebrow")}
              title={t("about.teamTitle")}
              subtitle={t("aboutPage.teamSubtitle")}
              center
              mt={mt}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {safeTeam.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className={cn(cardClass, "group overflow-hidden")}
                >
                  <div className="aspect-square overflow-hidden">
                    <MarketingImage
                      src={teamImages[i] ?? teamImages[0]}
                      alt={`${member.name} – ${t("images.teamMember")}`}
                      containerClassName="aspect-square w-full"
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className={cn("font-bold", mt.heading)}>{member.name}</h3>
                    <p className="mt-0.5 text-sm font-medium text-[#D4AF37]">{member.role}</p>
                    <p className={cn("mt-2 text-xs leading-relaxed", mt.body)}>{member.bio}</p>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href="/contact"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] transition hover:bg-[#D4AF37]/20"
                        aria-label={t("common.contact")}
                      >
                        <Globe className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/about"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] transition hover:bg-[#D4AF37]/20"
                        aria-label={t("common.about")}
                      >
                        <Share2 className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className={cn("py-20 lg:py-24", mt.sectionAlt)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t("aboutPage.milestonesEyebrow")}
              title={t("about.milestonesTitle")}
              center
              mt={mt}
            />
            <div className="relative">
              <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-[#D4AF37]/30 lg:block" />
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
                {safeMilestones.map((ms, i) => {
                  const Icon = MILESTONE_ICONS[i] ?? Rocket;
                  return (
                    <motion.div
                      key={ms.year}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="relative text-center"
                    >
                      <div className="relative z-10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0D1B2A] shadow-lg ring-4 ring-[#D4AF37]/20">
                        <Icon className="h-7 w-7 text-[#D4AF37]" />
                      </div>
                      <p className="text-lg font-bold text-[#D4AF37]">{ms.year}</p>
                      <h3 className={cn("mt-1 font-bold", mt.heading)}>{ms.title}</h3>
                      <p className={cn("mt-2 text-xs leading-relaxed", mt.body)}>{ms.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1B2A] via-[#132942] to-[#1a3555] p-8 shadow-2xl sm:p-12">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
              <div className="flex items-center gap-6">
                <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 sm:flex">
                  <GraduationCap className="h-10 w-10 text-[#D4AF37]" />
                </div>
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-white md:text-3xl">{t("aboutPage.communityTitle")}</h2>
                  <p className="mt-2 max-w-lg text-gray-300">{t("aboutPage.communityDesc")}</p>
                </div>
              </div>
              <Button variant="gold" size="xl" href="/consultation" className="shrink-0">
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
