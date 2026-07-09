"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCmsEditor } from "@/context/CmsEditorContext";
import { getCmsPageMeta } from "@/lib/cms/page-meta";
import { groupFieldsBySection } from "@/lib/cms/field-groups";
import { getPreviewUrl } from "@/lib/cms/page-routes";
import { buildPreviewOverrides, CMS_PREVIEW_FIELD_CLICK, CMS_PREVIEW_OVERRIDES, CMS_PREVIEW_READY } from "@/lib/cms/preview-overrides";
import type { MergedCmsField } from "@/lib/cms/merge-content";
import { CMS_IMAGE_REGISTRY } from "@/lib/cms/marketing-images-registry";
import { CmsSectionBuilder, type SectionLayout } from "@/components/admin/cms/CmsSectionBuilder";
import { CmsRichTextEditor } from "@/components/admin/cms/CmsRichTextEditor";
import { ImageFieldEditor } from "@/components/admin/cms/ImageFieldEditor";
import { CmsMediaLibrary } from "@/components/admin/cms/CmsMediaLibrary";
import { fetchPageLayout, savePageLayout } from "@/lib/cms/cms-api";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  ImageIcon,
  LayoutList,
  MousePointer2,
  RefreshCw,
  Type,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const imageLabelByKey = Object.fromEntries(CMS_IMAGE_REGISTRY.map((i) => [i.key, i.label]));

function friendlyName(field: MergedCmsField): string {
  return imageLabelByKey[field.i18n_key] ?? field.field_name ?? field.i18n_key.split(".").pop() ?? field.i18n_key;
}

type Props = {
  pageId: string;
};

