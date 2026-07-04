"use client";

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { ResourcesLibraryGate } from "@/components/resources/ResourcesLibraryGate";
import { ResourcesHeroBenefits } from "@/components/resources/ResourcesHeroBenefits";
import { MockupPageHero } from "@/components/mockup/MockupPageHero";
import { useTranslation } from "react-i18next";
import { useCmsImage } from "@/hooks/useCmsImage";
import { RESOURCES_HERO_IMAGE } from "@/lib/marketing-images";
import { ArrowRight, Crown } from "lucide-react";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

export default function ResourcesPage() {
  const { t } = useTranslation();
  const mt = useMarketingTheme();
  const heroImage = useCmsImage("cmsImages.resources.hero", RESOURCES_HERO_IMAGE);

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
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button variant="gold" size="md" href="/resources/upgrade" className="w-full rounded-xl py-4 text-base font-semibold sm:w-auto md:py-3">
              <Crown className="h-4 w-4" />
              {t("resources.unlockCta")}
            </Button>
            <Button variant="onDark" size="md" href="#faecher-entdecken" className="w-full rounded-xl py-4 text-base font-semibold sm:w-auto md:py-3">
              {t("resources.browseBySubject")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <ResourcesHeroBenefits />
        </MockupPageHero>

        <Suspense fallback={null}>
          <ResourcesLibraryGate />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
