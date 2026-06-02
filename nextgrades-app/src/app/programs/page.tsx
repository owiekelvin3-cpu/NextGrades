"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
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
import { useTheme } from "@/context/ThemeContext";
import { PROGRAMS_HERO_IMAGE, PROGRAMS_PAGE_CARD_IMAGES } from "@/lib/marketing-images";
import { MarketingImage } from "@/components/marketing/MarketingImage";

const statIcons = [GraduationCap, Users, Star];
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
};

function CompareCell({ value, dark }: { value: string | boolean; dark: boolean }) {
  if (value === true) {
    return <CheckCircle2 className="mx-auto h-5 w-5 text-[#D4AF37]" />;
  }
  return <span className={dark ? "text-sm text-gray-300" : "text-sm text-gray-600"}>{value}</span>;
}

export default function ProgramsPage() {
  const { theme } = useTheme();
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
    math: string;
  }>("programsPage.compareHeaders");
  const compareHeaders =
    compareHeadersRaw && typeof compareHeadersRaw === "object" && "features" in compareHeadersRaw
      ? compareHeadersRaw
      : { features: "Features", oneOnOne: "1:1", group: "Group", math: "Math Program" };

  const safePrograms = Array.isArray(programs) ? programs : [];
  const safeStats = Array.isArray(stats) ? stats : [];
  const safeHeroFeatures = Array.isArray(heroFeatures) ? heroFeatures : [];
  const safeCompareRows = Array.isArray(compareRows) ? compareRows : [];
  const safeCtaTags = Array.isArray(ctaTags) ? ctaTags : [];

  return (
    <div
      className={`marketing-page-root min-h-screen flex flex-col ${
        theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"
      }`}
    >
      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        <section
          className={`relative overflow-hidden pb-16 pt-site-nav md:pb-20 md:pt-28 ${
            theme === "dark" ? "bg-[#0D1B2A] text-white" : "bg-white text-[#0D1B2A]"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.15),transparent_45%)]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="hero-enter">
                <h1 className="mb-6 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
                  {t("programs.title")}
                  <br />
                  <span className="text-[#D4AF37]">{t("programs.subtitle")}</span>
                </h1>
                <p className={theme === "dark" ? "mb-8 max-w-xl text-base text-gray-300 sm:text-lg" : "mb-8 max-w-xl text-base text-gray-600 sm:text-lg"}>
                  {t("home.programsSection.subtitle")}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {safeHeroFeatures.slice(0, 3).map((feature, index) => {
                    const Icon = heroFeatureIcons[index] ?? Hexagon;
                    return (
                      <div key={index} className="flex items-start gap-2.5">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            theme === "dark" ? "border-[#D4AF37]/45 bg-[#D4AF37]/10" : "border-[#D4AF37]/35 bg-[#D4AF37]/8"
                          }`}
                        >
                          <Icon className="h-4 w-4 text-[#D4AF37]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{feature.title}</p>
                          <p className={theme === "dark" ? "mt-1 text-xs text-gray-400" : "mt-1 text-xs text-gray-500"}>
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="hero-enter hero-enter-delay-2">
                <div
                  className={`overflow-hidden rounded-2xl border shadow-2xl ${
                    theme === "dark" ? "border-white/10 shadow-black/45" : "border-gray-200/80 shadow-gray-300/35"
                  }`}
                >
                  <MarketingImage
                    src={programsHeroImage}
                    alt={t("images.studentStudying")}
                    containerClassName="h-[260px] w-full sm:h-[340px] md:h-[420px]"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="-mt-6 pb-2 md:-mt-8">
          <div className="mx-auto max-w-5xl px-4">
            <Card
              className={`rounded-2xl border p-4 shadow-xl sm:p-6 ${
                theme === "dark" ? "border-white/10 bg-[#112240] shadow-black/35" : "border-gray-200 bg-white shadow-gray-300/30"
              }`}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-7">
                {safeStats.map((stat, index) => {
                  const Icon = statIcons[index];
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full ${
                          theme === "dark" ? "bg-white/10" : "bg-[#0D1B2A]/8"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            theme === "dark" ? "text-[#D4AF37]" : "text-[#0D1B2A]"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-3xl font-bold ${
                            theme === "dark" ? "text-white" : "text-[#0D1B2A]"
                          }`}
                        >
                          {stat.number}
                        </p>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </section>

        <section className={`py-14 md:py-16 ${theme === "dark" ? "bg-[#112240]" : "bg-[#F7F8FA]"}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                {t("programsPage.sectionEyebrow")}
              </p>
              <h2 className={theme === "dark" ? "mb-2 text-3xl font-bold text-white sm:text-4xl" : "mb-2 text-3xl font-bold text-[#0D1B2A] sm:text-4xl"}>
                {t("programsPage.sectionTitle")}
              </h2>
              <p className={theme === "dark" ? "mx-auto max-w-2xl text-gray-400" : "mx-auto max-w-2xl text-gray-600"}>
                {t("programsPage.sectionDesc")}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {safePrograms.map((program, index) => {
                const featured = index === 2;
                return (
                  <Card
                    key={program.title}
                    className={`relative flex h-full flex-col overflow-hidden rounded-2xl border ${
                      featured
                        ? "border-2 border-[#D4AF37] shadow-xl"
                        : theme === "dark"
                          ? "border-white/10"
                          : "border-gray-200"
                    }`}
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
                      <h3
                        className={`mb-2 text-[1.45rem] font-bold leading-tight ${
                          theme === "dark" ? "text-white" : "text-[#0D1B2A]"
                        }`}
                      >
                        {program.title}
                      </h3>
                      <p className="mb-3 text-sm font-semibold text-[#D4AF37]">
                        {program.price}
                      </p>
                      <p className={theme === "dark" ? "mb-5 text-gray-400" : "mb-5 text-gray-600"}>
                        {program.description}
                      </p>
                      <ul className="mb-7 flex-1 space-y-2.5">
                        {program.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#D4AF37]" />
                            <span
                              className={`text-sm ${
                                theme === "dark" ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {feature}
                            </span>
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

        <section className={theme === "dark" ? "bg-[#0D1B2A] py-14 md:py-16" : "bg-white py-14 md:py-16"}>
          <div className="mx-auto max-w-6xl px-4">
            <h2 className={theme === "dark" ? "mb-8 text-center text-3xl font-bold text-white" : "mb-8 text-center text-3xl font-bold text-[#0D1B2A]"}>
              {t("programsPage.compareTitle")}
            </h2>
            <div
              className={`responsive-table-wrap rounded-xl border ${
                theme === "dark" ? "border-white/10" : "border-gray-200"
              }`}
            >
              <table className="w-full min-w-[640px] text-sm">
                <thead className={theme === "dark" ? "bg-[#112240]" : "bg-gray-50"}>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold sm:px-6 sm:py-4 sm:text-sm">{compareHeaders.features}</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold sm:px-6 sm:py-4 sm:text-sm">{compareHeaders.oneOnOne}</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold sm:px-6 sm:py-4 sm:text-sm">{compareHeaders.group}</th>
                    <th className="bg-[#D4AF37]/10 px-3 py-3 text-center text-xs font-semibold text-[#D4AF37] sm:px-6 sm:py-4 sm:text-sm">
                      {compareHeaders.math}
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    theme === "dark" ? "divide-white/10" : "divide-gray-100"
                  }`}
                >
                  {safeCompareRows.map((row, index) => (
                    <tr
                      key={index}
                      className={theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-50"}
                    >
                      <td
                        className={`px-3 py-3 text-xs font-medium sm:px-6 sm:py-4 sm:text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {row.label}
                      </td>
                      <td className="px-3 py-3 text-center sm:px-6 sm:py-4">
                        <CompareCell value={row.c1} dark={theme === "dark"} />
                      </td>
                      <td className="px-3 py-3 text-center sm:px-6 sm:py-4">
                        <CompareCell value={row.c2} dark={theme === "dark"} />
                      </td>
                      <td className="bg-[#D4AF37]/5 px-3 py-3 text-center sm:px-6 sm:py-4">
                        {row.c3 === true ? (
                          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] mx-auto" />
                        ) : (
                          <span
                            className={`text-sm font-medium ${
                              theme === "dark" ? "text-white" : "text-[#0D1B2A]"
                            }`}
                          >
                            {row.c3}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section
          className={`pb-14 pt-4 ${theme === "dark" ? "bg-[#112240] text-white" : "bg-[#FAFAFA] text-[#0D1B2A]"}`}
        >
          <div className="mx-auto max-w-6xl px-4">
            <Card
              className={`rounded-2xl border p-5 sm:p-8 ${
                theme === "dark"
                  ? "border-white/10 bg-[#0D1B2A]"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div className="flex items-center gap-4 sm:gap-6">
                  <Calendar className="h-14 w-14 text-[#D4AF37]" />
                  <div>
                    <h3 className="mb-2 text-2xl font-bold">{t("programsPage.ctaTitle")}</h3>
                    <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                      {t("programsPage.ctaDesc")}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4">
                      {safeCtaTags.map((tag, i) => (
                        <span
                          key={i}
                          className={`text-xs flex items-center gap-2 ${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
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
