"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useCms } from "@/context/CmsContext";
import { CMS_PAGE_GROUPS } from "@/lib/cms/constants";
import { groupFieldsBySection } from "@/lib/cms/field-groups";
import type { MergedCmsField, EditLocale } from "@/lib/cms/merge-content";
import { buildSavePayloads, getDirtyFields } from "@/lib/cms/save-content";
import { getPreviewUrl } from "@/lib/cms/page-routes";
import { CmsLivePreview } from "@/components/admin/cms/CmsLivePreview";
import { CmsFieldEditor, CmsFieldGroup } from "@/components/admin/cms/CmsFieldEditor";
import { CmsStructuredEditors } from "@/components/admin/cms/CmsStructuredEditors";
import {
  Save,
  Search,
  RefreshCw,
  Database,
  FileText,
  MessageSquareQuote,
  Users,
  HelpCircle,
  Globe,
  Eye,
  CheckCircle2,
  Menu,
  X,
  Languages,
  Image as ImageIcon,
  LayoutPanelLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type EditorTab = "pages" | "images" | "testimonials" | "team" | "faqs" | "seo";

type CmsStats = {
  totalFields: number;
  persistedFields: number;
  customizedFields: number;
  byPage: Record<string, { total: number; customized: number }>;
};

export function WebsiteContentAdmin() {
  const { theme } = useTheme();
  const toast = useToast();
  const { refresh: refreshCms } = useCms();

  const [tab, setTab] = useState<EditorTab>("pages");
  const [activePage, setActivePage] = useState<(typeof CMS_PAGE_GROUPS)[number]["id"]>("home");
  const [editLocale, setEditLocale] = useState<EditLocale>("en");
  const [search, setSearch] = useState("");
  const [fields, setFields] = useState<MergedCmsField[]>([]);
  const [stats, setStats] = useState<CmsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbSeeded, setDbSeeded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [mobileNav, setMobileNav] = useState(false);
  const [previewTick, setPreviewTick] = useState(0);
  const [showPreview, setShowPreview] = useState(true);

  const isDark = theme === "dark";
  const textPrimary = isDark ? "text-white" : "text-[#0D1B2A]";
  const textMuted = isDark ? "text-gray-400" : "text-gray-600";
  const inputClass = cn(
    "w-full rounded-xl border px-4 py-3 text-sm focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20",
    isDark ? "border-white/15 bg-[#0D1B2A] text-white" : "border-gray-200 bg-white text-[#0D1B2A]"
  );

  const dirtyFields = useMemo(() => getDirtyFields(fields), [fields]);
  const dirty = dirtyFields.length > 0;

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/bulk", { cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        toast.error("Admin access required.");
        return;
      }
      if (!res.ok) throw new Error("Failed to load CMS content");
      const data = await res.json();
      setFields((data.content ?? []) as MergedCmsField[]);
      setStats(data.stats ?? null);
      setDbSeeded(Boolean(data.seeded));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const pageFields = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fields
      .filter((f) => (tab === "images" ? f.field_type === "image" : f.pageGroup === activePage))
      .filter(
        (f) =>
          !q ||
          f.i18n_key.toLowerCase().includes(q) ||
          f.field_name.toLowerCase().includes(q) ||
          f.draft.en.toLowerCase().includes(q) ||
          f.draft.de.toLowerCase().includes(q)
      );
  }, [fields, activePage, search, tab]);

  const fieldMap = useMemo(() => new Map(fields.map((f) => [f.i18n_key, f])), [fields]);

  const sectionGroups = useMemo(
    () => groupFieldsBySection(pageFields.map((f) => f.i18n_key)),
    [pageFields]
  );

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
    setSaveStatus("idle");
  };

  const resetField = (i18nKey: string) => {
    setFields((prev) =>
      prev.map((f) =>
        f.i18n_key === i18nKey ? { ...f, draft: { ...f.liveBaseline } } : f
      )
    );
  };

  const handleSyncToDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/bulk?action=seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      toast.success(`Synced ${data.count} fields from live website into database.`);
      await loadContent();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const toSave = tab === "pages" || tab === "images" ? dirtyFields : [];
    if (!toSave.length) {
      toast.error("No changes to save.");
      return;
    }

    setSaveStatus("saving");
    try {
      const updates = buildSavePayloads(toSave);
      const res = await fetch("/api/cms/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success(`Published ${data.count} field${data.count === 1 ? "" : "s"} to the live website.`);
      setSaveStatus("saved");
      await refreshCms();
      setPreviewTick((t) => t + 1);
      await loadContent();
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      setSaveStatus("idle");
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const pageLabel = CMS_PAGE_GROUPS.find((p) => p.id === activePage)?.label ?? activePage;
  const pageStats = stats?.byPage?.[activePage];
  const previewUrl = getPreviewUrl(activePage);

  const tabs: { id: EditorTab; label: string; icon: typeof FileText }[] = [
    { id: "pages", label: "Pages", icon: LayoutPanelLeft },
    { id: "images", label: "Images", icon: ImageIcon },
    { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
    { id: "team", label: "Team", icon: Users },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
    { id: "seo", label: "SEO", icon: Globe },
  ];

  const isPageTab = tab === "pages" || tab === "images";

  return (
    <div className={cn("flex min-h-screen", isDark ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]")}>
      <Sidebar role="admin" />

      <main className="flex min-w-0 flex-1 flex-col pt-20 md:pt-0">
        {/* Header */}
        <div
          className={cn(
            "sticky top-0 z-20 border-b px-4 py-4 sm:px-6",
            isDark ? "border-white/10 bg-[#0D1B2A]/95 backdrop-blur" : "border-gray-100 bg-white/95 backdrop-blur"
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className={cn("text-xl font-bold md:text-2xl", textPrimary)}>Website Content</h1>
              <p className={cn("mt-1 text-sm", textMuted)}>
                Edit every public page in real time — values load from the live site and publish instantly on save.
              </p>
              {stats && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">{stats.totalFields} fields</Badge>
                  <Badge variant="gold">{stats.customizedFields} customized</Badge>
                  {!dbSeeded && (
                    <Badge variant="warning">Not yet synced to database</Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => void handleSyncToDatabase()} disabled={loading}>
                <Database className="mr-2 h-4 w-4" />
                Sync to DB
              </Button>
              <Button variant="outline" size="sm" onClick={() => void loadContent()} disabled={loading}>
                <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                Reload
              </Button>
              <Link href={previewUrl.split("?")[0]} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Open page
                </Button>
              </Link>
              {isPageTab && (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => void handleSave()}
                  disabled={saveStatus === "saving" || !dirty}
                >
                  {saveStatus === "saved" ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Published
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {saveStatus === "saving" ? "Publishing…" : `Publish${dirty ? ` (${dirtyFields.length})` : ""}`}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className={cn("mt-4 flex gap-1 overflow-x-auto border-t pt-3", isDark ? "border-white/10" : "border-gray-100")}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  tab === id ? "bg-[#D4AF37] text-[#0D1B2A]" : isDark ? "text-gray-400 hover:text-white" : "text-gray-600"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {isPageTab ? (
          <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
            {/* Page sidebar */}
            <aside
              className={cn(
                "hidden w-56 shrink-0 overflow-y-auto border-r p-4 xl:block",
                isDark ? "border-white/10 bg-[#112240]" : "border-gray-100 bg-white"
              )}
            >
              <p className={cn("mb-3 text-xs font-semibold uppercase tracking-wider", textMuted)}>Website pages</p>
              <nav className="space-y-1">
                {CMS_PAGE_GROUPS.map((page) => {
                  const ps = stats?.byPage?.[page.id];
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => setActivePage(page.id)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        activePage === page.id
                          ? "bg-[#D4AF37] font-semibold text-[#0D1B2A]"
                          : isDark
                            ? "text-gray-300 hover:bg-white/10"
                            : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <span className="block">{page.label}</span>
                      <span className="text-xs opacity-70">
                        {ps?.total ?? 0} fields
                        {ps?.customized ? ` · ${ps.customized} live` : ""}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Mobile page picker */}
            <div className="flex items-center gap-2 border-b px-4 py-3 xl:hidden">
              <Button variant="outline" size="sm" onClick={() => setMobileNav(true)}>
                <Menu className="mr-2 h-4 w-4" />
                {pageLabel}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)}>
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? "Hide" : "Show"} preview
              </Button>
            </div>

            {/* Editor column */}
            <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <Card className={cn("mb-6 border-[#D4AF37]/30 p-4", isDark ? "bg-[#112240]" : "bg-amber-50/80")}>
                <p className={cn("text-sm", textMuted)}>
                  <strong className={textPrimary}>Live data:</strong> All fields show current website copy from locale
                  files merged with database overrides. Edit and click <strong>Publish</strong> — changes appear on the
                  public site immediately.
                  {!dbSeeded && " Use Sync to DB to persist the baseline into Supabase."}
                </p>
              </Card>

              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search fields on this page…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={cn(inputClass, "pl-10")}
                  />
                </div>
                <div className={cn("flex rounded-xl border p-1", isDark ? "border-white/15" : "border-gray-200")}>
                  {(["en", "de"] as const).map((lng) => (
                    <button
                      key={lng}
                      type="button"
                      onClick={() => setEditLocale(lng)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium",
                        editLocale === lng ? "bg-[#D4AF37] text-[#0D1B2A]" : textMuted
                      )}
                    >
                      <Languages className="h-3.5 w-3.5" />
                      {lng.toUpperCase()}
                    </button>
                  ))}
                </div>
                <Badge variant="outline">{pageFields.length} fields</Badge>
                {pageStats?.customized ? (
                  <Badge variant="gold">{pageStats.customized} customized</Badge>
                ) : null}
              </div>

              <h2 className={cn("mb-4 text-lg font-bold", textPrimary)}>
                {tab === "images" ? "All marketing images" : pageLabel}
              </h2>

              {loading ? (
                <p className={textMuted}>Loading live website content…</p>
              ) : pageFields.length === 0 ? (
                <p className={textMuted}>No fields match your search.</p>
              ) : tab === "images" ? (
                <div className="max-w-3xl space-y-4">
                  {pageFields.map((field) => (
                    <CmsFieldEditor
                      key={field.i18n_key}
                      field={field}
                      editLocale={editLocale}
                      isDark={isDark}
                      inputClass={inputClass}
                      isDirty={dirtyFields.some((d) => d.i18n_key === field.i18n_key)}
                      onChange={(v) => updateDraft(field.i18n_key, editLocale, v)}
                      onReset={() => resetField(field.i18n_key)}
                    />
                  ))}
                </div>
              ) : (
                <div className="max-w-3xl space-y-8">
                  {sectionGroups.map((group) => (
                    <CmsFieldGroup
                      key={group.id}
                      label={group.label}
                      count={group.fieldKeys.length}
                      isDark={isDark}
                    >
                      {group.fieldKeys.map((key) => {
                        const field = fieldMap.get(key);
                        if (!field) return null;
                        return (
                          <CmsFieldEditor
                            key={field.i18n_key}
                            field={field}
                            editLocale={editLocale}
                            isDark={isDark}
                            inputClass={inputClass}
                            isDirty={dirtyFields.some((d) => d.i18n_key === field.i18n_key)}
                            onChange={(v) => updateDraft(field.i18n_key, editLocale, v)}
                            onReset={() => resetField(field.i18n_key)}
                          />
                        );
                      })}
                    </CmsFieldGroup>
                  ))}
                </div>
              )}
            </div>

            {/* Live preview */}
            {showPreview && (
              <div
                className={cn(
                  "hidden w-full shrink-0 border-l p-4 xl:block xl:w-[42%] 2xl:w-[45%]",
                  isDark ? "border-white/10 bg-[#0A1628]" : "border-gray-200 bg-gray-100"
                )}
              >
                <div className="sticky top-24 h-[calc(100vh-7rem)]">
                  <CmsLivePreview
                    pageId={activePage}
                    previewTick={previewTick}
                    isDark={isDark}
                    onRefresh={() => setPreviewTick((t) => t + 1)}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <CmsStructuredEditors tab={tab} isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} inputClass={inputClass} />
        )}

        {/* Mobile page nav */}
        {mobileNav && (
          <>
            <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileNav(false)} />
            <div
              className={cn(
                "fixed top-20 bottom-0 left-0 z-50 w-72 overflow-y-auto p-4 lg:hidden",
                isDark ? "bg-[#112240]" : "bg-white"
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className={cn("font-bold", textPrimary)}>Pages</span>
                <button type="button" onClick={() => setMobileNav(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {CMS_PAGE_GROUPS.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => {
                      setActivePage(page.id);
                      setMobileNav(false);
                    }}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm",
                      activePage === page.id ? "bg-[#D4AF37] text-[#0D1B2A]" : textMuted
                    )}
                  >
                    {page.label}
                  </button>
                ))}
              </nav>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
