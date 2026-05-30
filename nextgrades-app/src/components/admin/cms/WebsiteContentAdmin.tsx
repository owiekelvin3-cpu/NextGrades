"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useCms } from "@/context/CmsContext";
import { CMS_PAGE_GROUPS, humanizeKey, getPageGroupForKey } from "@/lib/cms/constants";
import { buildSeedEntries } from "@/lib/cms/seed";
import { parseCmsValue, serializeCmsValue } from "@/lib/cms/flatten";
import type { CmsContentRow, CmsFaq, CmsSeo, CmsTeamMember, CmsTestimonial } from "@/lib/cms/types";
import type { CmsFieldType } from "@/lib/cms/flatten";
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
  Plus,
  Trash2,
  CheckCircle2,
  Menu,
  X,
  Languages,
} from "lucide-react";
import Link from "next/link";

type EditorTab = "pages" | "testimonials" | "team" | "faqs" | "seo";
type EditLocale = "en" | "de";

type EditableField = CmsContentRow & {
  pageGroup: string;
  draft: { en: string; de: string };
};

function getValueForLocale(row: CmsContentRow, locale: EditLocale): unknown {
  const json = row.content_json as { en?: unknown; de?: unknown } | null;
  if (json && json[locale] !== undefined) return json[locale];
  if (locale === "en" && row.content_value) {
    if (row.field_type === "json") {
      try {
        return JSON.parse(row.content_value);
      } catch {
        return row.content_value;
      }
    }
    return row.content_value;
  }
  return "";
}

function fieldsFromSeed(): EditableField[] {
  return buildSeedEntries().map((entry, index) => ({
    id: `local-${entry.i18nKey}`,
    section_id: null,
    i18n_key: entry.i18nKey,
    field_key: entry.i18nKey,
    field_name: humanizeKey(entry.i18nKey),
    field_type: entry.fieldType,
    content_value: typeof entry.valueEn === "string" ? entry.valueEn : null,
    content_json: { en: entry.valueEn, de: entry.valueDe },
    sort_order: index,
    pageGroup: entry.pageGroup,
    draft: {
      en: serializeCmsValue(entry.valueEn),
      de: serializeCmsValue(entry.valueDe),
    },
  }));
}

