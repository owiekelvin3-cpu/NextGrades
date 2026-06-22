"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  isPremiumResource,
  tabContentTypes,
  getSubjectUi,
  RESOURCE_TABS,
  type ResourceTabId,
} from "@/lib/resources/ui-config";
import { useTranslation } from "react-i18next";
import { useResourcesCatalog } from "@/hooks/useResourcesCatalog";
import {
  ResourceHubCard,
  ResourceSubjectTile,
  ResourcesCtaBanner,
} from "@/components/resources/shared/ResourceCards";
import { getResourcesSubjectImage } from "@/lib/resources/images";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { MobileResourceCard } from "@/components/mobile/MobileResourceCard";
import { SectionHeader } from "@/components/premium/SectionHeader";
import { section } from "@/lib/premium/tokens";
import { cn } from "@/lib/utils";

const MARKETPLACE_TABS = RESOURCE_TABS.filter((tab) =>
  ["all", "worksheets", "videos", "exam_prep", "learning_materials"].includes(tab.id)
);

export function ResourcesMarketplaceExperience() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ResourceTabId>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const catalog = useResourcesCatalog();

  const handleTabChange = (tab: ResourceTabId) => {
    setActiveTab(tab);
    const types = tabContentTypes(tab);
    catalog.setContentTypes(types ?? []);
  };

  const featured = catalog.resources.slice(0, 4);
  const gridItems = catalog.resources.slice(0, 12);

  return (
    <>
      {/* Search & filters bar */}
      <section className="sticky top-[var(--site-nav-height,4rem)] z-30 border-b border-[var(--border-default)] bg-[var(--nav-background)] backdrop-blur-md">
        <div className={`${section.container} py-4 md:py-5`}>
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input
                  type="search"
                  value={catalog.search}
                  onChange={(e) => catalog.setSearch(e.target.value)}
                  placeholder={t("resources.searchPlaceholder")}
                  className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-background)] py-3.5 pl-12 pr-4 text-sm text-[var(--input-foreground)] outline-none transition focus:border-[var(--brand-gold)]/50 focus:ring-2 focus:ring-[var(--brand-gold-ring)]"
                />
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                className="inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 text-sm font-medium text-[var(--foreground)] touch-manipulation lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t("resources.filtersLabel")}
              </button>
            </div>

            {/* Subject pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => catalog.setSubjectSlug("")}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition touch-manipulation",
                  !catalog.subjectSlug
                    ? "bg-[var(--brand-navy)] text-white dark:bg-[var(--brand-gold)] dark:text-[var(--brand-navy)]"
                    : "bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                )}
              >
                {t("resources.allSubjects")}
              </button>
              {catalog.subjects.slice(0, 8).map((s) => {
                const slug = s.slug || s.id;
                const active = catalog.subjectSlug === slug;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => catalog.setSubjectSlug(active ? "" : slug)}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition touch-manipulation",
                      active
                        ? "bg-[var(--brand-navy)] text-white dark:bg-[var(--brand-gold)] dark:text-[var(--brand-navy)]"
                        : "bg-[var(--surface-subtle)] text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                    )}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {MARKETPLACE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition touch-manipulation",
                    activeTab === tab.id
                      ? "border-[var(--brand-gold)] bg-[var(--brand-gold-muted)] text-[var(--foreground)]"
                      : "border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
                  )}
                >
                  {t(tab.labelKey, { defaultValue: tab.id })}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile filter drawer */}
        {filtersOpen && (
          <div className="border-t border-[var(--border-default)] bg-[var(--surface-elevated)] px-5 py-4 lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">{t("resources.filtersLabel")}</p>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <MarketplaceFilters catalog={catalog} />
          </div>
        )}
      </section>

      <section className="bg-surface-muted py-10 md:py-16">
        <div className={`${section.container} space-y-14`}>
          {/* Desktop inline filters */}
          <div className="hidden items-end justify-between gap-6 lg:flex">
            <MarketplaceFilters catalog={catalog} className="flex flex-wrap gap-4" />
            <p className="shrink-0 text-sm text-[var(--text-muted)]">
              {catalog.resources.length} {t("resources.topBarResults")}
            </p>
          </div>

          {catalog.loading ? (
            <LoadingBlock />
          ) : (
            <>
              {/* Featured */}
              {featured.length > 0 && !catalog.search && !catalog.subjectSlug && (
                <div>
                  <SectionHeader
                    eyebrow={t("resources.featuredEyebrow")}
                    title={t("resources.featuredTitle")}
                    subtitle={t("resources.featuredSubtitle")}
                    align="left"
                    className="mb-8"
                  />
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {featured.map((r) => (
                      <ResourceHubCard
                        key={r.id}
                        resource={r}
                        variant={isPremiumResource(r) ? "premium" : "free"}
                        subjectSlug={catalog.subjectSlug}
                        onOpen={() => void catalog.openResource(r)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Subjects grid */}
              {!catalog.search && (
                <div>
                  <SectionHeader
                    title={t("resources.resourcesBySubject")}
                    align="left"
                    className="mb-8"
                  />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
              )}

              {/* Main grid */}
              <div>
                <SectionHeader
                  title={t("resources.gridTitle")}
                  subtitle={
                    catalog.search
                      ? t("resources.searchResultsFor", { query: catalog.search })
                      : undefined
                  }
                  align="left"
                  className="mb-8"
                />
                {gridItems.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
                    {t("resources.noResults")}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {gridItems.map((r) => (
                      <div key={r.id} className="hidden sm:block">
                        <ResourceHubCard
                          resource={r}
                          variant={isPremiumResource(r) ? "premium" : "free"}
                          subjectSlug={catalog.subjectSlug}
                          onOpen={() => void catalog.openResource(r)}
                        />
                      </div>
                    ))}
                    {gridItems.map((r) => (
                      <div key={`m-${r.id}`} className="sm:hidden">
                        <MobileResourceCard
                          resource={r}
                          variant={isPremiumResource(r) ? "premium" : "free"}
                          subjectSlug={catalog.subjectSlug}
                          onOpen={() => void catalog.openResource(r)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <ResourcesCtaBanner />
            </>
          )}
        </div>
      </section>
    </>
  );
}

function MarketplaceFilters({
  catalog,
  className,
}: {
  catalog: ReturnType<typeof useResourcesCatalog>;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <select
        value={catalog.classLevel}
        onChange={(e) => catalog.setClassLevel(e.target.value)}
        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
      >
        <option value="">{t("resources.allClasses")}</option>
        {catalog.classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        value={catalog.accessFilter}
        onChange={(e) => catalog.setAccessFilter(e.target.value as typeof catalog.accessFilter)}
        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
      >
        <option value="all">{t("resources.accessAll")}</option>
        <option value="free">{t("resources.accessFree")}</option>
        <option value="premium">{t("resources.accessPremium")}</option>
      </select>
      <select
        value={catalog.sort}
        onChange={(e) => catalog.setSort(e.target.value as typeof catalog.sort)}
        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
      >
        <option value="recent">{t("resources.sortNewest")}</option>
        <option value="popular">{t("resources.sortPopular")}</option>
        <option value="downloads">{t("resources.sortDownloads")}</option>
      </select>
      {(catalog.subjectSlug || catalog.classLevel || catalog.search) && (
        <button
          type="button"
          onClick={catalog.resetFilters}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          {t("resources.resetFilters")}
        </button>
      )}
    </div>
  );
}
