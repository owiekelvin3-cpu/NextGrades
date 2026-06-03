"use client";

import { useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { Users, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCmsImage } from "@/hooks/useCmsImage";
import { CAREERS_HERO_IMAGE } from "@/lib/marketing-images";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";

const jobIcons = [BookOpen, Users];

export default function CareersPage() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const careersHeroImage = useCmsImage("cmsImages.careers.hero", CAREERS_HERO_IMAGE);

  const jobs = useMemo(
    () => t("careersPage.jobs", { returnObjects: true }) as { title: string; description: string }[],
    [t, i18n.language]
  );

  return (
    <div className={`marketing-page-root min-h-screen flex flex-col ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-white pb-12 pt-site-nav text-[#0D1B2A] md:pb-16 md:pt-28 dark:bg-[#0D1B2A] dark:text-white">
          <MarketingHeroBlend
            src={careersHeroImage}
            alt=""
            variant={theme === "dark" ? "dark-split-right" : "light-split-right"}
            backgroundColor={theme === "dark" ? "#0D1B2A" : "#FFFFFF"}
            priority
          />
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">{t("careersPage.title")}</h1>
            <p className={`mb-10 max-w-2xl text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              {t("careersPage.subtitle")}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {jobs.map((job, index) => {
              const Icon = jobIcons[index] ?? BookOpen;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1">
                      <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                        {job.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{job.description}</p>
                      <Button variant="gold" size="md" href={`/contact?role=${encodeURIComponent(job.title)}`}>
                        {t("careersPage.applyNow")}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
