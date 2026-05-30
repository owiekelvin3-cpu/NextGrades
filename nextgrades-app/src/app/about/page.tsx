"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowRight, Award, Target, CheckCircle2 } from "lucide-react";

const storyImages = [
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1581091215396-f3f4f1032d35?w=400&h=300&fit=crop",
];

const teamImages = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
];

export default function AboutPage() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const storyPoints = useLocalizedContent<{ title: string; desc: string }[]>("aboutPage.story");
  const team = useLocalizedContent<{ name: string; role: string; bio: string }[]>("aboutPage.team");
  const communityTags = useLocalizedContent<string[]>("aboutPage.communityTags");
  const safeStory = Array.isArray(storyPoints) ? storyPoints : [];
  const safeTeam = Array.isArray(team) ? team : [];
  const safeTags = Array.isArray(communityTags) ? communityTags : [];

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-white"}`}>
      <Navbar />

      <main className="flex-1">
        <section
          className={
            theme === "dark"
              ? "bg-[#0D1B2A] relative overflow-hidden"
              : "bg-gradient-to-r from-[#0D1B2A] to-[#1a2f42] relative overflow-hidden"
          }
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                {t("about.heroTitle")}
                <br />
                <span className="text-[#D4AF37]">{t("about.heroTitle2")}</span>
              </h1>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">{t("about.heroSubtitle")}</p>
            </motion.div>
          </div>
        </section>

        <section className={theme === "dark" ? "py-20 bg-[#0D1B2A]" : "py-20 bg-white"}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm text-[#D4AF37] uppercase tracking-[0.3em] mb-4">
                {t("aboutPage.introEyebrow")}
              </p>
              <h2
                className={
                  theme === "dark"
                    ? "text-3xl md:text-4xl font-bold mb-6 text-white"
                    : "text-3xl md:text-4xl font-bold mb-6 text-[#0D1B2A]"
                }
              >
                {t("aboutPage.introTitle")}
              </h2>
              <p className={theme === "dark" ? "text-gray-300 text-lg" : "text-gray-600 text-lg"}>
                {t("aboutPage.introDesc")}
              </p>
            </motion.div>

            <div className="rounded-2xl overflow-hidden shadow-xl mb-16">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&h=500&fit=crop"
                alt={t("images.nextGradesLearning")}
                className="w-full h-80 md:h-96 object-cover"
              />
            </div>

            <div className="text-center mb-12">
              <h3
                className={
                  theme === "dark" ? "text-2xl font-bold mb-2 text-white" : "text-2xl font-bold mb-2 text-[#0D1B2A]"
                }
              >
                {t("aboutPage.journeyTitle")}
              </h3>
              <p className={theme === "dark" ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
                {t("aboutPage.journeySubtitle")}
              </p>
            </div>

            <div className="relative">
              <div
                className={
                  theme === "dark"
                    ? "absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-[#D4AF37]/30"
                    : "absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-[#0D1B2A]"
                }
              />
              {safeStory.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`flex items-center gap-8 mb-16 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#0D1B2A] rounded-[100px] transform rotate-1" />
                      <img
                        src={storyImages[index] ?? storyImages[0]}
                        alt={point.title}
                        className="relative w-full h-60 object-cover rounded-[100px] border-4 border-[#D4AF37]"
                      />
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center z-10">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                        {index % 2 === 0 ? (
                          <Award className="w-6 h-6 text-[#D4AF37]" />
                        ) : (
                          <Target className="w-6 h-6 text-[#D4AF37]" />
                        )}
                      </div>
                      <h4
                        className={
                          theme === "dark" ? "text-xl font-bold text-white" : "text-xl font-bold text-[#0D1B2A]"
                        }
                      >
                        {point.title}
                      </h4>
                    </div>
                    <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{point.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className={theme === "dark" ? "py-20 bg-[#112240]" : "py-20 bg-gray-50"}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className={
                theme === "dark"
                  ? "text-2xl font-bold mb-12 text-white text-center"
                  : "text-2xl font-bold mb-12 text-[#0D1B2A] text-center"
              }
            >
              {t("aboutPage.teamTitle")}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {safeTeam.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="mb-4 rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={teamImages[index] ?? teamImages[0]}
                      alt={`${member.name} – ${t("images.teamMember")}`}
                      className="w-full h-72 object-cover transform transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="bg-[#0D1B2A] text-white py-3 px-4 rounded-b-2xl">
                    <p className="font-bold">{member.name}</p>
                    <p className="text-sm text-gray-300">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-[#0D1B2A]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-8 bg-[#112240]">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("aboutPage.communityTitle")}</h2>
                  <p className="text-gray-300 text-lg">{t("aboutPage.communityDesc")}</p>
                </div>
                <Button variant="gold" size="xl" href="/consultation">
                  {t("aboutPage.communityCta")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-8">
                {safeTags.map((text, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
                    <span className="text-white font-semibold">{text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
