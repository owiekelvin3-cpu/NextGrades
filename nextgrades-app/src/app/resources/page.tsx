"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ResourcesExperience } from "@/components/resources/ResourcesExperience";
import { useTranslation } from "react-i18next";
import { Book, GraduationCap, Users, Star } from "lucide-react";

export default function ResourcesPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />

      <main className="flex-1">
        <section className="pt-28 pb-12 bg-[#0D1B2A] text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <div className="text-sm text-[#D4AF37] font-semibold mb-3">{t("common.resources").toUpperCase()}</div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{t("resources.heroTitle")}</h1>
                <p className="text-gray-300 text-lg mb-8">{t("resources.heroSubtitle")}</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="text-sm font-semibold">{t("resources.heroFeature1")}</div>
                    <div className="text-xs text-gray-400">{t("resources.heroFeature1Desc")}</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="text-sm font-semibold">{t("resources.heroFeature2")}</div>
                    <div className="text-xs text-gray-400">{t("resources.heroFeature2Desc")}</div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Book className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="text-sm font-semibold">{t("resources.heroFeature3")}</div>
                    <div className="text-xs text-gray-400">{t("resources.heroFeature3Desc")}</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop"
                    alt={t("images.studentStudying")}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute bottom-4 right-4 bg-white text-[#0D1B2A] px-5 py-4 rounded-xl shadow-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-5 h-5 text-[#D4AF37] fill-current" />
                    <span className="text-sm font-semibold">{t("resourcesPage.rating")}</span>
                  </div>
                  <div className="text-xs text-gray-600">{t("resourcesPage.ratingDesc")}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <ResourcesExperience />
      </main>

      <Footer />
    </div>
  );
}