export function CmsVisualEditor({ pageId }: Props) {
  const {
    fields,
    editLocale,
    setEditLocale,
    previewTick,
    bumpPreview,
    selectedKey,
    setSelectedKey,
    updateDraft,
    resetField,
    getField,
  } = useCmsEditor();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [panelTab, setPanelTab] = useState<"content" | "sections">("content");
  const [layout, setLayout] = useState<SectionLayout[]>([]);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const pageMeta = getCmsPageMeta(pageId);
  const pageFields = useMemo(
    () => fields.filter((f) => f.pageGroup === pageId),
    [fields, pageId]
  );

  const groups = useMemo(() => groupFieldsBySection(pageFields.map((f) => f.i18n_key)), [pageFields]);

  const selected = selectedKey ? getField(selectedKey) : undefined;

  const baseUrl = getPreviewUrl(pageId, previewTick);

  const pushOverrides = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const overrides = buildPreviewOverrides(pageFields);
    win.postMessage({ type: CMS_PREVIEW_OVERRIDES, overrides, locale: editLocale }, window.location.origin);
  }, [pageFields, editLocale]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === CMS_PREVIEW_READY) {
        setIframeReady(true);
        pushOverrides();
      }
      if (event.data?.type === CMS_PREVIEW_FIELD_CLICK && typeof event.data.key === "string") {
        setSelectedKey(event.data.key);
        setPanelTab("content");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [pushOverrides, setSelectedKey]);

  useEffect(() => {
    if (iframeReady) pushOverrides();
  }, [fields, iframeReady, pushOverrides, previewTick]);

  useEffect(() => {
    void fetchPageLayout(pageId).then((rows) => {
      if (Array.isArray(rows) && rows.length) {
        setLayout(
          rows.map((r: { section_key: string; sort_order: number; is_visible: boolean }) => ({
            section_key: r.section_key,
            sort_order: r.sort_order,
            is_visible: r.is_visible,
          }))
        );
      }
    });
  }, [pageId]);

  const saveLayout = async () => {
    await savePageLayout(pageId, layout);
    bumpPreview();
  };

  const groupFields = activeGroup
    ? pageFields.filter((f) => groups.find((g) => g.id === activeGroup)?.fieldKeys.includes(f.i18n_key))
    : pageFields;

  const inputClass =
    "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base text-[#0D1B2A] focus:border-[#D4AF37] focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/15";

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[600px] flex-col lg:flex-row">
      {/* Live preview */}
      <div className="relative flex flex-1 flex-col border-b border-gray-200 bg-[#DDE1E8] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-2 border-b border-gray-200/80 bg-white px-4 py-2.5">
          <div className="flex items-center gap-2">
            <MousePointer2 className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-sm font-semibold text-[#0D1B2A]">
              {pageMeta?.label ?? pageId} - Live preview
            </span>
            <span className="hidden text-xs text-gray-500 sm:inline">Click highlighted text to edit</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" type="button" onClick={bumpPreview}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <a href={baseUrl.split("?")[0]} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" type="button">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden p-3">
          {!iframeReady && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-sm text-gray-500">
              Loading preview…
            </div>
          )}
          <iframe
            ref={iframeRef}
            title="Page preview"
            src={baseUrl}
            className="h-full w-full rounded-xl border border-black/10 bg-white shadow-xl"
            onLoad={() => setIframeReady(false)}
          />
        </div>
      </div>

      {/* Editor panel */}
      <aside className="flex w-full flex-col bg-white lg:w-[420px] xl:w-[460px]">
        <div className="flex border-b border-gray-100">
          <button
            type="button"
            onClick={() => setPanelTab("content")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold",
              panelTab === "content" ? "border-b-2 border-[#D4AF37] text-[#0D1B2A]" : "text-gray-500"
            )}
          >
            <Type className="h-4 w-4" />
            Content
          </button>
          <button
            type="button"
            onClick={() => setPanelTab("sections")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold",
              panelTab === "sections" ? "border-b-2 border-[#D4AF37] text-[#0D1B2A]" : "text-gray-500"
            )}
          >
            <LayoutList className="h-4 w-4" />
            Sections
          </button>
        </div>

        <div className="flex gap-2 border-b border-gray-100 px-4 py-2">
          <LangChip active={editLocale === "en"} onClick={() => setEditLocale("en")} label="EN" />
          <LangChip active={editLocale === "de"} onClick={() => setEditLocale("de")} label="DE" />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {panelTab === "sections" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Reorder or hide sections on this page.</p>
              <CmsSectionBuilder groups={groups} layout={layout} onChange={setLayout} isDark={false} />
              <Button variant="gold" className="w-full" onClick={() => void saveLayout()}>
                Save section order
              </Button>
            </div>
          )}

          {panelTab === "content" && (
            <>
              {selected ? (
                <FieldEditor
                  field={selected}
                  editLocale={editLocale}
                  friendlyName={friendlyName(selected)}
                  inputClass={inputClass}
                  onChange={(v) => updateDraft(selected.i18n_key, editLocale, v)}
                  onReset={() => resetField(selected.i18n_key)}
                  onClose={() => setSelectedKey(null)}
                  onOpenMedia={() => setMediaOpen(true)}
                />
              ) : (
                <>
                  <p className="mb-3 text-sm text-gray-600">
                    Select a section or click text in the preview.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {groups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setActiveGroup(activeGroup === g.id ? null : g.id)}
                        className={cn(
                          "rounded-xl border-2 px-3 py-2 text-left text-sm font-medium transition-colors",
                          activeGroup === g.id
                            ? "border-[#D4AF37] bg-[#D4AF37]/10"
                            : "border-gray-100 hover:border-[#D4AF37]/40"
                        )}
                      >
                        {g.label}
                        <span className="ml-1 text-xs text-gray-400">({g.fieldKeys.length})</span>
                      </button>
                    ))}
                  </div>
                  <ul className="mt-4 space-y-1">
                    {groupFields.slice(0, 40).map((f) => (
                      <li key={f.i18n_key}>
                        <button
                          type="button"
                          onClick={() => setSelectedKey(f.i18n_key)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          {f.field_type === "image" ? (
                            <ImageIcon className="h-4 w-4 text-[#D4AF37]" />
                          ) : (
                            <Type className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="truncate font-medium text-[#0D1B2A]">{friendlyName(f)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </aside>

      <CmsMediaLibrary
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        isDark={false}
        onSelect={(url) => {
          if (selected?.field_type === "image") {
            updateDraft(selected.i18n_key, editLocale, url);
          }
          setMediaOpen(false);
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
        "rounded-lg px-4 py-1.5 text-xs font-bold",
        active ? "bg-[#D4AF37] text-[#0D1B2A]" : "bg-gray-100 text-gray-500"
      )}
    >
      {label}
    </button>
  );
}

function FieldEditor({
  field,
  editLocale,
  friendlyName,
  inputClass,
  onChange,
  onReset,
  onClose,
  onOpenMedia,
}: {
  field: MergedCmsField;
  editLocale: "en" | "de";
  friendlyName: string;
  inputClass: string;
  onChange: (v: string) => void;
  onReset: () => void;
  onClose: () => void;
  onOpenMedia: () => void;
}) {
  const value =
    field.field_type === "image"
      ? field.draft[editLocale] || field.draft.en
      : field.draft[editLocale];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-[#0D1B2A]">{friendlyName}</h3>
          <p className="text-xs text-gray-500">{field.i18n_key}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
      </div>

      {field.field_type === "image" ? (
        <>
          <ImageFieldEditor value={value} onChange={onChange} inputClass={inputClass} isDark={false} label={friendlyName} />
          <Button variant="outline" size="sm" onClick={onOpenMedia}>
            Choose from media library
          </Button>
        </>
      ) : field.field_type === "textarea" || (value && value.includes("<")) ? (
        <CmsRichTextEditor value={value} onChange={onChange} />
      ) : (
        <input type="text" className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
      )}

      <button type="button" onClick={onReset} className="text-xs font-medium text-gray-500 hover:text-[#D4AF37]">
        Reset to published version
      </button>
    </div>
  );
}
