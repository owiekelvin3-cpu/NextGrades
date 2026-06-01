"use client";

import { RotateCcw, Type, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ImageFieldEditor } from "@/components/admin/cms/ImageFieldEditor";
import type { MergedCmsField, EditLocale } from "@/lib/cms/merge-content";
import { cn } from "@/lib/utils";

type Props = {
  field: MergedCmsField;
  editLocale: EditLocale;
  isDirty: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
};

export function SimpleFieldCard({ field, editLocale, isDirty, onChange, onReset }: Props) {
  const isImage = field.field_type === "image";
  const value = isImage
    ? field.draft[editLocale] || field.draft.en || field.draft.de
    : field.draft[editLocale];

  const inputClass =
    "w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3.5 text-base text-[#0D1B2A] placeholder:text-gray-400 focus:border-[#D4AF37] focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/15";

  return (
    <Card className="overflow-hidden border-2 border-gray-100 bg-white p-0 shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-[#FAFAFA] px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15">
            {isImage ? (
              <ImageIcon className="h-5 w-5 text-[#D4AF37]" />
            ) : (
              <Type className="h-5 w-5 text-[#D4AF37]" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0D1B2A]">{field.field_name}</h3>
            <p className="mt-0.5 text-sm text-gray-500">
              {isImage ? "Picture on your website" : editLocale === "en" ? "English text" : "German text"}
            </p>
          </div>
        </div>
        {isDirty && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Undo
          </button>
        )}
      </div>

      <div className="p-5">
        {isImage ? (
          <ImageFieldEditor
            value={value}
            onChange={onChange}
            inputClass={inputClass}
            isDark={false}
            label={field.field_name}
          />
        ) : field.field_type === "textarea" ? (
          <textarea
            rows={4}
            className={cn(inputClass, "min-h-[120px] resize-y")}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your text here…"
          />
        ) : (
          <input
            type="text"
            className={inputClass}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your text here…"
          />
        )}
        {isDirty && (
          <p className="mt-3 text-sm font-medium text-amber-700">
            ● Changed — tap &quot;Put on live website&quot; below to save
          </p>
        )}
      </div>
    </Card>
  );
}
