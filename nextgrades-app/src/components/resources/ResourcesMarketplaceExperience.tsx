"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  isPremiumResource,
  tabContentTypes,
  RESOURCE_TABS,
  type ResourceTabId,
} from "@/lib/resources/ui-config";
import { useTranslation } from "react-i18next";
import { useResourcesCatalog } from "@/hooks/useResourcesCatalog";
import { ResourceHubCard, ResourcesCtaBanner } from "@/components/resources/shared/ResourceCards";
import { SubjectBrowseGrid } from "@/components/resources/SubjectBrowseGrid";
import { LibraryEmptyState } from "@/components/resources/LibraryEmptyState";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { MobileResourceCard } from "@/components/mobile/MobileResourceCard";
import { SectionHeader } from "@/components/premium/SectionHeader";
import { section } from "@/lib/premium/tokens";
import { theme as th } from "@/lib/theme/tokens";
import { cn } from "@/lib/utils";

const MARKETPLACE_TABS = RESOURCE_TABS.filter((tab) =>
  ["all", "worksheets", "videos", "exam_prep", "learning_materials"].includes(tab.id)
);

const filterSelectClass =
  "rounded-xl border border-[var(--input-border)] bg-[var(--input-background)] px-4 py-2.5 text-sm text-[var(--input-foreground)] outline-none focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[var(--brand-gold-ring)]";

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

  const hasActiveFilters = Boolean(catalog.search.trim() || catalog.subjectSlug || catalog.classLevel);
  const showSubjectBrowse = !hasActiveFilters;
  const featured = catalog.resources.slice(0, 4);
  const gridItems = catalog.resources.slice(0, 12);
  const hasMaterials = catalog.resources.length > 0;

  return (
    <>
      {/* Search & filters */}
      <section className="sticky top-[var(--site-nav-height,4rem)] z-30 border-b border-[var(--border-default)] bg-[var(--nav-background)] backdrop-blur-md">
        <div className={cn(section.container, "py-3 md:py-4")}>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 sm:gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input
                  type="search"
                  value={catalog.search}
                  onChange={(e) => catalog.setSearch(e.target.value)}
                  placeholder={t("resources.searchPlaceholder")}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-background)] py-3 pl-11 pr-4 text-sm text-[var(--input-foreground)] outline-none transition focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[var(--brand-gold-ring)]"
                />
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--surface-elevated)] px-3 text-sm font-medium text-[var(--foreground)] touch-manipulation lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden xs:inline">{t("resources.filtersLabel")}</span>
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => catalog.setSubjectSlug("")}
                className={cn(
                  "btn-pill shrink-0 touch-manipulation",
                  !catalog.subjectSlug ? th.btnPillActive : th.btnPillInactive
                )}
              >
                {t("resources.allSubjects")}
              </button>
              {catalog.subjects.map((s) => {
                const slug = s.slug || s.id;
                const active = catalog.subjectSlug === slug;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => catalog.setSubjectSlug(active ? "" : slug)}
                    className={cn(
                      "btn-pill shrink-0 touch-manipulation",
                      active ? th.btnPillActive : th.btnPillInactive
                    )}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {MARKETPLACE_TABS.map((tab, index) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "btn-pill shrink-0 touch-manipulation",
                    activeTab === tab.id ? th.btnPillOutlineActive : th.btnPillOutline
                  )}
                >
                  {t(tab.labelKey, { defaultValue: RESOURCE_TAB_DEFAULTS[index] ?? tab.id })}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtersOpen && (
          <div className="border-t border-[var(--border-default)] bg-[var(--surface-elevated)] px-4 py-4 lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--foreground)]">{t("resources.filtersLabel")}</p>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-[var(--text-muted)]" />
              </button>
            </div>
            <MarketplaceFilters catalog={catalog} />
          </div>
        )}
      </section>

      <section className="bg-surface-muted py-8 md:py-12">
        <div className={cn(section.container, "space-y-10 md:space-y-12")}>
          <div className="hidden items-end justify-between gap-6 lg:flex">
            <MarketplaceFilters catalog={catalog} />
            {hasMaterials && (
              <p className="shrink-0 text-sm text-[var(--text-muted)]">
                {catalog.resources.length} {t("resources.topBarResults")}
              </p>
            )}
          </div>

          {showSubjectBrowse && catalog.subjects.length > 0 && (
            <SubjectBrowseGrid subjects={catalog.subjects} subjectCounts={catalog.subjectCounts} />
          )}

          {catalog.loading ? (
            <LoadingBlock />
          ) : hasMaterials ? (
            <>
              {featured.length > 0 && !catalog.search && !catalog.subjectSlug && (
                <div>
                  <SectionHeader
                    eyebrow={t("resources.featuredEyebrow")}
                    title={t("resources.featuredTitle")}
                    subtitle={t("resources.featuredSubtitle")}
                    align="left"
                    className="!mb-6"
                  />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

              <div>
                <SectionHeader
                  title={t("resources.gridTitle")}
                  subtitle={
                    catalog.search
                      ? t("resources.searchResultsFor", { query: catalog.search })
                      : undefined
                  }
                  align="left"
                  className="!mb-6"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              </div>
            </>
          ) : (
            <LibraryEmptyState searching={hasActiveFilters} query={catalog.search} />
          )}

          <ResourcesCtaBanner />
        </div>
      </section>
    </>
  );
}

const RESOURCE_TAB_DEFAULTS = [
  "All resources",
  "Learning materials",
  "Worksheets",
  "Videos",
  "Exam prep",
];

function MarketplaceFilters({
  catalog,
  className,
}: {
  catalog: ReturnType<typeof useResourcesCatalog>;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex flex-wrap gap-2 sm:gap-3", className)}>
      <select
        value={catalog.classLevel}
        onChange={(e) => catalog.setClassLevel(e.target.value)}
        className={filterSelectClass}
      >
        <option value="">{t("resources.allClasses")}</option>
        {catalog.classes.map((c) => (
          <option key={c.id} value={String(c.level)}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        value={catalog.accessFilter}
        onChange={(e) => catalog.setAccessFilter(e.target.value as typeof catalog.accessFilter)}
        className={filterSelectClass}
      >
        <option value="all">{t("resources.accessAll")}</option>
        <option value="free">{t("resources.accessFree")}</option>
        <option value="premium">{t("resources.accessPremium")}</option>
      </select>
      <select
        value={catalog.sort}
        onChange={(e) => catalog.setSort(e.target.value as typeof catalog.sort)}
        className={filterSelectClass}
      >
        <option value="recent">{t("resources.sortNewest")}</option>
        <option value="popular">{t("resources.sortPopular")}</option>
        <option value="downloads">{t("resources.sortDownloads")}</option>
      </select>
      {(catalog.subjectSlug || catalog.classLevel || catalog.search) && (
        <button
          type="button"
          onClick={catalog.resetFilters}
          className="rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm font-medium text-[var(--foreground-secondary)] transition hover:bg-[var(--surface-subtle)]"
        >
          {t("resources.resetFilters")}
        </button>
      )}
    </div>
  );
}
