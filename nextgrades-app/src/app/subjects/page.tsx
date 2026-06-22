"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { RevealOnScroll } from "@/components/marketing/RevealOnScroll";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Calculator,
  Atom,
  FlaskConical,
  PenTool,
  CheckCircle2,
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
} from "lucide-react";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useCmsImages } from "@/hooks/useCmsImage";
import { SUBJECTS_HERO_IMAGE, getSubjectImage } from "@/lib/marketing-images";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { cn } from "@/lib/utils";
import { hero } from "@/lib/premium/tokens";

const SUBJECT_ICONS: Record<string, typeof Calculator> = {
  math: Calculator,
  english: BookOpen,
  german: PenTool,
  physics: Atom,
  chemistry: FlaskConical,
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
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
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

  const scrollToSubject = (subjectId: string) => {
    setActiveSubjectId(subjectId);
    document.getElementById(`subject-${subjectId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const subjectPillCls = (subjectId: string) =>
    cn(
      "btn-chip shrink-0 rounded-full border px-5 py-2.5 text-xs sm:text-sm",
      activeSubjectId === subjectId
        ? "border-[#D4AF37] bg-[#D4AF37] text-[#0D1B2A] shadow-lg shadow-[#D4AF37]/30"
        : cn(
            "hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] hover:shadow-md",
            isDark
              ? "border-white/15 bg-white/5 text-gray-200"
              : "border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--foreground)] shadow-sm"
          )
    );

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

  const inputCls =
    "w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--input-foreground)] focus:border-[var(--brand-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold-ring)]";

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1">
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
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="hero-enter">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37] sm:text-sm">
                  {t("subjects.eyebrow")}
                </p>
                <h1 className="mb-6 text-4xl font-bold leading-[1.08] md:text-5xl lg:text-[3.25rem]">
                  {t("subjects.heroTitle")}{" "}
                  <span className="text-[#D4AF37]">{t("subjects.heroTitleHighlight")}</span>
                </h1>
                <p className="mb-8 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg">
                  {t("subjects.heroSubtitle")}
                </p>

                <div className="mb-10 grid grid-cols-3 gap-2 sm:gap-4">
                  {benefits.slice(0, 3).map((item, index) => {
                    const Icon = heroFeatureIcons[index] ?? Target;
                    return (
                      <div
                        key={index}
                        className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-2.5 sm:p-4"
                      >
                        <Icon className="mb-1.5 h-4 w-4 text-[#D4AF37] sm:mb-2 sm:h-5 sm:w-5" />
                        <p className="text-[11px] font-semibold leading-tight sm:text-sm">{item.title}</p>
                        <p className="mt-1 hidden text-xs leading-snug text-gray-400 sm:block">
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

              <div className="hero-enter hero-enter-delay-2 relative hidden min-h-[360px] w-full max-w-lg lg:block lg:max-w-none" aria-hidden />
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="relative z-10 -mt-4 pb-4">
          <div className="mx-auto max-w-5xl px-4">
            <Card className={cn("border-0 p-4 shadow-xl sm:p-6", mt.card)}>
              <div className="grid grid-cols-4 gap-2 sm:gap-6">
                {stats.map((stat, index) => {
                  const Icon = statIcons[index];
                  return (
                    <div key={index} className="flex min-w-0 flex-col items-center gap-1.5 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
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

        {/* Subject cards */}
        <section className={cn("py-20", mt.sectionAlt)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center sm:mb-14">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-gold)]">
                {t("subjects.eyebrow")}
              </p>
              <h2 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl md:text-4xl">
                {t("subjects.subtitle", { defaultValue: "Choose your subject" })}
              </h2>
            </div>

            <div className="scrollbar-none mb-8 flex gap-2 overflow-x-auto pb-2 sm:mb-10 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => scrollToSubject(subject.id)}
                  className={subjectPillCls(subject.id)}
                >
                  {subject.title}
                </button>
              ))}
            </div>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
              {subjects.map((subject, index) => {
                const Icon = SUBJECT_ICONS[subject.id] ?? BookOpen;
                const { src: image, fallback: imageFallback } = resolveSubjectImage(subject.id, index);
                return (
                  <RevealOnScroll
                    key={subject.id}
                    delay={index * 80}
                    className="h-full"
                  >
                    <div id={`subject-${subject.id}`} className="h-full">
                    <Card
                      className={cn(
                        "group flex h-full flex-col overflow-hidden border border-[var(--border-default)] bg-[var(--card-background)] transition-shadow hover:shadow-xl"
                      )}
                    >
                      <div className="relative h-44 overflow-hidden sm:h-52">
                        <MarketingImage
                          src={image}
                          fallbackSrc={imageFallback}
                          alt={subject.title}
                          containerClassName="absolute inset-0"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/90 via-[#0D1B2A]/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37] shadow-lg">
                            <Icon className="h-6 w-6 text-[#0D1B2A]" />
                          </div>
                          <Badge variant="gold" className="bg-[#D4AF37]/90 text-[#0D1B2A]">
                            {subject.features[0]}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <h3 className="mb-2 text-lg font-bold text-[var(--foreground)] sm:text-xl">
                          {subject.title}
                        </h3>
                        <p className="mb-4 text-sm leading-relaxed text-[var(--text-muted)] sm:mb-5">
                          {subject.description}
                        </p>
                        <ul className="mb-5 space-y-2 sm:mb-6">
                          {subject.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-gold)]" />
                              <span className="text-[var(--foreground-secondary)]">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-auto flex flex-col gap-2 border-t border-[var(--border-default)] pt-5">
                          <button
                            type="button"
                            onClick={() => openBrowse(subject)}
                            className="btn-card-primary group"
                          >
                            <span className="min-w-0 truncate pr-1">
                              {t("subjectsPage.browseMaterials", { defaultValue: "View materials" })}
                            </span>
                            <span className="btn-card-primary-icon" aria-hidden>
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </button>
                          <Link
                            href="/consultation"
                            className={cn(
                              "btn-card-secondary",
                              isDark ? "btn-card-secondary--dark" : "btn-card-secondary--light"
                            )}
                          >
                            {t("subjectsPage.learnMore")}
                          </Link>
                        </div>
                      </div>
                    </Card>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why NextGrades */}
        <section className={cn("py-20", mt.section)}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-gold)]">
                {t("subjectsPage.whyEyebrow")}
              </p>
              <h2 className="text-3xl font-bold text-[var(--foreground)] md:text-4xl">
                {t("subjectsPage.whyTitle")}
              </h2>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
              {benefits.map((item, index) => {
                const Icon = benefitIcons[index];
                return (
                  <Card
                    key={index}
                    className={cn(
                      "min-w-0 p-3 text-center transition-transform hover:-translate-y-1 sm:p-6",
                      isDark ? "border-white/10 bg-[#0D1B2A]/50" : "border-gray-100"
                    )}
                  >
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/10 sm:mb-5 sm:h-16 sm:w-16 sm:rounded-2xl">
                      <Icon className="h-5 w-5 text-[#D4AF37] sm:h-8 sm:w-8" />
                    </div>
                    <h3 className={cn("mb-1 text-[11px] font-bold leading-tight sm:mb-2 sm:text-base", isDark ? "text-white" : "text-[#0D1B2A]")}>
                      {item.title}
                    </h3>
                    <p className={cn("hidden text-xs leading-relaxed sm:block sm:text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
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
            <p className="mb-8 text-lg text-gray-300">{t("subjectsPage.ctaDesc")}</p>
            <div className="flex w-full max-w-lg flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
              <Button variant="gold" size="lg" className="w-full sm:w-auto" href="/consultation">
                {t("subjectsPage.ctaButton")} <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                href="/programs"
                className="w-full border-white/40 text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] sm:w-auto"
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
                className={cn("mb-2 pr-10 text-xl font-bold sm:text-2xl", isDark ? "text-white" : "text-[#0D1B2A]")}
              >
                {browseSubject.title}
              </h3>
              <p className={cn("mb-6 text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                {t("subjectsPage.browseHint", { defaultValue: "Choose grade and semester to see matching materials." })}
              </p>
              <div className="space-y-4">
                <div>
                  <label className={cn("mb-2 block text-sm font-medium", isDark ? "text-white" : "text-[#0D1B2A]")}>
                    {t("subjectsPage.selectGrade", { defaultValue: "Grade" })}
                  </label>
                  <select value={browseGrade} onChange={(e) => setBrowseGrade(e.target.value)} className={inputCls}>
                    <option value="">{t("resources.filters.allGrades", { defaultValue: "All grades" })}</option>
                    {catalogClasses.map((c) => (
                      <option key={c.id} value={String(c.level)}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={cn("mb-2 block text-sm font-medium", isDark ? "text-white" : "text-[#0D1B2A]")}>
                    {t("subjectsPage.selectSemester", { defaultValue: "Semester" })}
                  </label>
                  <select value={browseSemester} onChange={(e) => setBrowseSemester(e.target.value)} className={inputCls}>
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
