"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Zap,
  Calendar,
  Award,
  Star,
  CheckCircle2,
  ArrowRight,
  Clock,
  GraduationCap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useCmsImages } from "@/hooks/useCmsImage";
import { useTheme } from "@/context/ThemeContext";
import { PROGRAMS_HERO_IMAGE, PROGRAMS_PAGE_CARD_IMAGES } from "@/lib/marketing-images";
import { MarketingImage } from "@/components/marketing/MarketingImage";

const statIcons = [GraduationCap, Users, Star];
const heroFeatureIcons = [Award, Zap, Clock];

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

function CompareCell({ value }: { value: string | boolean }) {
  if (value === true) {
    return <CheckCircle2 className="w-5 h-5 text-[#D4AF37] mx-auto" />;
  }
  return <span className="text-sm text-gray-600 dark:text-gray-300">{value}</span>;
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
      className={`min-h-screen flex flex-col ${
        theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"
      }`}
    >
      <Navbar />

      <main className="flex-1">
        <section
          className={`pt-32 pb-12 relative overflow-hidden ${
            theme === "dark" ? "bg-[#0D1B2A] text-white" : "bg-white text-[#0D1B2A]"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <div
                  className={`uppercase tracking-[0.2em] text-sm font-semibold mb-4 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {t("programsPage.breadcrumb")}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  {t("programs.title")}
                  <br />
                  <span className="text-[#D4AF37]">{t("programs.subtitle")}</span>
                </h1>
                <p
                  className={`text-lg mb-8 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {t("home.programsSection.subtitle")}
                </p>
                <div className="flex flex-wrap gap-6 mb-10">
                  {safeHeroFeatures.map((feature, index) => {
                    const Icon = heroFeatureIcons[index];
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37]/50 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div>
                          <p className="font-semibold">{feature.title}</p>
                          <p
                            className={`text-xs ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="gold" size="lg" href="/consultation">
                  {t("programsPage.freeConsultation")} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="rounded-2xl h-[450px] overflow-hidden">
                  <MarketingImage
                    src={programsHeroImage}
                    alt={t("images.studentStudying")}
                    containerClassName="h-full w-full"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-6 -mt-6">
          <div className="max-w-4xl mx-auto px-4">
            <Card className="p-6 shadow-xl border-0">
              <div className="grid md:grid-cols-3 gap-8">
                {safeStats.map((stat, index) => {
                  const Icon = statIcons[index];
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          theme === "dark" ? "bg-white/10" : "bg-[#0D1B2A]/10"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
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

        <section className={`py-20 ${theme === "dark" ? "bg-[#112240]" : "bg-[#FAFAFA]"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-[#D4AF37] uppercase tracking-[0.2em] text-sm font-semibold mb-4">
                {t("programsPage.sectionEyebrow")}
              </p>
              <h2
                className={`text-3xl md:text-4xl font-bold mb-3 ${
                  theme === "dark" ? "text-white" : "text-[#0D1B2A]"
                }`}
              >
                {t("programsPage.sectionTitle")}
              </h2>
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                {t("programsPage.sectionDesc")}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {safePrograms.map((program, index) => {
                const featured = index === 2;
                return (
                  <Card
                    key={program.title}
                    className={`relative p-0 h-full flex flex-col overflow-hidden ${
                      featured
                        ? "border-2 border-[#D4AF37] shadow-2xl scale-[1.02]"
                        : theme === "dark"
                          ? "border border-white/10"
                          : "border border-gray-200"
                    }`}
                  >
                    {featured && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-[#D4AF37] text-[#0D1B2A] px-3 py-1 text-xs font-bold uppercase">
                          {t("programsPage.mostPopular")}
                        </Badge>
                      </div>
                    )}
                    <div className="h-48 relative overflow-hidden">
                      <Badge className="absolute top-4 left-4 z-10 bg-[#0D1B2A] text-white px-3 py-1 text-xs">
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
                    <div className="p-6 flex flex-col flex-1">
                      <h3
                        className={`text-xl font-bold mb-3 ${
                          theme === "dark" ? "text-white" : "text-[#0D1B2A]"
                        }`}
                      >
                        {program.title}
                      </h3>
                      <p className={`mb-2 text-sm font-semibold text-[#D4AF37] ${theme === "dark" ? "" : ""}`}>
                        {program.price}
                      </p>
                      <p className={`mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {program.description}
                      </p>
                      <ul className="flex-1 space-y-3 mb-8">
                        {program.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
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
                      <Button variant={featured ? "gold" : "dark"} size="lg" className="w-full" href="/pricing">
                        {t("programsPage.learnMore")} <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className={`py-20 ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-white"}`}>
          <div className="max-w-5xl mx-auto px-4">
            <h2
              className={`text-3xl font-bold mb-12 text-center ${
                theme === "dark" ? "text-white" : "text-[#0D1B2A]"
              }`}
            >
              {t("programsPage.compareTitle")}
            </h2>
            <div
              className={`overflow-hidden rounded-xl border ${
                theme === "dark" ? "border-white/10" : "border-gray-200"
              }`}
            >
              <table className="w-full">
                <thead className={theme === "dark" ? "bg-[#112240]" : "bg-gray-50"}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">{compareHeaders.features}</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">{compareHeaders.oneOnOne}</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">{compareHeaders.group}</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold bg-[#D4AF37]/10 text-[#D4AF37]">
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
                        className={`px-6 py-4 text-sm font-medium ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {row.label}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <CompareCell value={row.c1} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <CompareCell value={row.c2} />
                      </td>
                      <td className="px-6 py-4 text-center bg-[#D4AF37]/5">
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
          className={`py-12 ${theme === "dark" ? "bg-[#112240] text-white" : "bg-[#FAFAFA] text-[#0D1B2A]"}`}
        >
          <div className="max-w-5xl mx-auto px-4">
            <Card
              className={`p-8 ${
                theme === "dark"
                  ? "bg-[#0D1B2A] border border-white/10"
                  : "bg-white border border-gray-100"
              }`}
            >
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <Calendar className="w-16 h-16 text-[#D4AF37]" />
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{t("programsPage.ctaTitle")}</h3>
                    <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                      {t("programsPage.ctaDesc")}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-4">
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
                <Button variant="gold" size="xl" href="/consultation">
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
