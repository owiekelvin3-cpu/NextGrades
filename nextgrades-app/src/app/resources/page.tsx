"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ResourcesHubExperience } from "@/components/resources/ResourcesHubExperience";
import { useTranslation } from "react-i18next";
import { GraduationCap, Users, BookOpen } from "lucide-react";
import { HUB_HERO_IMAGE } from "@/lib/resources/ui-config";
import { appShell } from "@/lib/theme/shell";

export default function ResourcesPage() {
  const { t } = useTranslation();

  return (
    <div className={appShell.marketingPageMuted}>
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#0D1B2A] text-white">
          <div className="absolute inset-0 opacity-40">
            <MarketingImage src={HUB_HERO_IMAGE} alt="" containerClassName="absolute inset-0" sizes="100vw" className="object-cover" priority />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/95 to-[#0D1B2A]/70" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-14">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-3">
                  {t("common.resources").toUpperCase()}
                </p>
                <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">{t("resources.heroTitle")}</h1>
                <p className="text-gray-300 text-lg mb-8 max-w-xl">{t("resources.heroSubtitle")}</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: GraduationCap, title: t("resources.heroFeature1"), desc: t("resources.heroFeature1Desc") },
                    { icon: Users, title: t("resources.heroFeature2"), desc: t("resources.heroFeature2Desc") },
                    { icon: BookOpen, title: t("resources.heroFeature3"), desc: t("resources.heroFeature3Desc") },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="text-center">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <p className="text-xs font-semibold">{title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative hidden h-80 lg:block">
                <MarketingImage src={HUB_HERO_IMAGE} alt={t("resources.heroTitle")} containerClassName="absolute inset-0 rounded-2xl" sizes="(max-width: 1024px) 0vw, 50vw" className="object-cover object-right rounded-2xl" priority />
              </div>
            </motion.div>
          </div>
        </section>

        <Suspense fallback={null}>
          <ResourcesHubExperience />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
