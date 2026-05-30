"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { HOME_HERO_STUDENT_IMAGE, PROGRAM_CARD_IMAGES, HERO_STUDY_IMAGE } from "@/lib/marketing-images";
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
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#0D1B2A] pt-28 pb-20 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.08)_0%,_transparent_55%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37] sm:text-sm">
                  {t("home.heroEyebrow")}
                </p>
                <h1 className="mb-6 text-4xl font-bold leading-[1.08] md:text-5xl lg:text-[3.25rem]">
                  {t("home.heroTitle")}{" "}
                  <span className="text-[#D4AF37]">{t("home.heroTitleHighlight")}</span>
                </h1>
                <p className="mb-8 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg">
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
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-5">
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative mx-auto w-full max-w-lg lg:max-w-none"
              >
                <div className="relative aspect-[4/5] max-h-[520px] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 sm:aspect-[5/6] lg:aspect-auto lg:h-[480px]">
                  <Image
                    src={HOME_HERO_STUDENT_IMAGE}
                    alt={t("images.studentStudying")}
                    fill
                    priority
                    className="object-cover object-[center_20%]"
                    sizes="(max-width: 1024px) 90vw, 560px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/80 via-[#0D1B2A]/10 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0D1B2A]/20" />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="absolute -bottom-5 right-2 z-10 max-w-[280px] sm:right-4 lg:-bottom-6 lg:right-6"
                >
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
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Strip */}
        <section className={`py-12 ${theme === "dark" ? "bg-[#112240]" : "bg-[#FAFAFA]"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-5 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
                    {(() => {
                      const Icon = featureIcons[index];
                      return <Icon className="w-6 h-6 text-[#D4AF37]" />;
                    })()}
                  </div>
                  <h3 className={`text-base font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>{feature.title}</h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className={`py-20 ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-white"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                {t("home.programsSection.title")}
              </h2>
              <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {t("home.programsSection.subtitle")}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {programs.map((program, index) => {
                const featured = index === 2;
                return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="h-full"
                >
                  <Card className={`p-0 h-full flex flex-col relative overflow-hidden transition-all duration-300 ${
                    featured ? "border-2 border-[#D4AF37] shadow-xl" : "border border-gray-100"
                  }`}>
                    {featured && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-[#D4AF37] text-[#0D1B2A] px-3 py-1 text-xs font-semibold uppercase">
                          {t("home.mostPopular")}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Program images */}
                    <div className="h-44 relative overflow-hidden">
                      <img
                        src={PROGRAM_CARD_IMAGES[index] ?? PROGRAM_CARD_IMAGES[0]}
                        alt={program.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                        {program.title}
                      </h3>
                      
                      <ul className="flex-1 space-y-3 mb-6">
                        {program.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                            <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Link href="/programs" className={`font-semibold flex items-center gap-2 transition-all group ${
                        featured ? "text-[#D4AF37]" : (theme === "dark" ? "text-white" : "text-[#0D1B2A]")
                      }`}>
                        {t("home.learnMore")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
              })}
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className={`py-14 ${theme === "dark" ? "bg-[#112240] text-white" : "bg-[#FAFAFA] text-[#0D1B2A]"}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${theme === "dark" ? "bg-white/10" : "bg-[#D4AF37]/20"}`}>
                    {(() => {
                      const Icon = statIcons[index];
                      return <Icon className="w-6 h-6 text-[#D4AF37]" />;
                    })()}
                  </div>
                  <p className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>{stat.number}</p>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Preview Section */}
        <section className={`py-12 ${theme === "dark" ? "bg-[#112240]" : "bg-[#FAFAFA]"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Hero Image Background */}
              <div className="relative">
                <img
                  src={HERO_STUDY_IMAGE}
                  alt={t("images.modernLearning")}
                  className="w-full h-[500px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/80 via-[#0D1B2A]/40 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                      >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                          {t("home.platform.title")}
                        </h1>
                        <p className="text-gray-200 text-lg mb-8">
                          {t("home.platform.subtitle")}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button variant="gold" size="md" href="/resources">
                            {t("home.platform.discover")}
                          </Button>
                          <Button variant="outline" size="md" href="/about" className="border-white text-white hover:bg-white hover:text-[#0D1B2A]">
                            {t("home.platform.learnMore")}
                          </Button>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                      >
                        <div className="space-y-4">
                          {/* Info Cards */}
                          <div className="bg-white rounded-2xl p-6 shadow-xl">
                            <h3 className="text-[#0D1B2A] font-semibold text-sm mb-2">
                              {t("home.platform.trackProgress")}
                            </h3>
                            <div className="flex gap-4">
                              <img
                                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=100&h=100&fit=crop"
                                alt={t("images.studentStudying")}
                                className="w-16 h-16 rounded-xl object-cover"
                              />
                              <div className="flex-1">
                                <p className="text-gray-600 text-sm">
                                  {t("home.platform.trackProgressDesc")}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl p-4 shadow-xl">
                              <div className="text-3xl font-bold text-[#0D1B2A]">{t("home.platform.availability")}</div>
                              <div className="text-sm text-gray-500">{t("home.platform.availabilityLabel")}</div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-xl">
                              <div className="text-3xl font-bold text-[#0D1B2A]">{stats[2]?.number ?? "1,000+"}</div>
                              <div className="text-sm text-gray-500">{t("home.platform.materials")}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={HERO_STUDY_IMAGE}
              alt=""
              aria-hidden
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/90 via-[#0D1B2A]/70 to-[#0D1B2A]/90" />
          </div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white">
                {t("home.testimonials.title")}
              </h2>
            </motion.div>

            <div className="relative">
              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-8 h-full bg-white/10 backdrop-blur-xl border border-white/20">
                      <div className="flex items-center gap-1 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
                        ))}
                      </div>
                      <p className="mb-6 leading-relaxed text-white">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/30 flex items-center justify-center">
                          <span className="text-[#D4AF37] font-bold text-sm">
                            {testimonial.name.charAt(0)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-200">{testimonial.name}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`py-16 ${theme === "dark" ? "bg-[#112240] text-white" : "bg-[#FAFAFA] text-[#0D1B2A]"}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === "dark" ? "bg-white/10" : "bg-[#D4AF37]/20"}`}>
                  <Calendar className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {t("home.cta.title")}
                  </h3>
                  <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t("home.cta.subtitle")}
                  </p>
                </div>
              </div>
              <Button variant="gold" size="lg" href="/consultation">
                {t("home.cta.button")}
              </Button>
            </motion.div>
          </div>
        </section>
        </main>

      <Footer />
    </div>
  );
}
