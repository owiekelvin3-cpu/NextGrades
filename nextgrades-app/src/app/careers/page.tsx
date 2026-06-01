"use client";

import { useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { Users, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

const jobIcons = [BookOpen, Users];

export default function CareersPage() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();

  const jobs = useMemo(
    () => t("careersPage.jobs", { returnObjects: true }) as { title: string; description: string }[],
    [t, i18n.language]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-site-nav pb-16 md:pt-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className={`text-4xl font-bold text-center mb-4 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
            {t("careersPage.title")}
          </h1>
          <p className={`text-xl text-center mb-12 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {t("careersPage.subtitle")}
          </p>

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
