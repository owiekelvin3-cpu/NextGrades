"use client";

import { useState } from "react";
import { Search, Gift, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useResourcesCatalog } from "@/hooks/useResourcesCatalog";
import { ResourcesFilterSidebar } from "@/components/resources/shared/ResourcesFilterSidebar";
import { ResourcesCategoryTabs } from "@/components/resources/shared/ResourcesCategoryTabs";
import {
  ResourceHubCard,
  ResourceSubjectTile,
  SectionHeader,
  ResourcesCtaBanner,
  ResourcesFeatureRow,
} from "@/components/resources/shared/ResourceCards";
import { tabContentTypes, getSubjectUi, type ResourceTabId } from "@/lib/resources/ui-config";
import { getResourcesSubjectImage } from "@/lib/resources/images";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { MobileResourcesToolbar } from "@/components/mobile/MobileResourcesToolbar";
import { MobileResourceCard } from "@/components/mobile/MobileResourceCard";
import { RevealOnScroll } from "@/components/marketing/RevealOnScroll";
import { appShell } from "@/lib/theme/shell";

export function ResourcesHubExperience() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ResourceTabId>("all");
  const catalog = useResourcesCatalog();

  const handleTabChange = (tab: ResourceTabId) => {
    setActiveTab(tab);
    const types = tabContentTypes(tab);
    catalog.setContentTypes(types ?? []);
  };

  const displayFree = catalog.accessFilter === "all" || catalog.accessFilter === "free"
    ? catalog.freeResources.slice(0, 4)
    : [];
  const displayPremium = catalog.accessFilter === "all" || catalog.accessFilter === "premium"
    ? catalog.premiumResources.slice(0, 4)
    : [];

  return (
    <>
      <ResourcesCategoryTabs active={activeTab} onChange={handleTabChange} />

      <section className={`${appShell.sectionSubtle} py-5 md:py-10`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MobileResourcesToolbar catalog={catalog} resultCount={catalog.resources.length} />

          <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
            <div className="hidden lg:col-span-1 lg:block">
              <ResourcesFilterSidebar
                subjects={catalog.subjects}
                classes={catalog.classes}
                subjectSlug={catalog.subjectSlug}
                classLevel={catalog.classLevel}
                semester={catalog.semester}
                accessFilter={catalog.accessFilter}
                materialTypes={catalog.materialTypes}
                subjectCounts={catalog.subjectCounts}
                onSubjectChange={catalog.setSubjectSlug}
                onClassChange={catalog.setClassLevel}
                onSemesterChange={catalog.setSemester}
                onAccessChange={catalog.setAccessFilter}
                onMaterialTypesChange={catalog.setMaterialTypes}
                onReset={catalog.resetFilters}
              />
            </div>

            <div className="space-y-8 lg:col-span-3 lg:space-y-10">
              <div className="hidden flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:flex">
                <p className="text-sm font-semibold text-[#0D1B2A]">
                  {catalog.resources.length}{" "}
                  {t("resources.topBarResults", { defaultValue: "results" })}
                </p>
                <div className="flex flex-1 flex-col gap-3 sm:max-w-xl sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      value={catalog.search}
                      onChange={(e) => catalog.setSearch(e.target.value)}
                      placeholder={t("resources.searchPlaceholder", { defaultValue: "Search materials…" })}
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm"
                    />
                  </div>
                  <select
                    value={catalog.sort}
                    onChange={(e) => catalog.setSort(e.target.value as typeof catalog.sort)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
                  >
                    <option value="recent">{t("resources.sortNewest", { defaultValue: "Newest first" })}</option>
                    <option value="popular">{t("resources.sortPopular", { defaultValue: "Most popular" })}</option>
                    <option value="downloads">Most downloaded</option>
                  </select>
                </div>
              </div>

              {catalog.loading ? (
                <LoadingBlock />
              ) : (
                <>
                  {displayFree.length > 0 && (
                    <RevealOnScroll>
                    <div>
                      <SectionHeader
                        title={t("resources.freeTitle", { defaultValue: "Free content" })}
                        badge={t("resources.freeSubtitle", { defaultValue: "Available for everyone" })}
                        badgeVariant="green"
                        icon={<Gift className="h-5 w-5 text-[#22C55E]" />}
                        actionHref="/resources?access=free"
                        actionLabel={t("resources.freeShowAll", { defaultValue: "Show all" })}
                      />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {displayFree.map((r) => (
                          <div key={r.id} className="hidden sm:block">
                            <ResourceHubCard
                              resource={r}
                              variant="free"
                              subjectSlug={catalog.subjectSlug}
                              onOpen={() => void catalog.openResource(r)}
                            />
                          </div>
                        ))}
                        {displayFree.map((r) => (
                          <div key={`m-${r.id}`} className="sm:hidden">
                            <MobileResourceCard
                              resource={r}
                              variant="free"
                              subjectSlug={catalog.subjectSlug}
                              onOpen={() => void catalog.openResource(r)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    </RevealOnScroll>
                  )}

                  {displayPremium.length > 0 && (
                    <RevealOnScroll delay={60}>
                    <div>
                      <SectionHeader
                        title={t("resources.premiumTitle", { defaultValue: "Premium content" })}
                        badge={t("resources.premiumSubtitle", { defaultValue: "Members only" })}
                        badgeVariant="gold"
                        icon={<Lock className="h-5 w-5 text-[#D4AF37]" />}
                        actionHref="/resources/upgrade"
                        actionLabel={t("resources.premiumShowAll", { defaultValue: "Show all" })}
                      />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {displayPremium.map((r) => (
                          <div key={r.id} className="hidden sm:block">
                            <ResourceHubCard
                              resource={r}
                              variant="premium"
                              subjectSlug={catalog.subjectSlug}
                              onOpen={() => void catalog.openResource(r)}
                            />
                          </div>
                        ))}
                        {displayPremium.map((r) => (
                          <div key={`m-${r.id}`} className="sm:hidden">
                            <MobileResourceCard
                              resource={r}
                              variant="premium"
                              subjectSlug={catalog.subjectSlug}
                              onOpen={() => void catalog.openResource(r)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    </RevealOnScroll>
                  )}

                  {catalog.resources.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500 sm:p-12">
                      {t("resources.noResults", { defaultValue: "No resources match your filters." })}
                    </div>
                  )}

                  <RevealOnScroll delay={80}>
                  <div>
                    <SectionHeader
                      title={t("resources.resourcesBySubject", { defaultValue: "Resources by subject" })}
                    />
                    {/* Mobile — horizontal subject carousel */}
                    <div className="snap-carousel pb-1 sm:hidden">
                      {catalog.subjects.slice(0, 5).map((s, index) => {
                        const slug = s.slug || s.id;
                        const ui = getSubjectUi(slug);
                        const Icon = ui.icon;
                        return (
                          <div key={s.id} className="w-[78vw] max-w-[300px]">
                            <ResourceSubjectTile
                              name={s.name}
                              slug={slug}
                              count={catalog.subjectCounts.get(slug) ?? 0}
                              color={ui.color}
                              icon={<Icon className="h-5 w-5" />}
                              imageUrl={getResourcesSubjectImage(slug, index)}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Desktop grid */}
                    <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                      {catalog.subjects.slice(0, 5).map((s, index) => {
                        const slug = s.slug || s.id;
                        const ui = getSubjectUi(slug);
                        const Icon = ui.icon;
                        return (
                          <ResourceSubjectTile
                            key={s.id}
                            name={s.name}
                            slug={slug}
                            count={catalog.subjectCounts.get(slug) ?? 0}
                            color={ui.color}
                            icon={<Icon className="h-5 w-5" />}
                            imageUrl={getResourcesSubjectImage(slug, index)}
                          />
                        );
                      })}
                    </div>
                  </div>
                  </RevealOnScroll>

                  <RevealOnScroll delay={100}>
                    <ResourcesCtaBanner />
                  </RevealOnScroll>
                  <RevealOnScroll delay={120}>
                    <ResourcesFeatureRow />
                  </RevealOnScroll>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
