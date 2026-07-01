"use client";

import { Suspense, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { ResourcesLibraryGate } from "@/components/resources/ResourcesLibraryGate";
import { MockupPageHero } from "@/components/mockup/MockupPageHero";
import { MockupFeatureStrip } from "@/components/mockup/MockupFeatureStrip";
import { useTranslation } from "react-i18next";
import { useCmsImage } from "@/hooks/useCmsImage";
import { RESOURCES_HERO_IMAGE } from "@/lib/marketing-images";
import { BookOpen, Sparkles, Shield, Layers, ArrowRight, Crown } from "lucide-react";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { cn } from "@/lib/utils";

const BENEFIT_ICONS = [BookOpen, Sparkles, Shield, Layers];

export default function ResourcesPage() {
  const { t, i18n } = useTranslation();
  const mt = useMarketingTheme();
  const heroImage = useCmsImage("cmsImages.resources.hero", RESOURCES_HERO_IMAGE);

  const benefits = useMemo(() => {
    const data = t("resources.benefits", { returnObjects: true });
    const items = Array.isArray(data) ? (data as { title: string; desc: string }[]) : [];
    return items.map((item, i) => ({ ...item, icon: BENEFIT_ICONS[i] ?? BookOpen }));
  }, [t, i18n.language]);

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
        </MockupPageHero>

        {benefits.length > 0 && (
          <MockupFeatureStrip items={benefits} columns={4} className={mt.sectionAlt} />
        )}

        <Suspense fallback={null}>
          <ResourcesLibraryGate />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
