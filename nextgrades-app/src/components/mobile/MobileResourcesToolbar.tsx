"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ResourcesFilterSidebar } from "@/components/resources/shared/ResourcesFilterSidebar";
import { mobile } from "@/lib/mobile/tokens";
import { cn } from "@/lib/utils";
import type { useResourcesCatalog } from "@/hooks/useResourcesCatalog";

type Catalog = ReturnType<typeof useResourcesCatalog>;

type Props = {
  catalog: Catalog;
  resultCount: number;
};

export function MobileResourcesToolbar({ catalog, resultCount }: Props) {
  const { t } = useTranslation();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="space-y-4 lg:hidden">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          value={catalog.search}
          onChange={(e) => catalog.setSearch(e.target.value)}
          placeholder={t("resources.searchPlaceholder", { defaultValue: "Search materials…" })}
          className="w-full min-h-12 rounded-2xl border border-border-default bg-surface-elevated py-3 pl-12 pr-4 text-base text-foreground placeholder:text-text-muted focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/25"
        />
      </div>

      {/* Filter chips + filter button */}
      <div className="flex items-center gap-2">
        <div className={cn(mobile.chipRow, "flex-1")}>
          {(["all", "free", "premium"] as const).map((access) => (
            <button
              key={access}
              type="button"
              onClick={() => catalog.setAccessFilter(access)}
              className={cn(
                mobile.chip,
                catalog.accessFilter === access
                  ? "bg-[#D4AF37] text-[#0D1B2A] font-semibold"
                  : "border border-border-default bg-surface-elevated text-text-muted"
              )}
            >
              {access === "all"
                ? t("resources.all", { defaultValue: "All" })
                : access === "free"
                  ? t("resources.free", { defaultValue: "Free" })
                  : t("resources.premium", { defaultValue: "Premium" })}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className={cn(
            mobile.touchTarget,
            "flex shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-border-default bg-surface-elevated px-3 text-sm font-medium text-foreground"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t("resources.filters", { defaultValue: "Filters" })}
        </button>
      </div>

      <p className="text-sm font-medium text-text-muted">
        {resultCount} {t("resources.topBarResults", { defaultValue: "results" })}
      </p>

      {/* Filter bottom sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close filters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-border-default bg-surface-elevated p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">
                  {t("resources.filters", { defaultValue: "Filters" })}
                </h3>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className={cn(mobile.touchTarget, "flex items-center justify-center rounded-xl text-text-muted")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
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
                mobile
              />
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className={cn(mobile.button, "mt-4 w-full bg-gradient-to-r from-[#D4AF37] to-[#F5A623] font-semibold text-[#0D1B2A]")}
              >
                {t("resources.applyFilters", { defaultValue: "Show results" })}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
