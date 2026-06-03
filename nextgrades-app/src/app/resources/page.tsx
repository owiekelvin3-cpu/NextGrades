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
        <section className="relative overflow-hidden bg-[#0D1B2A] pb-16 text-white md:pb-20">
          <div className="absolute inset-0 opacity-40">
            <MarketingImage src={HUB_HERO_IMAGE} alt="" containerClassName="absolute inset-0" sizes="100vw" className="object-cover" priority />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/95 to-[#0D1B2A]/70" />
          <div className="relative mx-auto w-full min-w-0 max-w-7xl px-4 pt-site-nav sm:px-6 md:pt-28 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid min-w-0 items-center gap-10 lg:grid-cols-2">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-3">
                  {t("common.resources").toUpperCase()}
                </p>
                <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">{t("resources.heroTitle")}</h1>
                <p className="text-gray-300 text-lg mb-8 max-w-xl">{t("resources.heroSubtitle")}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                  {[
                    { icon: GraduationCap, title: t("resources.heroFeature1"), desc: t("resources.heroFeature1Desc") },
                    { icon: Users, title: t("resources.heroFeature2"), desc: t("resources.heroFeature2Desc") },
                    { icon: BookOpen, title: t("resources.heroFeature3"), desc: t("resources.heroFeature3Desc") },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left sm:flex-col sm:text-center">
                      <div className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 sm:mb-2">
                        <Icon className="h-5 w-5 text-[#D4AF37]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{desc}</p>
                      </div>
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
