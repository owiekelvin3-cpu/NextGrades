"use client";

import { useMemo, useState } from "react";
import { useCmsEditor } from "@/context/CmsEditorContext";
import { getCmsPageMeta } from "@/lib/cms/page-meta";
import { groupFieldsBySection } from "@/lib/cms/field-groups";
import { getPreviewUrl } from "@/lib/cms/page-routes";
import { CMS_IMAGE_REGISTRY } from "@/lib/cms/marketing-images-registry";
import { CmsFieldInput } from "@/components/admin/cms/CmsFieldInput";
import { CmsMediaLibrary } from "@/components/admin/cms/CmsMediaLibrary";
import type { MergedCmsField } from "@/lib/cms/merge-content";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

const imageLabelByKey = Object.fromEntries(CMS_IMAGE_REGISTRY.map((i) => [i.key, i.label]));

function friendlyName(field: MergedCmsField): string {
  return imageLabelByKey[field.i18n_key] ?? field.field_name ?? field.i18n_key.split(".").pop() ?? field.i18n_key;
}

type Props = {
  pageId: string;
};

export function CmsClassicEditor({ pageId }: Props) {
  const { fields, editLocale, setEditLocale, updateDraft, resetField, previewTick } = useCmsEditor();

  const pageMeta = getCmsPageMeta(pageId);
  const pageFields = useMemo(
    () => fields.filter((f) => f.pageGroup === pageId),
    [fields, pageId]
  );
  const groups = useMemo(() => groupFieldsBySection(pageFields.map((f) => f.i18n_key)), [pageFields]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.id, true]))
  );
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTargetKey, setMediaTargetKey] = useState<string | null>(null);

  const previewUrl = getPreviewUrl(pageId, previewTick);

  const toggleSection = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f0f0f1]">
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div>
          <h1 className="text-lg font-bold text-[#0D1B2A]">{pageMeta?.label ?? pageId}</h1>
          <p className="text-xs text-gray-500">{pageMeta?.description ?? "Edit page content"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            <LangChip active={editLocale === "en"} onClick={() => setEditLocale("en")} label="EN" />
            <LangChip active={editLocale === "de"} onClick={() => setEditLocale("de")} label="DE" />
          </div>
          <a href={previewUrl.split("?")[0]} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" type="button">
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview live site
            </Button>
          </a>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {groups.map((group) => {
            const isOpen = expanded[group.id] !== false;
            const groupFields = pageFields.filter((f) => group.fieldKeys.includes(f.i18n_key));

            return (
              <section
                key={group.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(group.id)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50"
                >
                  <span className="font-semibold text-[#0D1B2A]">{group.label}</span>
                  <span className="flex items-center gap-2 text-xs text-gray-400">
                    {groupFields.length} field{groupFields.length === 1 ? "" : "s"}
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </span>
                </button>

                {isOpen ? (
                  <div className="space-y-5 border-t border-gray-100 px-5 py-5">
                    {groupFields.map((field) => (
                      <div key={field.i18n_key} className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <label className="text-sm font-medium text-[#0D1B2A]">{friendlyName(field)}</label>
                          <button
                            type="button"
                            onClick={() => resetField(field.i18n_key)}
                            className="shrink-0 text-xs text-gray-400 hover:text-[#D4AF37]"
                          >
                            Reset
                          </button>
                        </div>
                        <CmsFieldInput
                          field={field}
                          editLocale={editLocale}
                          label={friendlyName(field)}
                          onChange={(v) => updateDraft(field.i18n_key, editLocale, v)}
                          onOpenMedia={
                            field.field_type === "image"
                              ? () => {
                                  setMediaTargetKey(field.i18n_key);
                                  setMediaOpen(true);
                                }
                              : undefined
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>

      <CmsMediaLibrary
        open={mediaOpen}
        onClose={() => {
          setMediaOpen(false);
          setMediaTargetKey(null);
        }}
        isDark={false}
        onSelect={(url) => {
          if (mediaTargetKey) {
            updateDraft(mediaTargetKey, editLocale, url);
          }
          setMediaOpen(false);
          setMediaTargetKey(null);
        }}
      />
    </div>
  );
}

function LangChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1 text-xs font-bold transition-colors",
        active ? "bg-[#D4AF37] text-[#0D1B2A]" : "text-gray-500 hover:text-[#0D1B2A]"
      )}
    >
      {label}
    </button>
  );
}
