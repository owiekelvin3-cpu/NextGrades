"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileBottomNav, MOBILE_BOTTOM_NAV_PADDING } from "@/components/mobile/MobileBottomNav";
import { MobileTopBar } from "@/components/mobile/MobileTopBar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { useCms } from "@/context/CmsContext";
import { useTranslation } from "react-i18next";
import type { MergedCmsField, EditLocale } from "@/lib/cms/merge-content";
import { buildSavePayloads, getDirtyFields } from "@/lib/cms/save-content";
import { CMS_PAGES, getCmsPageMeta } from "@/lib/cms/page-meta";
import { CMS_IMAGE_REGISTRY } from "@/lib/cms/marketing-images-registry";
import { cmsFetch } from "@/lib/cms/cms-fetch";
import {
  filterFieldsBySection,
  getEditorSectionsForPage,
  type EditorSection,
} from "@/lib/cms/editor-sections";
import { SimpleFieldCard } from "@/components/admin/cms/SimpleFieldCard";
import { CmsPreviewPanel } from "@/components/admin/cms/CmsPreviewPanel";
import {
  ArrowLeft,
  ChevronRight,
  CloudUpload,
  ExternalLink,
  Home,
  Loader2,
  RefreshCw,
  Sparkles,
  Type,
  ImageIcon,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { appShell } from "@/lib/theme/shell";

/** Main pages shown first — simple picker for non-technical users. */
const PRIMARY_PAGES = ["home", "about", "programs", "pricing", "contact", "resources"] as const;

type EditorTab = "words" | "pictures" | "preview";
type Step = "pick" | "edit";

const imageLabelByKey = Object.fromEntries(CMS_IMAGE_REGISTRY.map((i) => [i.key, i.label]));

function friendlyFieldName(field: MergedCmsField): string {
  if (imageLabelByKey[field.i18n_key]) return imageLabelByKey[field.i18n_key];
  if (field.field_name && field.field_name.length < 80) return field.field_name;
  const parts = field.i18n_key.split(".");
  return parts[parts.length - 1]
    .replace(/([A-Z])/g, " $1")
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function CmsStudio() {
  const toast = useToast();
  const { refresh: refreshCms } = useCms();
  const { width: sidebarWidth } = useSidebar();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>("pick");
  const [activePage, setActivePage] = useState("home");
  const [editorTab, setEditorTab] = useState<EditorTab>("words");
  const [editLocale, setEditLocale] = useState<EditLocale>("en");
  const [fields, setFields] = useState<MergedCmsField[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [previewTick, setPreviewTick] = useState(0);
  const [showMorePages, setShowMorePages] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const pageMeta = getCmsPageMeta(activePage);

  const fieldsWithLabels = useMemo(
    () => fields.map((f) => ({ ...f, field_name: friendlyFieldName(f) })),
    [fields]
  );

  const pageFields = useMemo(
    () => fieldsWithLabels.filter((f) => f.pageGroup === activePage),
    [fieldsWithLabels, activePage]
  );

  const wordFields = useMemo(
    () => pageFields.filter((f) => f.field_type !== "image"),
    [pageFields]
  );

  const pictureFields = useMemo(
    () => pageFields.filter((f) => f.field_type === "image"),
    [pageFields]
  );

  const wordSections = useMemo(
    () => getEditorSectionsForPage(activePage, wordFields),
    [activePage, wordFields]
  );

  const pictureSections = useMemo(
    () => getEditorSectionsForPage(activePage, pictureFields),
    [activePage, pictureFields]
  );

  const currentSections = editorTab === "pictures" ? pictureSections : wordSections;

  const visibleWordFields = useMemo(
    () => filterFieldsBySection(activePage, wordFields, activeSection),
    [activePage, wordFields, activeSection]
  );

  const visiblePictureFields = useMemo(
    () => filterFieldsBySection(activePage, pictureFields, activeSection),
    [activePage, pictureFields, activeSection]
  );

  const dirtyFields = useMemo(() => getDirtyFields(fieldsWithLabels), [fieldsWithLabels]);
  const pageDirty = useMemo(
    () => dirtyFields.filter((f) => f.pageGroup === activePage),
    [dirtyFields, activePage]
  );
  const hasChanges = pageDirty.length > 0;

  const loadContent = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await cmsFetch("/api/cms/bulk");
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        throw new Error("Please sign in as admin at /portal/login");
      }
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Could not load content");
      }
      setFields((data.content ?? []) as MergedCmsField[]);
      setNeedsSetup(!data.seeded);
      return Boolean(data.seeded);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Load failed";
      setLoadError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const runSetup = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsFetch("/api/cms/bulk?action=seed", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Setup failed");
      setNeedsSetup(false);
      toast.success("Ready! Pick a page to start editing.");
      await loadContent();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Setup failed");
    } finally {
      setLoading(false);
    }
  }, [loadContent, toast]);

  useEffect(() => {
    void (async () => {
      const seeded = await loadContent();
      if (!seeded) await runSetup();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    const sections = editorTab === "pictures" ? pictureSections : wordSections;
    setActiveSection(sections[0]?.id ?? null);
  }, [activePage, editorTab, pictureSections, wordSections]);

  const updateDraft = (i18nKey: string, locale: EditLocale, value: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.i18n_key !== i18nKey) return f;
        if (f.field_type === "image") {
          return { ...f, draft: { en: value, de: value } };
        }
        return { ...f, draft: { ...f.draft, [locale]: value } };
      })
    );
  };

  const resetField = (i18nKey: string) => {
    setFields((prev) =>
      prev.map((f) => (f.i18n_key === i18nKey ? { ...f, draft: { ...f.published } } : f))
    );
  };

  const handlePublish = async () => {
    if (!pageDirty.length) {
      toast.error("Change something first, then tap Put on live website.");
      return;
    }
    setPublishing(true);
    try {
      const updates = buildSavePayloads(pageDirty, "publish");
      const res = await cmsFetch("/api/cms/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates, mode: "publish" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Could not save to website");
      }

      const publishedKeys = new Set(pageDirty.map((f) => f.i18n_key));
      setFields((prev) =>
        prev.map((f) => {
          if (!publishedKeys.has(f.i18n_key)) return f;
          return {
            ...f,
            published: { ...f.draft },
            draft: { ...f.draft },
            isPersisted: true,
            isCustomized: true,
            hasUnpublishedChanges: false,
          };
        })
      );

      toast.success(`Done! ${data.count ?? pageDirty.length} update(s) are now on your live website.`);
      await refreshCms();
      setPreviewTick((n) => n + 1);
      await loadContent();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setPublishing(false);
    }
  };

  const openPage = (pageId: string, tab: EditorTab = "words") => {
    setActivePage(pageId);
    setStep("edit");
    setEditorTab(tab);
    setActiveSection(null);
  };

  const primaryPages = CMS_PAGES.filter((p) => (PRIMARY_PAGES as readonly string[]).includes(p.id));
  const morePages = CMS_PAGES.filter((p) => !(PRIMARY_PAGES as readonly string[]).includes(p.id));

  return (
    <div className={cn(appShell.dashboardShell, "bg-[#EEF0F4]")} style={{ ["--sidebar-width" as string]: `${sidebarWidth}px` }}>
      <Sidebar role="admin" />

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col md:ml-[var(--sidebar-width)]",
          MOBILE_BOTTOM_NAV_PADDING
        )}
      >
        <MobileTopBar role="admin" />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="hidden border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6 md:block">
          <div className="mx-auto flex max-w-4xl items-center gap-2 text-sm text-gray-500">
            <Link href="/portal/admin" className="hover:text-[#D4AF37]">
              Admin
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-[#0D1B2A]">Website content</span>
          </div>

          {/* Steps */}
          <div className="mx-auto mt-4 flex max-w-4xl gap-2">
            <StepPill n={1} label="Pick page" active={step === "pick"} done={step === "edit"} onClick={() => setStep("pick")} />
            <StepPill n={2} label="Edit & publish" active={step === "edit"} done={false} onClick={() => step === "edit" && setStep("edit")} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-4xl">
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
                <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
                <p>Loading your website content…</p>
              </div>
            )}

            {loadError && !loading && (
              <div className="rounded-2xl border-2 border-red-200 bg-white p-8 text-center">
                <p className="font-semibold text-red-600">{loadError}</p>
                <Button variant="outline" className="mt-4" onClick={() => void loadContent()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
              </div>
            )}

            {needsSetup && !loading && !loadError && (
              <div className="rounded-2xl border-2 border-[#D4AF37]/40 bg-white p-8 text-center shadow-sm">
                <Sparkles className="mx-auto h-10 w-10 text-[#D4AF37]" />
                <h2 className="mt-4 text-xl font-bold text-[#0D1B2A]">One-time setup</h2>
                <p className="mt-2 text-gray-600">We need to copy your website text into the editor first.</p>
                <Button variant="gold" className="mt-6" onClick={() => void runSetup()}>
                  Start setup
                </Button>
              </div>
            )}

            {!loading && !loadError && !needsSetup && step === "pick" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-[#0D1B2A]">Which page do you want to change?</h1>
                  <p className="mt-2 text-gray-600">Tap a page, edit the words or pictures, then put it on your live website.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {primaryPages.map((page) => {
                    const Icon = page.icon;
                    const isHome = page.id === "home";
                    return (
                      <div
                        key={page.id}
                        className={cn(
                          "rounded-2xl border-2 bg-white shadow-sm transition-all",
                          isHome ? "border-[#D4AF37]/50 sm:col-span-2" : "border-gray-100"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => openPage(page.id)}
                          className="flex w-full items-center gap-4 p-5 text-left hover:bg-[#D4AF37]/5"
                        >
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/15">
                            <Icon className="h-7 w-7 text-[#D4AF37]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-lg font-bold text-[#0D1B2A]">{page.label}</p>
                            <p className="text-sm text-gray-500">{page.description}</p>
                          </div>
                          <ChevronRight className="h-6 w-6 shrink-0 text-gray-300" />
                        </button>
                        {isHome && (
                          <div className="flex flex-wrap gap-2 border-t border-gray-100 px-4 py-3">
                            <QuickOpen label="Edit words" onClick={() => openPage("home", "words")} />
                            <QuickOpen label="Change photos" onClick={() => openPage("home", "pictures")} />
                            <QuickOpen label="Preview" onClick={() => openPage("home", "preview")} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowMorePages((v) => !v)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600"
                >
                  {showMorePages ? "Hide extra pages" : "Show more pages…"}
                </button>

                {showMorePages && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {morePages.map((page) => (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => openPage(page.id)}
                        className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-left text-sm font-medium text-[#0D1B2A] hover:bg-gray-50"
                      >
                        {page.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!loading && !loadError && !needsSetup && step === "edit" && pageMeta && (
              <div className="space-y-5 pb-28">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("pick")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Change page
                  </button>
                  <a
                    href={pageMeta.route}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#D4AF37]"
                  >
                    Open live page
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <h1 className="text-2xl font-bold text-[#0D1B2A]">{pageMeta.label}</h1>
                  <p className="mt-1 text-gray-600">{pageMeta.description}</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
                  <TabButton active={editorTab === "words"} onClick={() => setEditorTab("words")} icon={Type} label="Words" count={wordFields.length} />
                  <TabButton active={editorTab === "pictures"} onClick={() => setEditorTab("pictures")} icon={ImageIcon} label="Pictures" count={pictureFields.length} />
                  <TabButton active={editorTab === "preview"} onClick={() => setEditorTab("preview")} icon={Eye} label="Preview" />
                </div>

                {/* Language */}
                {editorTab !== "preview" && (
                  <div className="flex gap-2">
                    <LangButton active={editLocale === "en"} onClick={() => setEditLocale("en")} label="English" />
                    <LangButton active={editLocale === "de"} onClick={() => setEditLocale("de")} label="German" />
                  </div>
                )}

                {editorTab !== "preview" && currentSections.length > 1 && (
                  <SectionPicker
                    sections={currentSections}
                    activeId={activeSection}
                    onSelect={setActiveSection}
                  />
                )}

                {editorTab === "words" && (
                  <div className="space-y-4">
                    {wordFields.length === 0 ? (
                      <p className="rounded-2xl bg-white p-8 text-center text-gray-500">No text on this page.</p>
                    ) : visibleWordFields.length === 0 ? (
                      <p className="rounded-2xl bg-white p-8 text-center text-gray-500">Pick a section above to start editing.</p>
                    ) : (
                      visibleWordFields.map((field) => (
                        <SimpleFieldCard
                          key={field.i18n_key}
                          field={field}
                          editLocale={editLocale}
                          isDirty={pageDirty.some((d) => d.i18n_key === field.i18n_key)}
                          onChange={(v) => updateDraft(field.i18n_key, editLocale, v)}
                          onReset={() => resetField(field.i18n_key)}
                        />
                      ))
                    )}
                  </div>
                )}

                {editorTab === "pictures" && (
                  <div className="space-y-4">
                    {pictureFields.length === 0 ? (
                      <p className="rounded-2xl bg-white p-8 text-center text-gray-500">
                        No pictures on this page. Try Homepage for hero images.
                      </p>
                    ) : visiblePictureFields.length === 0 ? (
                      <p className="rounded-2xl bg-white p-8 text-center text-gray-500">Pick a photo section above.</p>
                    ) : (
                      visiblePictureFields.map((field) => (
                        <SimpleFieldCard
                          key={field.i18n_key}
                          field={field}
                          editLocale={editLocale}
                          isDirty={pageDirty.some((d) => d.i18n_key === field.i18n_key)}
                          onChange={(v) => updateDraft(field.i18n_key, editLocale, v)}
                          onReset={() => resetField(field.i18n_key)}
                        />
                      ))
                    )}
                  </div>
                )}

                {editorTab === "preview" && (
                  <div className="h-[min(70vh,720px)]">
                    <CmsPreviewPanel
                      pageId={activePage}
                      previewTick={previewTick}
                      editLocale={editLocale}
                      isDark={false}
                      fields={fieldsWithLabels}
                      activePageFields={pageFields}
                      onRefresh={() => setPreviewTick((n) => n + 1)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky publish bar */}
        {step === "edit" && !loading && !needsSetup && (
          <div className="sticky bottom-0 z-30 border-t border-gray-200 bg-white px-4 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] sm:px-6">
            <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                {hasChanges ? (
                  <span className="font-medium text-amber-700">
                    {pageDirty.length} change{pageDirty.length === 1 ? "" : "s"} waiting — visitors do not see these yet
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    This page matches the live website
                  </span>
                )}
              </p>
              <Button
                variant="gold"
                size="lg"
                className="w-full sm:w-auto min-h-[52px] text-base font-bold"
                disabled={!hasChanges || publishing}
                onClick={() => void handlePublish()}
              >
                {publishing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving to website…
                  </>
                ) : (
                  <>
                    <CloudUpload className="mr-2 h-5 w-5" />
                    Put on live website
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        </main>
      </div>

      <MobileBottomNav role="admin" />
    </div>
  );
}

function StepPill({
  n,
  label,
  active,
  done,
  onClick,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors",
        active ? "bg-[#D4AF37] text-[#0D1B2A]" : done ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-xs">{done && !active ? "✓" : n}</span>
      {label}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Home;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors",
        active ? "bg-[#0D1B2A] text-white" : "text-gray-600 hover:bg-gray-100"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
      {count !== undefined && <span className="text-xs opacity-70">({count})</span>}
    </button>
  );
}

function LangButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-xl border-2 py-3 text-sm font-bold transition-colors",
        active ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#0D1B2A]" : "border-gray-200 bg-white text-gray-500"
      )}
    >
      {label}
    </button>
  );
}

function QuickOpen({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-[#0D1B2A] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a2f47]"
    >
      {label}
    </button>
  );
}

function SectionPicker({
  sections,
  activeId,
  onSelect,
}: {
  sections: EditorSection[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-[#0D1B2A]">Which part of the page?</p>
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={cn(
              "min-w-[120px] flex-1 rounded-xl border-2 px-3 py-3 text-left transition-colors sm:max-w-[200px]",
              activeId === section.id
                ? "border-[#D4AF37] bg-[#D4AF37]/15"
                : "border-gray-100 bg-gray-50 hover:border-[#D4AF37]/40"
            )}
          >
            <span className="block text-sm font-bold text-[#0D1B2A]">{section.label}</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-gray-500">{section.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export { CmsStudio as WebsiteContentAdmin };
