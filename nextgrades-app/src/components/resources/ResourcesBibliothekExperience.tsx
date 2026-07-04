"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useResourcesCatalog } from "@/hooks/useResourcesCatalog";
import { SubjectBrowseGrid } from "@/components/resources/SubjectBrowseGrid";
import { ResourceHubCard } from "@/components/resources/shared/ResourceCards";
import { LibraryEmptyState } from "@/components/resources/LibraryEmptyState";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { MobileResourceCard } from "@/components/mobile/MobileResourceCard";
import { SectionHeader } from "@/components/premium/SectionHeader";
import { Button } from "@/components/ui/Button";
import { ResourcesLibraryPromo } from "@/components/resources/ResourcesLibraryPromo";
import { isPremiumResource } from "@/lib/resources/ui-config";
import { section } from "@/lib/premium/tokens";
import { theme as th } from "@/lib/theme/tokens";
import { cn } from "@/lib/utils";

const VISIBLE_SUBJECT_PILLS = 5;

type Props = {
  access: "granted" | "locked";
};

export function ResourcesBibliothekExperience({ access }: Props) {
  const { t } = useTranslation();
  const catalog = useResourcesCatalog();
  const locked = access === "locked";

  const hasActiveFilters = Boolean(catalog.search.trim() || catalog.subjectSlug);
  const showSubjectBrowse = !hasActiveFilters;
  const featured = catalog.resources.slice(0, 4);
  const gridItems = catalog.resources.slice(0, 12);
  const hasMaterials = catalog.resources.length > 0;

  const visibleSubjects = useMemo(
    () => catalog.subjects.slice(0, VISIBLE_SUBJECT_PILLS),
    [catalog.subjects]
  );
  const hasMoreSubjects = catalog.subjects.length > VISIBLE_SUBJECT_PILLS;

  return (
    <>
      <section className="bg-[var(--surface-muted)] py-10 md:py-14">
        <div className={cn(section.container, "space-y-12 md:space-y-14")}>
          {locked && <ResourcesLibraryPromo />}

          <div id="faecher-entdecken" className="space-y-8">
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--card-background)] p-5 shadow-sm md:p-6">
              <label className="sr-only" htmlFor="bibliothek-search">
                {t("resources.searchPlaceholder")}
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input
                  id="bibliothek-search"
                  type="search"
                  value={catalog.search}
                  onChange={(e) => catalog.setSearch(e.target.value)}
                  placeholder={t("resources.searchPlaceholder")}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-background)] py-3.5 pl-12 pr-4 text-sm text-[var(--input-foreground)] outline-none transition focus:border-[var(--brand-gold)] focus:ring-2 focus:ring-[var(--brand-gold-ring)]"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {visibleSubjects.map((s) => {
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
                {hasMoreSubjects && (
                  <Link
                    href="/subjects"
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition",
                      "border border-[var(--border-default)] text-[var(--foreground-secondary)] hover:border-[var(--brand-gold)]/40 hover:text-[var(--brand-gold)]"
                    )}
                  >
                    {t("resources.moreSubjects")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
              </div>
            </div>

            {showSubjectBrowse && catalog.subjects.length > 0 && (
              <SubjectBrowseGrid
                subjects={catalog.subjects}
                subjectCounts={catalog.subjectCounts}
                locked={locked}
                headerTitle={t("resources.discoverSubjectsTitle")}
                headerDesc={t("resources.discoverSubjectsDesc")}
              />
            )}
          </div>

          {catalog.loading ? (
            <LoadingBlock />
          ) : hasMaterials ? (
            <>
              {!locked && featured.length > 0 && !catalog.search && !catalog.subjectSlug && (
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

              {(catalog.search || catalog.subjectSlug) && (
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
              )}
            </>
          ) : hasActiveFilters ? (
            <LibraryEmptyState searching={hasActiveFilters} query={catalog.search} />
          ) : null}

          {locked && (
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1B2A] via-[#132942] to-[#1a3555] px-6 py-8 shadow-2xl md:px-10 md:py-10">
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-xl font-bold text-white md:text-2xl">{t("resources.ctaTitle")}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-300 md:text-base">
                    {t("resources.ctaSubtitle")}
                  </p>
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
          )}
        </div>
      </section>
    </>
  );
}
