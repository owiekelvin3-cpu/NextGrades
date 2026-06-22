"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImageFieldEditor } from "@/components/admin/cms/ImageFieldEditor";
import type { MergedCmsField, EditLocale } from "@/lib/cms/merge-content";
import { cn } from "@/lib/utils";

type Props = {
  field: MergedCmsField;
  editLocale: EditLocale;
  isDark: boolean;
  inputClass: string;
  isDirty: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
};

export function CmsFieldEditor({
  field,
  editLocale,
  isDark,
  inputClass,
  isDirty,
  onChange,
  onReset,
}: Props) {
  const [showTechnical, setShowTechnical] = useState(false);
  const textPrimary = "text-foreground";
  const textMuted = isDark ? "text-gray-400" : "text-gray-600";
  const otherLocale = editLocale === "en" ? "de" : "en";

  const displayName =
    field.field_name.length > 60 ? `${field.field_name.slice(0, 57)}…` : field.field_name;

  return (
    <Card className={cn("p-4 sm:p-5", isDark ? "border-white/10 bg-[#112240]" : "bg-white")}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={cn("font-semibold", textPrimary)}>{displayName}</p>
          {field.field_type === "image" && (
            <p className={cn("mt-0.5 text-xs", textMuted)}>Image — same for English and German</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {isDirty ? (
            <Badge variant="warning" className="text-[10px]">
              Not published yet
            </Badge>
          ) : field.isCustomized ? (
            <Badge variant="success" className="text-[10px]">
              Live on site
            </Badge>
          ) : null}
          {(isDirty || field.isCustomized) && (
            <button
              type="button"
              onClick={onReset}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors",
                isDark ? "text-gray-400 hover:bg-white/10 hover:text-white" : "text-gray-500 hover:bg-gray-100"
              )}
              title="Undo changes on this field"
            >
              <RotateCcw className="h-3 w-3" />
              Undo
            </button>
          )}
        </div>
      </div>

      {field.field_type === "image" ? (
        <ImageFieldEditor
          value={field.draft[editLocale] || field.draft.en || field.draft.de}
          onChange={onChange}
          inputClass={inputClass}
          isDark={isDark}
          label={displayName}
        />
      ) : field.field_type === "json" ? (
        <textarea
          rows={8}
          className={cn(inputClass, "font-mono text-xs")}
          value={field.draft[editLocale]}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.field_type === "textarea" ? (
        <textarea
          rows={4}
          className={inputClass}
          value={field.draft[editLocale]}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={inputClass}
          value={field.draft[editLocale]}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.draft[otherLocale] && field.field_type !== "image" && (
        <p className={cn("mt-2 text-xs", textMuted)}>
          {otherLocale === "en" ? "English" : "German"} version: {field.draft[otherLocale].slice(0, 80)}
          {field.draft[otherLocale].length > 80 ? "…" : ""}
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowTechnical((v) => !v)}
        className={cn("mt-3 flex items-center gap-1 text-[11px]", textMuted)}
      >
        <ChevronDown className={cn("h-3 w-3 transition-transform", showTechnical && "rotate-180")} />
        {showTechnical ? "Hide" : "Show"} technical details
      </button>
      {showTechnical && (
        <p className="mt-1 font-mono text-[10px] text-gray-500">{field.i18n_key}</p>
      )}
    </Card>
  );
}

type GroupProps = {
  label: string;
  count: number;
  isDark: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function CmsFieldGroup({ label, count, isDark, defaultOpen = true, children }: GroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const textPrimary = "text-foreground";

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
          isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-gray-200 bg-white hover:bg-gray-50"
        )}
      >
        <span className={cn("font-semibold", textPrimary)}>
          {label}
          <span className="ml-2 text-sm font-normal text-gray-500">({count})</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-4 pl-1">{children}</div>}
    </section>
  );
}
