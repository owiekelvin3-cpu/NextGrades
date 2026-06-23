"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCmsEditor } from "@/context/CmsEditorContext";
import { getCmsPageMeta } from "@/lib/cms/page-meta";
import { groupFieldsBySection } from "@/lib/cms/field-groups";
import { getPreviewUrl } from "@/lib/cms/page-routes";
import { CMS_IMAGE_REGISTRY } from "@/lib/cms/marketing-images-registry";
import { CmsFieldInput } from "@/components/admin/cms/CmsFieldInput";
import { CmsMediaLibrary } from "@/components/admin/cms/CmsMediaLibrary";
import type { MergedCmsField } from "@/lib/cms/merge-content";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, CloudUpload, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const imageLabelByKey = Object.fromEntries(CMS_IMAGE_REGISTRY.map((i) => [i.key, i.label]));

function friendlyName(field: MergedCmsField): string {
  return imageLabelByKey[field.i18n_key] ?? field.field_name ?? field.i18n_key.split(".").pop() ?? field.i18n_key;
}

type Props = {
  pageId: string;
};

export function CmsClassicEditor({ pageId }: Props) {
  const { t } = useTranslation();
  const {
    fields,
    editLocale,
    setEditLocale,
    updateDraft,
    resetField,
    previewTick,
    publishSection,
    sectionDirtyCount,
    publishing,
  } = useCmsEditor();

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
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const previewUrl = getPreviewUrl(pageId, previewTick);

  const toggleSection = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveSection = async (sectionId: string, fieldKeys: string[]) => {
    setSavingSection(sectionId);
    try {
      await publishSection(fieldKeys);
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f0f0f1]">
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#D4AF37]">
            {t("cmsEditor.editingPage", { defaultValue: "Editing page" })}
          </p>
          <h1 className="text-xl font-bold text-[#0D1B2A]">{pageMeta?.label ?? pageId}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {pageMeta?.description ??
              t("cmsEditor.pageHint", { defaultValue: "Edit headings, text, buttons, and images below." })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            <LangChip active={editLocale === "en"} onClick={() => setEditLocale("en")} label="EN" />
            <LangChip active={editLocale === "de"} onClick={() => setEditLocale("de")} label="DE" />
          </div>
          <a href={previewUrl.split("?")[0]} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" type="button">
              <ExternalLink className="mr-2 h-4 w-4" />
              {t("cmsEditor.previewLive", { defaultValue: "Preview live site" })}
            </Button>
          </a>
        </div>
      </header>

      <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <p className="text-sm text-gray-600">
          {t("cmsEditor.helpBanner", {
            defaultValue:
              "Expand each section, edit the fields, then click Save section or use Save all changes at the bottom. Changes appear on nextgrades.at immediately after saving.",
          })}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {groups.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              {t("cmsEditor.noFields", { defaultValue: "No editable fields for this page yet. Run Initialize content from the hub." })}
            </div>
          ) : null}

          {groups.map((group) => {
            const isOpen = expanded[group.id] !== false;
            const groupFields = pageFields.filter((f) => group.fieldKeys.includes(f.i18n_key));
            const dirtyInSection = sectionDirtyCount(group.fieldKeys);
            const isSaving = savingSection === group.id;

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
                    {dirtyInSection > 0 ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
                        {dirtyInSection} {t("cmsEditor.unsaved", { defaultValue: "unsaved" })}
                      </span>
                    ) : null}
                    {groupFields.length} {t("cmsEditor.fields", { defaultValue: "fields" })}
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </span>
                </button>

                {isOpen ? (
                  <div className="border-t border-gray-100">
                    <div className="space-y-5 px-5 py-5">
                      {groupFields.map((field) => (
                        <div key={field.i18n_key} className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <label className="text-sm font-medium text-[#0D1B2A]">{friendlyName(field)}</label>
                              {field.field_type === "image" ? (
                                <p className="mt-0.5 text-xs text-gray-400">
                                  {t("cmsEditor.imageHint", { defaultValue: "Upload or paste an image URL" })}
                                </p>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => resetField(field.i18n_key)}
                              className="shrink-0 text-xs text-gray-400 hover:text-[#D4AF37]"
                            >
                              {t("cmsEditor.resetField", { defaultValue: "Reset" })}
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

                    <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/80 px-5 py-3">
                      <Button
                        variant="gold"
                        size="sm"
                        disabled={publishing || dirtyInSection === 0}
                        onClick={() => void handleSaveSection(group.id, group.fieldKeys)}
                      >
                        {isSaving || publishing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CloudUpload className="mr-2 h-4 w-4" />
                        )}
                        {t("cmsEditor.saveSection", { defaultValue: "Save section" })}
                      </Button>
                    </div>
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
