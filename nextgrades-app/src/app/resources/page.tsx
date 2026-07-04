"use client";

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { ResourcesLibraryGate } from "@/components/resources/ResourcesLibraryGate";
import { MockupPageHero } from "@/components/mockup/MockupPageHero";
import { useTranslation } from "react-i18next";
import { useCmsImage } from "@/hooks/useCmsImage";
import { RESOURCES_HERO_IMAGE } from "@/lib/marketing-images";
import { ArrowRight, BookOpen, Crown, Download, Shield, Star } from "lucide-react";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

const HERO_BENEFIT_ICONS = [BookOpen, Shield, Star, Download] as const;

export default function ResourcesPage() {
  const { t } = useTranslation();
  const mt = useMarketingTheme();
  const heroImage = useCmsImage("cmsImages.resources.hero", RESOURCES_HERO_IMAGE);

  const heroBenefits = t("resources.heroBenefits", { returnObjects: true });
  const benefitLabels = Array.isArray(heroBenefits) ? (heroBenefits as string[]) : [];

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1">
        <MockupPageHero
          breadcrumbs={[
            { label: t("common.home"), href: "/" },
            { label: t("common.resources") },
          ]}
          eyebrow={t("common.resources").toUpperCase()}
          title={t("resources.heroTitle")}
          subtitle={t("resources.heroSubtitle")}
          heroImage={heroImage}
        >
          <div className="mt-8 flex flex-col gap-3">
            <Button variant="gold" size="md" href="/resources/upgrade" className="w-full rounded-xl py-4 text-base font-semibold md:w-auto md:py-3">
              <Crown className="h-4 w-4" />
              {t("resources.unlockCta")}
            </Button>
            <Button variant="onDark" size="md" href="/subjects" className="w-full rounded-xl py-4 text-base font-semibold md:w-auto md:py-3">
              {t("resources.browseBySubject")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {benefitLabels.length > 0 && (
            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="mb-6 max-w-xl text-sm leading-relaxed text-on-navy-muted md:text-base">
                {t("resources.heroBenefitsDesc")}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {benefitLabels.map((label, i) => {
                  const Icon = HERO_BENEFIT_ICONS[i] ?? BookOpen;
                  return (
                    <div key={label} className="text-center sm:text-left">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 sm:mx-0">
                        <Icon className="h-5 w-5 text-[#D4AF37]" aria-hidden />
                      </div>
                      <p className="text-xs font-medium text-white sm:text-sm">{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </MockupPageHero>

        <Suspense fallback={null}>
          <ResourcesLibraryGate />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
