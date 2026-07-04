"use client";

import { BookOpen, GraduationCap, RefreshCw, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const FEATURE_ICONS = [BookOpen, RefreshCw, GraduationCap, ShieldCheck] as const;

/** Four library value props — shown under hero CTAs per product PDF. */
export function ResourcesHeroFeatures() {
  const { t } = useTranslation();

  const features = [
    { title: t("resources.features.feature1Title"), desc: t("resources.features.feature1Desc") },
    { title: t("resources.features.feature2Title"), desc: t("resources.features.feature2Desc") },
    { title: t("resources.features.feature3Title"), desc: t("resources.features.feature3Desc") },
    { title: t("resources.features.feature4Title"), desc: t("resources.features.feature4Desc") },
  ];

  return (
    <div className="mt-10 border-t border-white/10 pt-8">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-6">
        {features.map((feature, i) => {
          const Icon = FEATURE_ICONS[i] ?? BookOpen;
          return (
            <div key={feature.title} className="text-center sm:text-left">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 sm:mx-0">
                <Icon className="h-5 w-5 text-[#D4AF37]" aria-hidden />
              </div>
              <p className="text-sm font-bold text-white">{feature.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-on-navy-muted">{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
