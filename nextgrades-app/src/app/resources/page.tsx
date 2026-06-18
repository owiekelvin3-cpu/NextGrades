"use client";

import { Suspense, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ResourcesMarketplaceExperience } from "@/components/resources/ResourcesMarketplaceExperience";
import { MockupPageHero } from "@/components/mockup/MockupPageHero";
import { MockupFeatureStrip } from "@/components/mockup/MockupFeatureStrip";
import { useTranslation } from "react-i18next";
import { useCmsImage } from "@/hooks/useCmsImage";
import { RESOURCES_HERO_IMAGE } from "@/lib/marketing-images";
import { BookOpen, Sparkles, Shield, Layers } from "lucide-react";

const BENEFIT_ICONS = [BookOpen, Sparkles, Shield, Layers];

export default function ResourcesPage() {
  const { t, i18n } = useTranslation();
  const heroImage = useCmsImage("cmsImages.resources.hero", RESOURCES_HERO_IMAGE);

  const benefits = useMemo(() => {
    const data = t("resources.benefits", { returnObjects: true });
    const items = Array.isArray(data) ? (data as { title: string; desc: string }[]) : [];
    return items.map((item, i) => ({ ...item, icon: BENEFIT_ICONS[i] ?? BookOpen }));
  }, [t, i18n.language]);

  return (
    <div className="marketing-page-root flex min-h-screen flex-col bg-[#FAF8F5]">
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
        />

        {benefits.length > 0 && (
          <MockupFeatureStrip items={benefits} columns={4} className="bg-[#FAF8F5]" />
        )}

        <Suspense fallback={null}>
          <ResourcesMarketplaceExperience />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
