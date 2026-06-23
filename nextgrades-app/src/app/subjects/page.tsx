"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Calculator,
  Atom,
  FlaskConical,
  PenTool,
  ArrowRight,
  Users,
  TrendingUp,
  Calendar,
  GraduationCap,
  Star,
  BookOpen,
  Sparkles,
  Target,
  Briefcase,
  Cpu,
  Ruler,
  X,
  Languages,
  Globe,
  Library,
  Leaf,
  BarChart3,
} from "lucide-react";
import { SubjectProgramCard } from "@/components/subjects/SubjectProgramCard";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useCmsImages } from "@/hooks/useCmsImage";
import { SUBJECTS_HERO_IMAGE, getSubjectImage } from "@/lib/marketing-images";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { MarketingHeroMobileImage } from "@/components/marketing/MarketingHeroMobileImage";
import { themeInputClass, themeSelectClass } from "@/lib/theme/form-fields";
import { cn } from "@/lib/utils";
import { hero, type, section } from "@/lib/premium/tokens";

const SUBJECT_ICONS: Record<string, typeof Calculator> = {
  math: Calculator,
  english: BookOpen,
  german: PenTool,
  french: Languages,
  italian: Globe,
  latin: Library,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Leaf,
  accounting: Calculator,
  "business-admin": BarChart3,
  business: Briefcase,
  "computer-science": Cpu,
  "technical-drawing": Ruler,
};
const benefitIcons = [Users, BookOpen, Calendar, TrendingUp];
const statIcons = [Users, GraduationCap, Star, TrendingUp];
const heroFeatureIcons = [Target, Sparkles, GraduationCap];

type SubjectItem = {
  id: string;
  title: string;
  description: string;
  features: string[];
};

