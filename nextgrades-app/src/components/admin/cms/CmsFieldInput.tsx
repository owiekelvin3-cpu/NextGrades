"use client";

import { Button } from "@/components/ui/Button";
import { CmsRichTextEditor } from "@/components/admin/cms/CmsRichTextEditor";
import { ImageFieldEditor } from "@/components/admin/cms/ImageFieldEditor";
import type { MergedCmsField, EditLocale } from "@/lib/cms/merge-content";

const inputClass =
  "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base text-[#0D1B2A] focus:border-[#D4AF37] focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/15";

type Props = {
  field: MergedCmsField;
  editLocale: EditLocale;
  label: string;
  onChange: (value: string) => void;
  onOpenMedia?: () => void;
};

export function CmsFieldInput({ field, editLocale, label, onChange, onOpenMedia }: Props) {
  const value =
    field.field_type === "image"
      ? field.draft[editLocale] || field.draft.en
      : field.draft[editLocale];

  if (field.field_type === "image") {
    return (
      <div className="space-y-2">
        <ImageFieldEditor value={value} onChange={onChange} inputClass={inputClass} isDark={false} label={label} />
        {onOpenMedia ? (
          <Button variant="outline" size="sm" type="button" onClick={onOpenMedia}>
            Choose from media library
          </Button>
        ) : null}
      </div>
    );
  }

  if (field.field_type === "color") {
    return (
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value?.startsWith("#") ? value : "#D4AF37"}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 cursor-pointer rounded-lg border border-gray-200"
        />
        <input type="text" className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }

  if (field.field_type === "url") {
    return (
      <div className="space-y-2">
        <input type="url" className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-[#1B4965] hover:text-[#D4AF37]"
          >
            Test link →
          </a>
        ) : null}
      </div>
    );
  }

  if (field.field_type === "textarea" || field.field_type === "richtext" || (value && value.includes("<"))) {
    return <CmsRichTextEditor value={value} onChange={onChange} />;
  }

  return <input type="text" className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />;
}
