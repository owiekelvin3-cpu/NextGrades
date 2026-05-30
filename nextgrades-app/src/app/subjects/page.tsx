"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
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
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { SUBJECTS_HERO_IMAGE, getSubjectImage } from "@/lib/marketing-images";
import { cn } from "@/lib/utils";

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
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
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

  const isDark = theme === "dark";

  const openBrowse = (subject: SubjectItem) => {
    setBrowseSubject(subject);
    setBrowseGrade("");
    setBrowseSemester("");
  };

  const goToResources = () => {
    if (!browseSubject) return;
    const params = new URLSearchParams({ subject: browseSubject.id });
    if (browseGrade) params.set("class", browseGrade);
    if (browseSemester) params.set("semester", browseSemester);
    router.push(`/resources?${params.toString()}`);
  };

  const inputCls = cn(
    "w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20",
    isDark ? "border-white/10 bg-[#0D1B2A] text-white" : "border-gray-200 bg-white text-[#0D1B2A]"
  );

  return (
    <div className={cn("flex min-h-screen flex-col", isDark ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]")}>
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section
          className={cn(
            "relative overflow-hidden pt-28 pb-16",
            isDark ? "bg-[#0D1B2A] text-white" : "bg-white text-[#0D1B2A]"
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.12)_0%,_transparent_55%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37] sm:text-sm">
                  {t("subjects.eyebrow")}
                </p>
                <h1 className="mb-6 text-4xl font-bold leading-[1.08] md:text-5xl lg:text-[3.25rem]">
                  {t("subjects.heroTitle")}{" "}
                  <span className="text-[#D4AF37]">{t("subjects.heroTitleHighlight")}</span>
                </h1>
                <p className={cn("mb-8 max-w-xl text-base leading-relaxed sm:text-lg", isDark ? "text-gray-300" : "text-gray-600")}>
                  {t("subjects.heroSubtitle")}
                </p>

                <div className="mb-10 grid gap-4 sm:grid-cols-3">
                  {benefits.slice(0, 3).map((item, index) => {
                    const Icon = heroFeatureIcons[index] ?? Target;
                    return (
                      <div
                        key={index}
                        className={cn(
                          "rounded-xl border p-4",
                          isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-[#FAFAFA]"
                        )}
                      >
                        <Icon className="mb-2 h-5 w-5 text-[#D4AF37]" />
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className={cn("mt-1 text-xs", isDark ? "text-gray-400" : "text-gray-500")}>{item.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <Button variant="gold" size="lg" href="/consultation">
                  {t("subjectsPage.ctaButton")} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative mx-auto w-full max-w-lg lg:max-w-none"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-[#D4AF37]/20 lg:aspect-auto lg:h-[420px]">
                  <Image
                    src={SUBJECTS_HERO_IMAGE}
                    alt={t("subjects.title")}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 90vw, 560px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/70 via-transparent to-transparent" />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-xs"
                >
                  <Card className="border border-[#D4AF37]/30 bg-[#0D1B2A]/95 p-4 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/20">
                        <Star className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{stats[2]?.value ?? "4.9/5"}</p>
                        <p className="text-sm text-gray-400">
                          {stats[2]?.label ?? "rating from parents & students"}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="relative z-10 -mt-4 pb-4">
          <div className="mx-auto max-w-5xl px-4">
            <Card className={cn("border-0 p-6 shadow-xl", isDark ? "bg-[#112240]" : "bg-white")}>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                {stats.map((stat, index) => {
                  const Icon = statIcons[index];
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                          isDark ? "bg-[#D4AF37]/15" : "bg-[#D4AF37]/10"
                        )}
                      >
                        <Icon className="h-6 w-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-[#0D1B2A]")}>{stat.value}</p>
                        <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </section>

        {/* Subject cards */}
        <section className={cn("py-20", isDark ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]")}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
                {t("subjects.eyebrow")}
              </p>
              <h2 className={cn("text-3xl font-bold md:text-4xl", isDark ? "text-white" : "text-[#0D1B2A]")}>
                {t("subjects.subtitle", { defaultValue: "Choose your subject" })}
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {subjects.map((subject, index) => {
                const Icon = SUBJECT_ICONS[subject.id] ?? BookOpen;
                const image = getSubjectImage(subject.id, index);
                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                  >
                    <Card
                      className={cn(
                        "group h-full overflow-hidden border transition-shadow hover:shadow-xl",
                        isDark ? "border-white/10 bg-[#112240]" : "border-gray-100 bg-white"
                      )}
                    >
                      <div className="relative h-52 overflow-hidden">
                        <Image
                          src={image}
                          alt={subject.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
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

                      <div className="p-6">
                        <h3 className={cn("mb-2 text-xl font-bold", isDark ? "text-white" : "text-[#0D1B2A]")}>
                          {subject.title}
                        </h3>
                        <p className={cn("mb-5 text-sm leading-relaxed", isDark ? "text-gray-400" : "text-gray-600")}>
                          {subject.description}
                        </p>
                        <ul className="mb-6 space-y-2">
                          {subject.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                              <span className={isDark ? "text-gray-300" : "text-gray-600"}>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Button variant="gold" size="md" className="flex-1" onClick={() => openBrowse(subject)}>
                            {t("subjectsPage.browseMaterials", { defaultValue: "Browse materials" })}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="md" className="flex-1" href="/consultation">
                            {t("subjectsPage.learnMore")}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why NextGrades */}
        <section className={cn("py-20", isDark ? "bg-[#112240]" : "bg-white")}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
                {t("subjectsPage.whyEyebrow")}
              </p>
              <h2 className={cn("text-3xl font-bold md:text-4xl", isDark ? "text-white" : "text-[#0D1B2A]")}>
                {t("subjectsPage.whyTitle")}
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((item, index) => {
                const Icon = benefitIcons[index];
                return (
                  <Card
                    key={index}
                    className={cn(
                      "p-6 text-center transition-transform hover:-translate-y-1",
                      isDark ? "border-white/10 bg-[#0D1B2A]/50" : "border-gray-100"
                    )}
                  >
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37]/10">
                      <Icon className="h-8 w-8 text-[#D4AF37]" />
                    </div>
                    <h3 className={cn("mb-2 font-bold", isDark ? "text-white" : "text-[#0D1B2A]")}>{item.title}</h3>
                    <p className={cn("text-sm leading-relaxed", isDark ? "text-gray-400" : "text-gray-600")}>{item.desc}</p>
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
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="xl" href="/consultation">
                {t("subjectsPage.ctaButton")} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
              >
                {t("home.explorePrograms", { defaultValue: "Explore programs" })}
              </Link>
            </div>
          </div>
        </section>

        {browseSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <Card className={cn("relative w-full max-w-md p-6", isDark ? "bg-[#112240] border-white/10" : "bg-white")}>
              <button
                type="button"
                onClick={() => setBrowseSubject(null)}
                className={cn("absolute right-4 top-4 rounded-full p-1", isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-[#0D1B2A]")}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className={cn("mb-2 text-xl font-bold", isDark ? "text-white" : "text-[#0D1B2A]")}>
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
                <Button variant="gold" className="w-full" onClick={goToResources}>
                  {t("subjectsPage.viewResources", { defaultValue: "View resources" })}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
