"use client";

import { useTranslation } from "react-i18next";
import { MATERIAL_TYPE_FILTERS } from "@/lib/resources/ui-config";
import { MAX_CLASS_LEVEL } from "@/lib/catalog/classes";
import { cn } from "@/lib/utils";

type ClassItem = { id: string; name: string; level: number };

type Props = {
  classes: ClassItem[];
  classLevel: string;
  semester: string;
  accessFilter: "all" | "free" | "premium";
  materialTypes: string[];
  onClassChange: (level: string) => void;
  onSemesterChange: (sem: string) => void;
  onAccessChange: (access: "all" | "free" | "premium") => void;
  onMaterialTypesChange: (types: string[]) => void;
  onReset: () => void;
  className?: string;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{children}</p>
  );
}

function GoldRadio({
  checked,
  name,
  onChange,
  label,
}: {
  checked: boolean;
  name: string;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/5">
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/25">
        <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
        <span
          className={cn(
            "h-2 w-2 rounded-full bg-[#D4AF37] transition",
            checked ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}
        />
      </span>
      <span className={cn("text-sm", checked ? "font-semibold text-white" : "text-white/70")}>{label}</span>
    </label>
  );
}

/** Dark premium filter panel for Bibliothek - grades 1–9, semester, material type, access. */
export function BibliothekFilterSidebar({
  classes,
  classLevel,
  semester,
  accessFilter,
  materialTypes,
  onClassChange,
  onSemesterChange,
  onAccessChange,
  onMaterialTypesChange,
  onReset,
  className,
}: Props) {
  const { t } = useTranslation(["common", "site"]);

  const gradeClasses = classes.filter((c) => c.level >= 1 && c.level <= MAX_CLASS_LEVEL);

  const toggleMaterialType = (types: string[]) => {
    const key = types.join(",");
    const active = materialTypes.join(",") === key;
    onMaterialTypesChange(active ? [] : types);
  };

  const materialDefaults = [
    "Arbeitsblätter & Übungen",
    "Zusammenfassungen",
    "Guides & Lernpläne",
    "Erklärvideos",
    "Formelsammlungen",
  ];

  return (
    <aside
      className={cn(
        "rounded-2xl border border-white/10 bg-[#0a1628]/95 p-5 shadow-2xl shadow-black/30 backdrop-blur-sm md:p-6",
        className
      )}
    >
      <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="text-sm font-bold text-white">{t("resources.filters.title", { ns: "common" })}</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-[#D4AF37] transition hover:text-[#e8c96a]"
        >
          {t("resources.filters.reset", { ns: "common" })}
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <SectionLabel>{t("resources.filters.grade", { ns: "common" })}</SectionLabel>
          <ul className="space-y-0.5">
            {gradeClasses.map((c) => {
              const active = classLevel === String(c.level);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onClassChange(active ? "" : String(c.level))}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                      active
                        ? "bg-[#D4AF37]/15 font-semibold text-[#D4AF37]"
                        : "text-white/75 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {c.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <SectionLabel>{t("resources.filters.semester", { ns: "common" })}</SectionLabel>
          <div className="space-y-0.5">
            <GoldRadio
              name="bibliothek-semester"
              checked={semester === ""}
              onChange={() => onSemesterChange("")}
              label={t("resources.filters.allSemesters", { ns: "common" })}
            />
            <GoldRadio
              name="bibliothek-semester"
              checked={semester === "1"}
              onChange={() => onSemesterChange("1")}
              label={`1. ${t("resources.filters.semester", { ns: "common" })}`}
            />
            <GoldRadio
              name="bibliothek-semester"
              checked={semester === "2"}
              onChange={() => onSemesterChange("2")}
              label={`2. ${t("resources.filters.semester", { ns: "common" })}`}
            />
          </div>
        </div>

        <div>
          <SectionLabel>{t("resources.filters.materialType", { ns: "common" })}</SectionLabel>
          <div className="space-y-1">
            {MATERIAL_TYPE_FILTERS.map((m, i) => {
              const checked = materialTypes.join(",") === m.types.join(",");
              return (
                <label
                  key={m.value}
                  className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleMaterialType(m.types)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-transparent accent-[#D4AF37]"
                  />
                  <span className={cn("text-sm leading-snug", checked ? "font-medium text-white" : "text-white/70")}>
                    {t(m.labelKey, {
                      ns: "site",
                      defaultValue: materialDefaults[i] ?? m.value,
                    })}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <SectionLabel>{t("resources.filters.access", { ns: "common" })}</SectionLabel>
          <div className="space-y-0.5">
            {(
              [
                ["all", t("resources.filters.accessAll", { ns: "common" })],
                ["free", t("resources.filters.accessFree", { ns: "common" })],
                ["premium", t("resources.filters.accessPremium", { ns: "common" })],
              ] as const
            ).map(([val, label]) => (
              <GoldRadio
                key={val}
                name="bibliothek-access"
                checked={accessFilter === val}
                onChange={() => onAccessChange(val)}
                label={label}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
