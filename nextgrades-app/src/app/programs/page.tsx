"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import {
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  Calendar,
  GraduationCap,
  Award,
  Clock,
  BookOpen,
  Target,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";

import { HERO_STUDY_IMAGE, PROGRAM_CARD_IMAGES } from "@/lib/marketing-images";
import { useMarketingTheme } from "@/lib/marketing-theme";

const statIcons = [GraduationCap, Users, Star];
const heroFeatureIcons = [Award, Target, Clock];
const compareRowIcons = [Users, Target, Calendar, BookOpen, GraduationCap, Star];

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

function CompareCell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  const mt = useMarketingTheme();
  if (value === true) {
    return <CheckCircle2 className="mx-auto h-5 w-5 text-[#D4AF37]" strokeWidth={2} />;
  }
  return (
    <span className={`text-sm ${highlight ? `font-medium ${mt.heading}` : mt.body}`}>
      {value}
    </span>
  );
}

export default function ProgramsPage() {
  const { t } = useTranslation();
  const mt = useMarketingTheme();
  const heroFeatures = useLocalizedContent<{ title: string; desc: string }[]>("programsPage.heroFeatures");
  const stats = useLocalizedContent<{ number: string; label: string }[]>("programsPage.stats");
  const programs = useLocalizedContent<ProgramItem[]>("programsPage.items");
  const compareRows = useLocalizedContent<CompareRow[]>("programsPage.compareRows");
  const ctaTags = useLocalizedContent<string[]>("programsPage.ctaTags");
  const compareHeaders = useLocalizedContent<{
    features: string;
    oneOnOne: string;
    group: string;
    math: string;
  }>("programsPage.compareHeaders");

  return (
    <div className={`flex min-h-screen flex-col ${mt.page}`}>
      <Navbar />

      <main className="flex-1">
        {/* Hero — text left, image right */}
        <section className="relative overflow-hidden bg-[#0D1B2A]">
          {/* Mobile / tablet: image at top */}
          <div className="relative h-56 w-full sm:h-72 lg:hidden">
            <Image
              src={HERO_STUDY_IMAGE}
              alt={t("images.studentStudying", { defaultValue: "Student studying" })}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B2A]/10 to-[#0D1B2A]/50" />
          </div>

          <div className="mx-auto grid max-w-7xl lg:grid-cols-2 lg:items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative z-10 px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-32"
            >
              <nav className="mb-6 flex items-center gap-2 text-sm text-gray-300">
                <Link href="/" className="transition-colors hover:text-[#D4AF37]">
                  {t("common.home", { defaultValue: "Startseite" })}
                </Link>
                <ChevronRight className="h-4 w-4 text-gray-500" />
                <span className="text-white">{t("common.programs")}</span>
              </nav>

              <h1 className="mb-5 text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-[3.25rem]">
                {t("programs.title")}{" "}
                <span className="text-[#D4AF37]">{t("programs.subtitle")}</span>
              </h1>

              <p className="mb-10 max-w-xl text-base leading-relaxed text-gray-200 sm:text-lg">
                {t("programsPage.sectionDesc")}
              </p>

              <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {heroFeatures.map((feature, index) => {
                  const Icon = heroFeatureIcons[index] ?? Award;
                  return (
                    <div key={feature.title} className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10">
                        <Icon className="h-5 w-5 text-[#D4AF37]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{feature.title}</p>
                        <p className="text-xs leading-relaxed text-gray-400">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Desktop hero image */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative hidden min-h-[520px] lg:block"
            >
              <Image
                src={HERO_STUDY_IMAGE}
                alt={t("images.studentStudying", { defaultValue: "Student studying at desk" })}
                fill
                priority
                className="object-cover object-center"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0D1B2A]/5 to-[#0D1B2A]/40" />
            </motion.div>
          </div>
        </section>

        {/* Floating stats bar */}
        <section className="relative z-20 -mt-14 px-4 sm:px-6 lg:px-8">
          <div className={`mx-auto max-w-4xl rounded-2xl px-6 py-8 shadow-xl sm:px-10 ${mt.card}`}>
            <div className="grid gap-8 sm:grid-cols-3">
              {stats.map((stat, index) => {
                const Icon = statIcons[index] ?? Star;
                return (
                  <div key={stat.label} className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/10">
                      <Icon className="h-6 w-6 text-[#D4AF37]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold sm:text-3xl ${mt.heading}`}>{stat.number}</p>
                      <p className={`text-xs sm:text-sm ${mt.body}`}>{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Program cards */}
        <section className={`py-24 ${mt.section}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14 text-center"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
                {t("programsPage.sectionEyebrow")}
              </p>
              <h2 className={`mb-4 text-3xl font-bold md:text-4xl ${mt.heading}`}>
                {t("programsPage.sectionTitle")}
              </h2>
              <p className={`mx-auto max-w-2xl ${mt.body}`}>{t("programsPage.sectionDesc")}</p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
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
                    className={`flex h-full flex-col overflow-hidden rounded-2xl transition-shadow hover:shadow-xl ${mt.card} ${
                      featured ? "ring-2 ring-[#D4AF37]" : ""
                    }`}
                  >
                    <div className="relative h-52 overflow-hidden">
                      <span
                        className={`absolute left-4 top-4 z-10 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                          featured
                            ? "bg-[#0D1B2A] text-white"
                            : mt.isDark
                              ? "bg-[#112240]/95 text-white shadow-sm"
                              : "bg-white/95 text-[#0D1B2A] shadow-sm"
                        }`}
                      >
                        {program.type}
                      </span>
                      <Image
                        src={PROGRAM_CARD_IMAGES[index]}
                        alt={program.title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {featured && (
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/70 to-transparent" />
                      )}
                    </div>

                    <div className={`flex flex-1 flex-col p-6 ${mt.cardInner}`}>
                      <h3 className={`mb-2 text-xl font-bold ${mt.heading}`}>{program.title}</h3>
                      <p className={`mb-5 text-sm ${mt.body}`}>{program.description}</p>
                      <ul className="mb-8 flex-1 space-y-2.5">
                        {program.features.map((feature) => (
                          <li key={feature} className={`flex items-start gap-2.5 text-sm ${mt.body}`}>
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/consultation"
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all ${
                          featured
                            ? "bg-gradient-to-r from-[#D4AF37] to-[#F5A623] text-[#0D1B2A] shadow-lg hover:shadow-xl"
                            : "bg-[#0D1B2A] text-white hover:bg-[#1a2e4a]"
                        }`}
                      >
                        {t("programsPage.learnMore")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className={`py-20 ${mt.sectionAlt}`}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className={`mb-10 text-center text-3xl font-bold ${mt.heading}`}>
              {t("programsPage.compareTitle")}
            </h2>

            <div className={`overflow-hidden rounded-2xl shadow-sm ${mt.tableWrap}`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className={`border-b ${mt.isDark ? "border-white/10" : "border-gray-100"} ${mt.tableHead}`}>
                      <th className="px-5 py-4 text-left text-sm font-semibold">
                        {compareHeaders.features}
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-semibold sm:text-sm">
                        {compareHeaders.oneOnOne}
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-semibold sm:text-sm">
                        {compareHeaders.group}
                      </th>
                      <th className="bg-[#D4AF37]/10 px-4 py-4 text-center text-xs font-semibold sm:text-sm">
                        {compareHeaders.math}
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${mt.isDark ? "divide-white/10" : "divide-gray-100"}`}>
                    {compareRows.map((row, index) => {
                      const RowIcon = compareRowIcons[index] ?? CheckCircle2;
                      const isEven = index % 2 === 0;
                      return (
                        <tr
                          key={row.label}
                          className={isEven ? mt.tableRowEven : mt.tableRowOdd}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <RowIcon className="h-4 w-4 shrink-0 text-[#D4AF37]" strokeWidth={1.5} />
                              <span className={`text-sm font-medium ${mt.heading}`}>{row.label}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <CompareCell value={row.c1} />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <CompareCell value={row.c2} />
                          </td>
                          <td className="bg-[#D4AF37]/5 px-4 py-4 text-center">
                            <CompareCell value={row.c3} highlight />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className={`px-4 py-20 sm:px-6 lg:px-8 ${mt.section}`}>
          <div className="mx-auto max-w-5xl rounded-2xl bg-[#0D1B2A] px-6 py-10 sm:px-10">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/15">
                  <Calendar className="h-8 w-8 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                    {t("programsPage.ctaTitle")}
                  </h3>
                  <p className="mb-5 max-w-lg text-sm text-gray-300 sm:text-base">
                    {t("programsPage.ctaDesc")}
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {ctaTags.map((tag) => (
                      <span key={tag} className="flex items-center gap-2 text-xs text-gray-300 sm:text-sm">
                        <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                variant="gold"
                size="lg"
                href="/consultation"
                className="shrink-0 whitespace-nowrap"
              >
                {t("programsPage.ctaButton")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
