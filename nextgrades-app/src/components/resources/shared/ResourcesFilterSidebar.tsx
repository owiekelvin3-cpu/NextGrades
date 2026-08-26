"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { CatalogClass, CatalogSubject } from "@/hooks/useResourcesCatalog";
import { MATERIAL_TYPE_FILTERS } from "@/lib/resources/ui-config";
import { appShell } from "@/lib/theme/shell";

type Props = {
  subjects: CatalogSubject[];
  classes: CatalogClass[];
  subjectSlug: string;
  classLevel: string;
  semester: string;
  accessFilter: "all" | "free" | "premium";
  materialTypes: string[];
  subjectCounts: Map<string, number>;
  onSubjectChange: (slug: string) => void;
  onClassChange: (level: string) => void;
  onSemesterChange: (sem: string) => void;
  onAccessChange: (access: "all" | "free" | "premium") => void;
  onMaterialTypesChange: (types: string[]) => void;
  onReset: () => void;
  subjectLinkBase?: string;
  mobile?: boolean;
};

export function ResourcesFilterSidebar({
  subjects,
  classes,
  subjectSlug,
  classLevel,
  semester,
  accessFilter,
  materialTypes,
  subjectCounts,
  onSubjectChange,
  onClassChange,
  onSemesterChange,
  onAccessChange,
  onMaterialTypesChange,
  onReset,
  subjectLinkBase = "/resources",
  mobile: isMobile = false,
}: Props) {
  const { t } = useTranslation();

  const toggleMaterialType = (types: string[]) => {
    const key = types.join(",");
    const active = materialTypes.join(",") === key;
    onMaterialTypesChange(active ? [] : types);
  };

  return (
    <aside className="space-y-6">
      <div className={cn(isMobile ? "space-y-5" : cn("p-5", appShell.elevatedCard))}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            {t("resources.filters.title", { defaultValue: "Filters" })}
          </h3>
          <button type="button" onClick={onReset} className="text-xs font-medium text-[#D4AF37] hover:underline">
            {t("resources.filters.reset", { defaultValue: "Reset filters" })}
          </button>
        </div>

        <div className="space-y-5 text-sm">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t("resources.filters.subject", { defaultValue: "Subject" })}
            </p>
            <ul className="space-y-1">
              <li>
                <Link
                  href={subjectLinkBase}
                  className={cn(
                    "block rounded-lg px-3 py-2 transition",
                    !subjectSlug ? "bg-[#FEF3C7] font-semibold text-[#0D1B2A]" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  {t("resources.filters.allSubjects", { defaultValue: "All subjects" })}
                </Link>
              </li>
              {subjects.map((s) => {
                const slug = s.slug || s.id;
                const active = subjectSlug === slug;
                const count = subjectCounts.get(slug) ?? 0;
                return (
                  <li key={s.id}>
                    <Link
                      href={`${subjectLinkBase}/${slug}`}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 transition",
                        active ? "bg-[#FEF3C7] font-semibold text-[#0D1B2A]" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"
                      )}
                    >
                      <span>{s.name}</span>
                      {count > 0 && <span className="text-xs text-gray-400">{count}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t("resources.filters.grade", { defaultValue: "Grade" })}
            </p>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => onClassChange("")}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left transition",
                    !classLevel ? "bg-[#FEF3C7] font-semibold text-[#0D1B2A]" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  {t("resources.filters.allGrades", { defaultValue: "All grades" })}
                </button>
              </li>
              {classes.map((c) => (
                <li key={c.id}>
                  <Link
                    href={subjectSlug ? `/resources/${subjectSlug}/${c.level}` : "#"}
                    onClick={(e) => {
                      if (!subjectSlug) {
                        e.preventDefault();
                        onClassChange(String(c.level));
                      }
                    }}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left transition block",
                      classLevel === String(c.level) ? "bg-[#FEF3C7] font-semibold text-[#0D1B2A]" : "text-text-muted hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t("resources.filters.semester", { defaultValue: "Semester" })}
            </p>
            <div className="space-y-1">
              {["", "1", "2"].map((val) => (
                <label key={val || "all"} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">
                  <input
                    type="radio"
                    name="semester"
                    checked={semester === val}
                    onChange={() => onSemesterChange(val)}
                    className="accent-[#D4AF37]"
                  />
                  <span className="text-foreground/80">
                    {val === "" ? t("resources.filters.allSemesters", { defaultValue: "All semesters" }) : `${val}. Semester`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t("resources.filters.materialType", { defaultValue: "Material type" })}
            </p>
            <div className="space-y-1">
              {MATERIAL_TYPE_FILTERS.map((m, i) => (
                <label key={m.value} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={materialTypes.join(",") === m.types.join(",")}
                    onChange={() => toggleMaterialType(m.types)}
                    className="accent-[#D4AF37] rounded"
                  />
                  <span className="text-foreground/80">
                    {t(m.labelKey, {
                      defaultValue: [
                        "PDFs",
                        "Worksheets",
                        "Videos",
                        "Summaries",
                        "Formula sheets",
                        "Exam preparation",
                      ][i],
                    })}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t("resources.filters.access", { defaultValue: "Access" })}
            </p>
            <div className="space-y-1">
              {(
                [
                  ["all", t("resources.filters.accessAll", { defaultValue: "All content" })],
                  ["free", t("resources.filters.accessFree", { defaultValue: "Free content" })],
                  ["premium", t("resources.filters.accessPremium", { defaultValue: "Premium only" })],
                ] as const
              ).map(([val, label]) => (
                <label key={val} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">
                  <input
                    type="radio"
                    name="access"
                    checked={accessFilter === val}
                    onChange={() => onAccessChange(val)}
                    className="accent-[#D4AF37]"
                  />
                  <span className="text-foreground/80">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