export function WebsiteContentAdmin() {
  const { theme } = useTheme();
  const toast = useToast();
  const { refresh: refreshCms } = useCms();

  const [tab, setTab] = useState<EditorTab>("pages");
  const [activePage, setActivePage] = useState<(typeof CMS_PAGE_GROUPS)[number]["id"]>(CMS_PAGE_GROUPS[0].id);
  const [editLocale, setEditLocale] = useState<EditLocale>("en");
  const [search, setSearch] = useState("");
  const [fields, setFields] = useState<EditableField[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [mobileNav, setMobileNav] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [testimonials, setTestimonials] = useState<CmsTestimonial[]>([]);
  const [team, setTeam] = useState<CmsTeamMember[]>([]);
  const [faqs, setFaqs] = useState<CmsFaq[]>([]);
  const [seoRows, setSeoRows] = useState<CmsSeo[]>([]);

  const isDark = theme === "dark";
  const textPrimary = isDark ? "text-white" : "text-[#0D1B2A]";
  const textMuted = isDark ? "text-gray-400" : "text-gray-600";
  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm ${
    isDark ? "border-white/15 bg-[#0D1B2A] text-white" : "border-gray-200 bg-white text-[#0D1B2A]"
  }`;

  const mapRowsToFields = useCallback((rows: CmsContentRow[]): EditableField[] => {
    return rows.map((row) => {
      const i18nKey = row.i18n_key || row.field_key;
      return {
        ...row,
        i18n_key: i18nKey,
        pageGroup: getPageGroupForKey(i18nKey),
        draft: {
          en: serializeCmsValue(getValueForLocale(row, "en")),
          de: serializeCmsValue(getValueForLocale(row, "de")),
        },
      };
    });
  }, []);

  const loadBulk = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/bulk");
      if (res.status === 401 || res.status === 403) {
        setFields(fieldsFromSeed());
        setSeeded(false);
        toast.error("Admin login required to save to database. Showing local copy.");
        return;
      }
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      const content = (data.content || []) as CmsContentRow[];
      if (content.length) {
        setFields(mapRowsToFields(content));
        setSeeded(true);
      } else {
        setFields(fieldsFromSeed());
        setSeeded(false);
      }
    } catch {
      setFields(fieldsFromSeed());
      setSeeded(false);
    } finally {
      setLoading(false);
    }
  }, [mapRowsToFields, toast]);

  const loadExtras = useCallback(async () => {
    const [t, tm, f, s] = await Promise.all([
      fetch("/api/cms/testimonials").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/cms/team").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/cms/faqs").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/cms/seo").then((r) => (r.ok ? r.json() : [])),
    ]);
    setTestimonials(t);
    setTeam(tm);
    setFaqs(f);
    setSeoRows(s);
  }, []);

  useEffect(() => {
    void loadBulk();
    void loadExtras();
  }, [loadBulk, loadExtras]);

  const filteredFields = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fields
      .filter((f) => f.pageGroup === activePage)
      .filter(
        (f) =>
          !q ||
          f.i18n_key.toLowerCase().includes(q) ||
          f.field_name.toLowerCase().includes(q) ||
          f.draft.en.toLowerCase().includes(q) ||
          f.draft.de.toLowerCase().includes(q)
      );
  }, [fields, activePage, search]);

  const updateDraft = (id: string, locale: EditLocale, value: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, draft: { ...f.draft, [locale]: value } } : f))
    );
    setDirty(true);
    setSaveStatus("idle");
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/bulk?action=seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Seed failed");
      toast.success(`Imported ${data.count} content fields from website locales.`);
      await loadBulk();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Seed failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePages = async () => {
    const dbFields = fields.filter((f) => !f.id.startsWith("local-"));
    if (!dbFields.length) {
      toast.error("Initialize CMS from database first (Import website content).");
      return;
    }

    setSaveStatus("saving");
    try {
      const updates = dbFields.map((field) => {
        const fieldType = field.field_type as CmsFieldType;
        let content_json: { en?: unknown; de?: unknown };
        try {
          content_json = {
            en: parseCmsValue(field.draft.en, fieldType),
            de: parseCmsValue(field.draft.de, fieldType),
          };
        } catch {
          throw new Error(`Invalid JSON in field: ${field.i18n_key}`);
        }
        const enStr = field.draft.en;
        return {
          id: field.id,
          content_json,
          content_value: fieldType === "text" || fieldType === "textarea" ? enStr : JSON.stringify(content_json.en),
        };
      });

      const res = await fetch("/api/cms/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setSaveStatus("saved");
      setDirty(false);
      toast.success("Website content saved. Changes are live.");
      await refreshCms();
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      setSaveStatus("idle");
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  const pageLabel = CMS_PAGE_GROUPS.find((p) => p.id === activePage)?.label ?? activePage;

  const tabs: { id: EditorTab; label: string; icon: typeof FileText }[] = [
    { id: "pages", label: "Page copy", icon: FileText },
    { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
    { id: "team", label: "Team", icon: Users },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
    { id: "seo", label: "SEO", icon: Globe },
  ];

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Sidebar role="admin" />

      <main className="flex-1 flex flex-col pt-20 md:pt-0 min-w-0">
        {/* Top bar */}
        <div
          className={`sticky top-0 z-20 border-b px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 ${
            isDark ? "bg-[#0D1B2A]/95 border-white/10 backdrop-blur" : "bg-white/95 border-gray-100 backdrop-blur"
          }`}
        >
          <div>
            <h1 className={`text-xl md:text-2xl font-bold ${textPrimary}`}>Website Content</h1>
            <p className={`text-sm ${textMuted}`}>Edit all public website text in English and German</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!seeded && (
              <Button variant="outline" size="sm" onClick={handleSeed} disabled={loading}>
                <Database className="w-4 h-4 mr-2" />
                Import website content
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => loadBulk()} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Reload
            </Button>
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview site
              </Button>
            </Link>
            {tab === "pages" && (
              <Button variant="gold" size="sm" onClick={handleSavePages} disabled={saveStatus === "saving" || !dirty}>
                {saveStatus === "saved" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {saveStatus === "saving" ? "Saving…" : "Save changes"}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Tab nav */}
        <div className={`flex gap-1 px-4 sm:px-6 py-2 border-b overflow-x-auto ${isDark ? "border-white/10" : "border-gray-100"}`}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === id ? "bg-[#D4AF37] text-[#0D1B2A]" : isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-[#0D1B2A]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "pages" && (
          <div className="flex flex-1 min-h-0">
            {/* Page sidebar - desktop */}
            <aside
              className={`hidden lg:block w-56 shrink-0 border-r p-4 overflow-y-auto ${
                isDark ? "border-white/10 bg-[#112240]" : "border-gray-100 bg-white"
              }`}
            >
              <nav className="space-y-1">
                {CMS_PAGE_GROUPS.map((page) => {
                  const count = fields.filter((f) => f.pageGroup === page.id).length;
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => setActivePage(page.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        activePage === page.id
                          ? "bg-[#D4AF37] text-[#0D1B2A] font-semibold"
                          : isDark
                            ? "text-gray-300 hover:bg-white/10"
                            : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {page.label}
                      <span className="ml-1 opacity-60">({count})</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Mobile page picker */}
            <div className="lg:hidden px-4 pt-3">
              <Button variant="outline" size="sm" onClick={() => setMobileNav(true)}>
                <Menu className="w-4 h-4 mr-2" />
                {pageLabel}
              </Button>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {!seeded && (
                <Card className={`p-4 mb-6 border-[#D4AF37]/40 ${isDark ? "bg-[#112240]" : "bg-amber-50"}`}>
                  <p className={`text-sm ${textMuted}`}>
                    Click <strong>Import website content</strong> to copy all current English & German text from the site
                    into the database. You can then edit and publish changes live.
                  </p>
                </Card>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search fields…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <div className={`flex rounded-xl border p-1 ${isDark ? "border-white/15" : "border-gray-200"}`}>
                  {(["en", "de"] as const).map((lng) => (
                    <button
                      key={lng}
                      type="button"
                      onClick={() => setEditLocale(lng)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${
                        editLocale === lng ? "bg-[#D4AF37] text-[#0D1B2A]" : textMuted
                      }`}
                    >
                      <Languages className="w-3.5 h-3.5" />
                      {lng.toUpperCase()}
                    </button>
                  ))}
                </div>
                <Badge variant="outline">{filteredFields.length} fields</Badge>
              </div>

              <h2 className={`text-lg font-bold mb-4 ${textPrimary}`}>{pageLabel}</h2>

              {loading ? (
                <p className={textMuted}>Loading content…</p>
              ) : filteredFields.length === 0 ? (
                <p className={textMuted}>No fields match your search.</p>
              ) : (
                <div className="space-y-6 max-w-4xl">
                  {filteredFields.map((field) => (
                    <Card key={field.id} className={`p-5 ${isDark ? "bg-[#112240] border-white/10" : "bg-white"}`}>
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <p className={`font-semibold ${textPrimary}`}>{field.field_name}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{field.i18n_key}</p>
                        </div>
                        <Badge variant={field.field_type === "json" ? "warning" : "gold"}>{field.field_type}</Badge>
                      </div>

                      {field.field_type === "json" ? (
                        <textarea
                          rows={8}
                          className={`${inputClass} font-mono text-xs`}
                          value={field.draft[editLocale]}
                          onChange={(e) => updateDraft(field.id, editLocale, e.target.value)}
                        />
                      ) : field.field_type === "textarea" ? (
                        <textarea
                          rows={4}
                          className={inputClass}
                          value={field.draft[editLocale]}
                          onChange={(e) => updateDraft(field.id, editLocale, e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          className={inputClass}
                          value={field.draft[editLocale]}
                          onChange={(e) => updateDraft(field.id, editLocale, e.target.value)}
                        />
                      )}

                      {editLocale === "en" && field.draft.de && (
                        <p className={`text-xs mt-2 ${textMuted}`}>
                          DE preview: {field.draft.de.slice(0, 80)}
                          {field.draft.de.length > 80 ? "…" : ""}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "testimonials" && (
          <StructuredListEditor
            title="Testimonials"
            items={testimonials}
            isDark={isDark}
            textPrimary={textPrimary}
            textMuted={textMuted}
            inputClass={inputClass}
            onReload={loadExtras}
            endpoint="/api/cms/testimonials"
            fields={[
              { key: "name", label: "Name" },
              { key: "role", label: "Role" },
              { key: "content", label: "Quote", textarea: true },
              { key: "rating", label: "Rating (1-5)", type: "number" },
            ]}
            emptyItem={{ name: "", role: "", content: "", rating: 5, is_active: true, sort_order: 0 }}
          />
        )}

        {tab === "team" && (
          <StructuredListEditor
            title="Team members"
            items={team}
            isDark={isDark}
            textPrimary={textPrimary}
            textMuted={textMuted}
            inputClass={inputClass}
            onReload={loadExtras}
            endpoint="/api/cms/team"
            fields={[
              { key: "name", label: "Name" },
              { key: "role", label: "Role" },
              { key: "bio", label: "Bio", textarea: true },
              { key: "photo_url", label: "Photo URL" },
            ]}
            emptyItem={{ name: "", role: "", bio: "", photo_url: "", is_active: true, sort_order: 0 }}
          />
        )}

        {tab === "faqs" && (
          <StructuredListEditor
            title="FAQs"
            items={faqs}
            isDark={isDark}
            textPrimary={textPrimary}
            textMuted={textMuted}
            inputClass={inputClass}
            onReload={loadExtras}
            endpoint="/api/cms/faqs"
            fields={[
              { key: "question", label: "Question" },
              { key: "answer", label: "Answer", textarea: true },
              { key: "category", label: "Category" },
            ]}
            emptyItem={{ question: "", answer: "", category: "general", is_active: true, sort_order: 0 }}
          />
        )}

        {tab === "seo" && (
          <SeoEditor
            rows={seoRows}
            isDark={isDark}
            textPrimary={textPrimary}
            textMuted={textMuted}
            inputClass={inputClass}
            onReload={loadExtras}
          />
        )}

        {/* Mobile nav overlay */}
        {mobileNav && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileNav(false)} />
            <div
              className={`fixed top-20 left-0 bottom-0 w-72 z-50 p-4 overflow-y-auto lg:hidden ${
                isDark ? "bg-[#112240]" : "bg-white"
              }`}
            >
              <div className="flex justify-between mb-4">
                <span className={`font-bold ${textPrimary}`}>Pages</span>
                <button type="button" onClick={() => setMobileNav(false)}>
                  <X className="w-5 h-5" />
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
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      activePage === page.id ? "bg-[#D4AF37] text-[#0D1B2A]" : textMuted
                    }`}
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

type FieldConfig = {
  key: string;
  label: string;
  textarea?: boolean;
  type?: string;
};

function StructuredListEditor<T extends { id?: string }>({
  title,
  items,
  fields,
  emptyItem,
  endpoint,
  isDark,
  textPrimary,
  textMuted,
  inputClass,
  onReload,
}: {
  title: string;
  items: T[];
  fields: FieldConfig[];
  emptyItem: Partial<T>;
  endpoint: string;
  isDark: boolean;
  textPrimary: string;
  textMuted: string;
  inputClass: string;
  onReload: () => void;
}) {
  const toast = useToast();
  const [draft, setDraft] = useState<Partial<T>>(emptyItem);

  const saveItem = async (item: T) => {
    const method = item.id ? "PUT" : "POST";
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Save failed");
    }
    toast.success("Saved");
    onReload();
  };

  const deleteItem = async (id: string) => {
    const res = await fetch(endpoint, { method: "DELETE", body: JSON.stringify({ id }) });
    if (!res.ok) throw new Error("Delete failed");
    toast.success("Deleted");
    onReload();
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <h2 className={`text-lg font-bold mb-6 ${textPrimary}`}>{title}</h2>

      <Card className={`p-5 mb-8 space-y-4 ${isDark ? "bg-[#112240]" : "bg-white"}`}>
        <p className={`text-sm font-semibold ${textPrimary}`}>Add new</p>
        {fields.map((f) =>
          f.textarea ? (
            <textarea
              key={f.key}
              rows={3}
              placeholder={f.label}
              className={inputClass}
              value={String((draft as Record<string, unknown>)[f.key] ?? "")}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
            />
          ) : (
            <input
              key={f.key}
              type={f.type || "text"}
              placeholder={f.label}
              className={inputClass}
              value={String((draft as Record<string, unknown>)[f.key] ?? "")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value,
                })
              }
            />
          )
        )}
        <Button
          variant="gold"
          size="sm"
          onClick={() => {
            void saveItem(draft as T).then(() => setDraft(emptyItem));
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </Card>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className={textMuted}>No entries yet. Import website content or add items above.</p>
        ) : (
          items.map((item) => (
            <Card key={item.id} className={`p-5 space-y-3 ${isDark ? "bg-[#112240]" : "bg-white"}`}>
              {fields.map((f) => (
                <div key={f.key}>
                  <label className={`text-xs font-semibold ${textMuted}`}>{f.label}</label>
                  {f.textarea ? (
                    <textarea
                      rows={3}
                      className={`${inputClass} mt-1`}
                      value={String((item as Record<string, unknown>)[f.key] ?? "")}
                      onChange={(e) => {
                        Object.assign(item, { [f.key]: e.target.value });
                      }}
                    />
                  ) : (
                    <input
                      className={`${inputClass} mt-1`}
                      value={String((item as Record<string, unknown>)[f.key] ?? "")}
                      onChange={(e) => {
                        Object.assign(item, { [f.key]: e.target.value });
                      }}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="gold" size="sm" onClick={() => void saveItem(item)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                {item.id && (
                  <Button variant="outline" size="sm" onClick={() => void deleteItem(item.id!)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

const SEO_PAGES = ["home", "about", "programs", "subjects", "resources", "pricing", "consultation", "contact", "help", "careers"];

function SeoEditor({
  rows,
  isDark,
  textPrimary,
  textMuted,
  inputClass,
  onReload,
}: {
  rows: CmsSeo[];
  isDark: boolean;
  textPrimary: string;
  textMuted: string;
  inputClass: string;
  onReload: () => void;
}) {
  const toast = useToast();
  const byPage = useMemo(() => {
    const map = new Map(rows.map((r) => [r.page_name, r]));
    return SEO_PAGES.map((page) => map.get(page) || { page_name: page, title: "", description: "", keywords: "" });
  }, [rows]);

  const save = async (row: Partial<CmsSeo> & { page_name: string }) => {
    const res = await fetch("/api/cms/seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error("Save failed");
    toast.success("SEO saved");
    onReload();
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl space-y-6">
      <h2 className={`text-lg font-bold ${textPrimary}`}>SEO per page</h2>
      {byPage.map((row) => (
        <Card key={row.page_name} className={`p-5 space-y-3 ${isDark ? "bg-[#112240]" : "bg-white"}`}>
          <p className={`font-semibold capitalize ${textPrimary}`}>{row.page_name}</p>
          <input
            className={inputClass}
            placeholder="Meta title"
            defaultValue={row.title ?? ""}
            id={`seo-title-${row.page_name}`}
          />
          <textarea
            className={inputClass}
            rows={2}
            placeholder="Meta description"
            defaultValue={row.description ?? ""}
            id={`seo-desc-${row.page_name}`}
          />
          <input
            className={inputClass}
            placeholder="Keywords"
            defaultValue={row.keywords ?? ""}
            id={`seo-kw-${row.page_name}`}
          />
          <Button
            variant="gold"
            size="sm"
            onClick={() => {
              const title = (document.getElementById(`seo-title-${row.page_name}`) as HTMLInputElement).value;
              const description = (document.getElementById(`seo-desc-${row.page_name}`) as HTMLTextAreaElement).value;
              const keywords = (document.getElementById(`seo-kw-${row.page_name}`) as HTMLInputElement).value;
              void save({
                id: "id" in row ? row.id : undefined,
                page_name: row.page_name,
                title,
                description,
                keywords,
              } as Partial<CmsSeo> & { page_name: string });
            }}
          >
            Save
          </Button>
        </Card>
      ))}
      <p className={`text-xs ${textMuted}`}>SEO metadata is stored in the database for future dynamic meta tags.</p>
    </div>
  );
}