export default function SubjectsPage() {
  const mt = useMarketingTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { getImage } = useCmsImages();
  const subjectsHeroImage = getImage("cmsImages.subjects.hero", SUBJECTS_HERO_IMAGE);
  const resolveSubjectImage = (subjectId: string, index: number) => {
    const fallback = getSubjectImage(subjectId, index);
    return {
      src: getImage(`cmsImages.subjects.${subjectId}`, fallback),
      fallback,
    };
  };
  const [browseSubject, setBrowseSubject] = useState<SubjectItem | null>(null);
  const [browseGrade, setBrowseGrade] = useState("");
  const [browseSemester, setBrowseSemester] = useState("");
  const [catalogClasses, setCatalogClasses] = useState<Array<{ id: string; name: string; level: number }>>([]);

  useEffect(() => {
    void fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.classes)) setCatalogClasses(data.classes);
      });
  }, []);
  const subjectsRaw = useLocalizedContent<SubjectItem[]>("subjectsPage.items");
  const benefitsRaw = useLocalizedContent<{ title: string; desc: string }[]>("subjectsPage.benefits");
  const statsRaw = useLocalizedContent<{ value: string; label: string }[]>("subjectsPage.stats");
  const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];
  const benefits = Array.isArray(benefitsRaw) ? benefitsRaw : [];
  const stats = Array.isArray(statsRaw) ? statsRaw : [];

  const isDark = mt.isDark;

  const openBrowse = (subject: SubjectItem) => {
    setBrowseSubject(subject);
    setBrowseGrade("");
    setBrowseSemester("");
  };

  const goToResources = () => {
    if (!browseSubject) return;
    const slug = browseSubject.id;
    if (browseGrade) {
      const q = browseSemester ? `?semester=${browseSemester}` : "";
      router.push(`/resources/${slug}/${browseGrade}${q}`);
    } else {
      router.push(`/resources/${slug}`);
    }
  };

  const selectCls = (value: string) => themeSelectClass(value, "py-3");

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero */}
        <section className={cn("bg-[#0D1B2A] text-white", hero.section)}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.12)_0%,_transparent_55%)]" />
          <MarketingHeroBlend
            src={subjectsHeroImage}
            alt={t("subjects.title")}
            variant="dark-split-right"
            priority
          />
          <div className={hero.inner}>
            <div className="grid min-w-0 items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="hero-enter min-w-0">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37] sm:text-sm" data-animate="hero-headline">
                  {t("subjects.eyebrow")}
                </p>
                <h1 className={cn(type.h1, "mb-6")} data-animate="hero-headline" data-animate-delay="0.1">
                  {t("subjects.heroTitle")}{" "}
                  <span className="text-[#D4AF37]">{t("subjects.heroTitleHighlight")}</span>
                </h1>
                <p className="mb-8 max-w-xl text-base leading-relaxed text-on-navy-muted sm:text-lg" data-animate="hero-subheadline">
                  {t("subjects.heroSubtitle")}
                </p>

                <div className="mb-10 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4" data-animate="hero-cta">
                  {benefits.slice(0, 3).map((item, index) => {
                    const Icon = heroFeatureIcons[index] ?? Target;
                    return (
                      <div
                        key={index}
                        className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-2.5 sm:p-4"
                      >
                        <Icon className="mb-1.5 h-4 w-4 text-[#D4AF37] sm:mb-2 sm:h-5 sm:w-5" />
                        <p className="text-[11px] font-semibold leading-tight sm:text-sm">{item.title}</p>
                        <p className="mt-1 hidden text-xs leading-snug text-on-navy-subtle sm:block">
                          {item.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <Button variant="gold" size="lg" className="w-full sm:w-auto" href="/consultation">
                  {t("subjectsPage.ctaButton")} <ArrowRight className="h-5 w-5" />
                </Button>
              </div>

              <div data-animate="hero-image">
                <MarketingHeroMobileImage src={subjectsHeroImage} alt={t("subjects.title")} priority />
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="relative z-10 -mt-4 pb-4">
          <div className={section.container}>
            <Card className={cn("border-0 p-4 shadow-xl sm:p-6", mt.card)}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                {stats.map((stat, index) => {
                  const Icon = statIcons[index];
                  return (
                    <div
                      key={index}
                      className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-subtle)] p-4 text-center sm:flex-row sm:items-center sm:gap-4 sm:border-0 sm:bg-transparent sm:p-0 sm:text-left"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gold-muted)] sm:h-12 sm:w-12">
                        <Icon className="h-4 w-4 text-[var(--brand-gold)] sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-bold leading-none text-[var(--foreground)] sm:text-2xl">{stat.value}</p>
                        <p className="text-[9px] leading-tight text-[var(--text-muted)] sm:text-sm">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </section>

        {/* Subject cards — owner mockup grid */}
        <section className="bg-[#0D1B2A] py-14 text-white md:py-20">
          <div className={section.container}>
            <p className="mx-auto mb-10 max-w-3xl text-center text-base leading-relaxed text-on-navy-muted sm:mb-12 sm:text-lg">
              {t("subjectsPage.gridIntro")}
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" data-animate="staggerChildren" data-stagger="0.12">
              {subjects.map((subject, index) => {
                const Icon = SUBJECT_ICONS[subject.id] ?? BookOpen;
                const { src: image, fallback: imageFallback } = resolveSubjectImage(subject.id, index);
                return (
                  <div key={subject.id} id={`subject-${subject.id}`} className="h-full">
                      <SubjectProgramCard
                        subject={subject}
                        imageSrc={image}
                        imageFallback={imageFallback}
                        icon={Icon}
                        bookTutoringLabel={t("subjectsPage.bookTutoring")}
                        viewMaterialsLabel={t("subjectsPage.viewMaterials")}
                        onViewMaterials={() => openBrowse(subject)}
                      />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why NextGrades */}
        <section className={cn("py-14 md:py-20", mt.section)}>
          <div className={section.container}>
            <div className="mb-10 text-center md:mb-14">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--brand-gold)]">
                {t("subjectsPage.whyEyebrow")}
              </p>
              <h2 className="text-2xl font-bold text-[var(--foreground)] md:text-4xl">
                {t("subjectsPage.whyTitle")}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {benefits.map((item, index) => {
                const Icon = benefitIcons[index];
                return (
                  <Card
                    key={index}
                    className={cn(
                      "rounded-xl p-5 text-left transition-transform hover:-translate-y-1 md:p-6 md:text-center",
                      isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-white/5"
                    )}
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/10 md:mx-auto md:mb-5 md:h-16 md:w-16 md:rounded-2xl">
                      <Icon className="h-5 w-5 text-[#D4AF37] md:h-8 md:w-8" />
                    </div>
                    <h3 className={cn("mb-1 text-lg font-semibold leading-tight md:text-base md:font-bold", "text-foreground")}>
                      {item.title}
                    </h3>
                    <p className={cn("text-sm leading-relaxed", isDark ? "text-text-muted" : "text-foreground-secondary")}>
                      {item.desc}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#112240] to-[#0D1B2A] py-20 text-center text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.15)_0%,_transparent_60%)]" />
          <div className="relative mx-auto max-w-3xl px-4">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t("subjectsPage.ctaTitle")}</h2>
            <p className="mb-8 text-lg text-on-navy-muted">{t("subjectsPage.ctaDesc")}</p>
            <div className="flex w-full max-w-lg flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
              <Button variant="gold" size="lg" className="w-full sm:w-auto" href="/consultation">
                {t("subjectsPage.ctaButton")} <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="onDark"
                size="lg"
                href="/programs"
                className="w-full sm:w-auto"
              >
                {t("home.explorePrograms", { defaultValue: "Explore programs" })}
              </Button>
            </div>
          </div>
        </section>

        {browseSubject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="browse-subject-title"
          >
            <Card
              className={cn(
                "content-ready relative w-full max-w-md border p-6 shadow-2xl sm:p-8",
                isDark ? "border-white/10 bg-[#112240]" : "border-gray-100 bg-white"
              )}
            >
              <button
                type="button"
                onClick={() => setBrowseSubject(null)}
                className={cn(
                  "btn-chip absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border",
                  isDark
                    ? "border-white/10 bg-white/5 text-gray-400 hover:text-white"
                    : "border-gray-200 bg-gray-50 text-gray-500 hover:text-[#0D1B2A]"
                )}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <h3
                id="browse-subject-title"
                className={cn("mb-2 pr-10 text-xl font-bold sm:text-2xl", "text-foreground")}
              >
                {browseSubject.title}
              </h3>
              <p className={cn("mb-6 text-sm", isDark ? "text-text-muted" : "text-foreground-secondary")}>
                {t("subjectsPage.browseHint", { defaultValue: "Choose grade and semester to see matching materials." })}
              </p>
              <div className="space-y-4">
                <div>
                  <label className={cn("mb-2 block text-sm font-medium", "text-foreground")}>
                    {t("subjectsPage.selectGrade", { defaultValue: "Grade" })}
                  </label>
                  <select value={browseGrade} onChange={(e) => setBrowseGrade(e.target.value)} className={selectCls(browseGrade)}>
                    <option value="">{t("resources.filters.allGrades", { defaultValue: "All grades" })}</option>
                    {catalogClasses.map((c) => (
                      <option key={c.id} value={String(c.level)}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={cn("mb-2 block text-sm font-medium", "text-foreground")}>
                    {t("subjectsPage.selectSemester", { defaultValue: "Semester" })}
                  </label>
                  <select value={browseSemester} onChange={(e) => setBrowseSemester(e.target.value)} className={selectCls(browseSemester)}>
                    <option value="">{t("resources.filters.allSemesters", { defaultValue: "All semesters" })}</option>
                    <option value="1">{t("resources.filters.semester1", { defaultValue: "Semester 1" })}</option>
                    <option value="2">{t("resources.filters.semester2", { defaultValue: "Semester 2" })}</option>
                  </select>
                </div>
                <button type="button" onClick={goToResources} className="btn-card-primary group">
                  <span>{t("subjectsPage.viewResources", { defaultValue: "View resources" })}</span>
                  <span className="btn-card-primary-icon" aria-hidden>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              </div>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
