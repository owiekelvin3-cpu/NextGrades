"use client";

import { useMemo } from "react";
import { ArrowRight, BookOpen, Crown, GraduationCap, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useResourcesCatalog } from "@/hooks/useResourcesCatalog";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { mergeMarketingSubjectsWithCatalog } from "@/lib/catalog/merge-marketing-subjects";
import { SubjectBrowseGrid } from "@/components/resources/SubjectBrowseGrid";
import { ResourceHubCard } from "@/components/resources/shared/ResourceCards";
import { LibraryEmptyState } from "@/components/resources/LibraryEmptyState";
import { Button } from "@/components/ui/Button";
import { BibliothekFilterSidebar } from "@/components/resources/BibliothekFilterSidebar";
import { isPremiumResource } from "@/lib/resources/ui-config";
import { isVideoResource } from "@/lib/resources/video";
import { section } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";
import type { LearningResource } from "@/components/resources/ResourceLearningCard";

const FEATURE_ICONS = [BookOpen, RefreshCw, GraduationCap, ShieldCheck] as const;

type MarketingSubjectItem = { id: string; title: string };

type Props = {
  access: "granted" | "locked";
};

export function ResourcesBibliothekExperience({ access }: Props) {
  const { t } = useTranslation();
  const catalog = useResourcesCatalog();
  const marketingSubjectsRaw = useLocalizedContent<MarketingSubjectItem[]>("subjectsPage.items");
  const locked = access === "locked";

  const bibliothekSubjects = useMemo(() => {
    const marketingItems = Array.isArray(marketingSubjectsRaw) ? marketingSubjectsRaw : [];
    return mergeMarketingSubjectsWithCatalog(marketingItems, catalog.subjects);
  }, [marketingSubjectsRaw, catalog.subjects]);

  const hasResourceFilters = Boolean(
    catalog.search.trim() ||
      catalog.subjectSlug ||
      catalog.classLevel ||
      catalog.semester ||
      catalog.accessFilter !== "all" ||
      catalog.materialTypes.length > 0
  );
  const showSubjectBrowse = !hasResourceFilters;
  const listingResources = useMemo(() => {
    if (hasResourceFilters) return catalog.resources;
    return catalog.resources.filter((resource) => !isVideoResource(resource));
  }, [catalog.resources, hasResourceFilters]);
  const hasMaterials = listingResources.length > 0;

  const features = [
    { title: t("resources.features.feature1Title"), desc: t("resources.features.feature1Desc") },
    { title: t("resources.features.feature2Title"), desc: t("resources.features.feature2Desc") },
    { title: t("resources.features.feature3Title"), desc: t("resources.features.feature3Desc") },
    { title: t("resources.features.feature4Title"), desc: t("resources.features.feature4Desc") },
  ];

  const openResource = (resource: LearningResource) => {
    void catalog.openResource(resource);
  };

  return (
    <>
      <section className="bg-[#0D1B2A] py-10 text-white md:py-14">
        <div className={section.container}>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-10 xl:gap-12">
            <BibliothekFilterSidebar
              classes={catalog.classes}
              classLevel={catalog.classLevel}
              semester={catalog.semester}
              accessFilter={catalog.accessFilter}
              materialTypes={catalog.materialTypes}
              onClassChange={catalog.setClassLevel}
              onSemesterChange={catalog.setSemester}
              onAccessChange={catalog.setAccessFilter}
              onMaterialTypesChange={catalog.setMaterialTypes}
              onReset={catalog.resetFilters}
              className="lg:sticky lg:top-24"
            />

            <div id="faecher-entdecken" className="flex min-w-0 flex-col gap-5 self-start">
              {!hasResourceFilters && (
                <p className="max-w-3xl text-base leading-relaxed text-on-navy-muted sm:text-lg">
                  {t("resources.gridIntro")}
                </p>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-sm backdrop-blur-sm md:p-5">
                <label className="sr-only" htmlFor="bibliothek-search">
                  {t("resources.searchPlaceholder")}
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    id="bibliothek-search"
                    type="search"
                    value={catalog.search}
                    onChange={(e) => catalog.setSearch(e.target.value)}
                    placeholder={t("resources.searchPlaceholder")}
                    className="w-full rounded-xl border border-white/15 bg-white/10 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/25"
                  />
                </div>

                <div id="bibliothek-results" className="mt-4">
                  {catalog.loading ? (
                    <p className="py-6 text-sm text-white/50">{t("resources.loading", { defaultValue: "Laden…" })}</p>
                  ) : hasMaterials ? (
                    <>
                      <p className="mb-3 text-sm text-on-navy-muted">
                        {catalog.search.trim()
                          ? t("resources.searchResultsFor", { query: catalog.search })
                          : t("resources.allMaterialsTitle", { defaultValue: "Alle Materialien" })}
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {listingResources.map((r) => (
                          <ResourceHubCard
                            key={r.id}
                            resource={r}
                            variant={isPremiumResource(r) ? "premium" : "free"}
                            subjectSlug={catalog.subjectSlug}
                            onOpen={() => openResource(r)}
                          />
                        ))}
                      </div>
                    </>
                  ) : hasResourceFilters ? (
                    <LibraryEmptyState searching={Boolean(catalog.search.trim())} query={catalog.search} />
                  ) : null}
                </div>
              </div>

              {showSubjectBrowse && bibliothekSubjects.length > 0 && (
                <SubjectBrowseGrid
                  subjects={bibliothekSubjects}
                  subjectCounts={catalog.subjectCounts}
                  locked={locked}
                  headerTitle={t("resources.discoverSubjectsTitle")}
                  headerDesc={t("resources.discoverSubjectsDesc")}
                  onDark
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface-muted)] py-10 md:py-14">
        <div className={cn(section.container)}>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1B2A] via-[#132942] to-[#1a3555] shadow-2xl">
            <div className="border-b border-white/10 px-6 py-8 md:px-10 md:py-10">
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/20">
                    <Crown className="h-6 w-6 text-[#D4AF37]" aria-hidden />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white md:text-2xl">{t("resources.ctaTitle")}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-300 md:text-base">
                      {t("resources.ctaSubtitle")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="gold"
                  size="md"
                  href="/resources/upgrade"
                  className="w-full shrink-0 rounded-xl px-6 py-3.5 font-semibold lg:w-auto"
                >
                  {t("resources.ctaButton")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 px-6 py-8 md:grid-cols-4 md:px-10 md:py-10">
              {features.map((feature, i) => {
                const Icon = FEATURE_ICONS[i] ?? BookOpen;
                return (
                  <div key={feature.title} className="text-center md:text-left">
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 md:mx-0">
                      <Icon className="h-5 w-5 text-[#D4AF37]" aria-hidden />
                    </div>
                    <p className="text-sm font-bold text-white">{feature.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-400">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
