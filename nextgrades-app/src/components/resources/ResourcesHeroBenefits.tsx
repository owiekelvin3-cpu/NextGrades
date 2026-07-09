"use client";

import { BookOpen, Download, Shield, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const BENEFIT_ICONS = [BookOpen, Shield, Star, Download] as const;

/** Value props under Bibliothek hero CTAs — matches subject-page benefit row. */
export function ResourcesHeroBenefits() {
  const { t } = useTranslation();

  const benefits = [
    t("resources.heroBenefitAgeAppropriate"),
    t("resources.heroBenefitProtected"),
    t("resources.heroBenefitStructured"),
    t("resources.heroBenefitDownloadable"),
  ];

  return (
    <div>
      <p className="max-w-xl text-sm leading-relaxed text-on-navy-muted md:text-base">
        {t("resources.heroBenefitsTagline")}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-6">
        {benefits.map((label, i) => {
          const Icon = BENEFIT_ICONS[i] ?? BookOpen;
          return (
            <div key={label} className="text-center sm:text-left">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 sm:mx-0">
                <Icon className="h-5 w-5 text-[#D4AF37]" aria-hidden />
              </div>
              <p className="text-sm font-semibold text-white">{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
