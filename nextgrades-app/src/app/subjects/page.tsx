"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { SUBJECT_CARD_IMAGES } from "@/lib/marketing-images";

const subjectIcons = [Calculator, PenTool, BookOpen, Atom, FlaskConical];
const benefitIcons = [Users, BookOpen, Calendar, TrendingUp];
const statIcons = [Users, GraduationCap, Star, TrendingUp];

type SubjectItem = {
  id: string;
  title: string;
  description: string;
  features: string[];
};

export default function SubjectsPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const subjectsRaw = useLocalizedContent<SubjectItem[]>("subjectsPage.items");
  const benefitsRaw = useLocalizedContent<{ title: string; desc: string }[]>("subjectsPage.benefits");
  const statsRaw = useLocalizedContent<{ value: string; label: string }[]>("subjectsPage.stats");
  const subjects = Array.isArray(subjectsRaw) ? subjectsRaw : [];
  const benefits = Array.isArray(benefitsRaw) ? benefitsRaw : [];
  const stats = Array.isArray(statsRaw) ? statsRaw : [];

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Navbar />

      <main className="flex-1">
        <section className="pt-24 pb-20 bg-gradient-to-b from-[#0D1B2A] to-[#112240] text-white">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-[#D4AF37] uppercase tracking-[0.2em] text-sm font-semibold mb-4">{t("subjects.eyebrow")}</p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("subjects.heroTitle")}
              <br />
              <span className="text-[#D4AF37]">{t("subjects.heroTitleHighlight")}</span>
            </h1>
            <p className="text-xl text-gray-300">{t("subjects.heroSubtitle")}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subjects.map((subject, index) => {
                const Icon = subjectIcons[index] ?? BookOpen;
                const image = SUBJECT_CARD_IMAGES[index] ?? SUBJECT_CARD_IMAGES[0];
                return (
                  <Card key={subject.id} className="p-0 h-full overflow-hidden group">
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={image}
                        alt={subject.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute bottom-4 left-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#D4AF37] flex items-center justify-center">
                          <Icon className="w-7 h-7 text-[#0D1B2A]" />
                        </div>
                      </div>
                    </div>
                    <div className="p-7" style={{ backgroundColor: theme === "dark" ? "#112240" : "white" }}>
                      <h3 className="text-xl font-bold mb-3" style={{ color: theme === "dark" ? "white" : "#0D1B2A" }}>
                        {subject.title}
                      </h3>
                      <p className="mb-6 text-sm" style={{ color: theme === "dark" ? "#9CA3AF" : "#6B7280" }}>
                        {subject.description}
                      </p>
                      <ul className="space-y-2 mb-7">
                        {subject.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                            <span style={{ color: theme === "dark" ? "#D1D5DB" : "#4B5563" }}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button variant="gold" size="md" className="w-full" href="/consultation">
                        {t("subjectsPage.learnMore")} <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16" style={{ backgroundColor: theme === "dark" ? "#112240" : "white" }}>
          <div className="max-w-5xl mx-auto px-4 text-center mb-14">
            <p className="text-[#D4AF37] uppercase tracking-[0.2em] text-sm font-semibold mb-4">{t("subjectsPage.whyEyebrow")}</p>
            <h2 className="text-3xl font-bold" style={{ color: theme === "dark" ? "white" : "#0D1B2A" }}>
              {t("subjectsPage.whyTitle")}
            </h2>
          </div>
          <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-4 gap-6">
            {benefits.map((item, index) => {
              const Icon = benefitIcons[index];
              return (
                <Card key={index} className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                  <h3 className="font-bold mb-2" style={{ color: theme === "dark" ? "white" : "#0D1B2A" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ color: theme === "dark" ? "#9CA3AF" : "#6B7280" }}>
                    {item.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="py-16 bg-[#D4AF37] text-[#0D1B2A]">
          <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = statIcons[index];
              return (
                <div key={index} className="text-center">
                  <Icon className="w-6 h-6 mx-auto mb-4" />
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <p>{stat.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="py-16 bg-gradient-to-b from-[#0D1B2A] to-[#112240] text-white text-center">
          <h2 className="text-3xl font-bold mb-5">{t("subjectsPage.ctaTitle")}</h2>
          <p className="text-xl text-gray-300 mb-8">{t("subjectsPage.ctaDesc")}</p>
          <Button variant="gold" size="xl" href="/consultation">
            {t("subjectsPage.ctaButton")} <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
