"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import type { CmsFaq, CmsSeo, CmsTeamMember, CmsTestimonial } from "@/lib/cms/types";
import { Plus, Save, Trash2 } from "lucide-react";

type Tab = "testimonials" | "team" | "faqs" | "seo";

type Props = {
  tab: Tab;
  isDark: boolean;
  textPrimary: string;
  textMuted: string;
  inputClass: string;
};

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
  const [localItems, setLocalItems] = useState<T[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

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
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error("Delete failed");
    toast.success("Deleted");
    onReload();
  };

  const updateItemField = (index: number, key: string, value: string) => {
    setLocalItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  return (
    <div className="max-w-3xl p-4 sm:p-6">
      <h2 className={`mb-6 text-lg font-bold ${textPrimary}`}>{title}</h2>

      <Card className={`mb-8 space-y-4 p-5 ${isDark ? "bg-[#112240]" : "bg-white"}`}>
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
              type={f.type ?? "text"}
              placeholder={f.label}
              className={inputClass}
              value={String((draft as Record<string, unknown>)[f.key] ?? "")}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
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
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </Card>

      <div className="space-y-4">
        {localItems.length === 0 ? (
          <p className={textMuted}>No entries yet.</p>
        ) : (
          localItems.map((item, index) => (
            <Card key={item.id ?? index} className={`space-y-3 p-5 ${isDark ? "bg-[#112240]" : "bg-white"}`}>
              {fields.map((f) => (
                <div key={f.key}>
                  <label className={`text-xs font-semibold ${textMuted}`}>{f.label}</label>
                  {f.textarea ? (
                    <textarea
                      rows={3}
                      className={`${inputClass} mt-1`}
                      value={String((item as Record<string, unknown>)[f.key] ?? "")}
                      onChange={(e) => updateItemField(index, f.key, e.target.value)}
                    />
                  ) : (
                    <input
                      type={f.type ?? "text"}
                      className={`${inputClass} mt-1`}
                      value={String((item as Record<string, unknown>)[f.key] ?? "")}
                      onChange={(e) => updateItemField(index, f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="gold" size="sm" onClick={() => void saveItem(localItems[index])}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                {item.id && (
                  <Button variant="outline" size="sm" onClick={() => void deleteItem(item.id!)}>
                    <Trash2 className="h-4 w-4" />
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

const SEO_PAGES = [
  "home",
  "about",
  "programs",
  "subjects",
  "resources",
  "pricing",
  "consultation",
  "contact",
  "help",
  "careers",
];

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
    return SEO_PAGES.map((page) =>
      map.get(page) || {
        page_name: page,
        title: "",
        description: "",
        keywords: "",
        og_title: "",
        og_description: "",
        og_image_url: "",
      }
    );
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
    <div className="max-w-3xl space-y-6 p-4 sm:p-6">
      <h2 className={`text-lg font-bold ${textPrimary}`}>SEO per page</h2>
      {byPage.map((row) => (
        <Card key={row.page_name} className={`space-y-3 p-5 ${isDark ? "bg-[#112240]" : "bg-white"}`}>
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
            placeholder="Keywords (comma-separated)"
            defaultValue={row.keywords ?? ""}
            id={`seo-kw-${row.page_name}`}
          />
          <input
            className={inputClass}
            placeholder="Open Graph title"
            defaultValue={row.og_title ?? ""}
            id={`seo-og-title-${row.page_name}`}
          />
          <textarea
            className={inputClass}
            rows={2}
            placeholder="Open Graph description"
            defaultValue={row.og_description ?? ""}
            id={`seo-og-desc-${row.page_name}`}
          />
          <input
            className={inputClass}
            placeholder="Social sharing image URL"
            defaultValue={row.og_image_url ?? ""}
            id={`seo-og-img-${row.page_name}`}
          />
          <Button
            variant="gold"
            size="sm"
            onClick={() => {
              const title = (document.getElementById(`seo-title-${row.page_name}`) as HTMLInputElement)?.value;
              const description = (document.getElementById(`seo-desc-${row.page_name}`) as HTMLTextAreaElement)?.value;
              const keywords = (document.getElementById(`seo-kw-${row.page_name}`) as HTMLInputElement)?.value;
              const og_title = (document.getElementById(`seo-og-title-${row.page_name}`) as HTMLInputElement)?.value;
              const og_description = (document.getElementById(`seo-og-desc-${row.page_name}`) as HTMLTextAreaElement)?.value;
              const og_image_url = (document.getElementById(`seo-og-img-${row.page_name}`) as HTMLInputElement)?.value;
              void save({ ...row, title, description, keywords, og_title, og_description, og_image_url });
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            Save SEO
          </Button>
        </Card>
      ))}
      <p className={`text-xs ${textMuted}`}>SEO rows are stored separately from page copy.</p>
    </div>
  );
}

export function CmsStructuredEditors({ tab, isDark, textPrimary, textMuted, inputClass }: Props) {
  const [testimonials, setTestimonials] = useState<CmsTestimonial[]>([]);
  const [team, setTeam] = useState<CmsTeamMember[]>([]);
  const [faqs, setFaqs] = useState<CmsFaq[]>([]);
  const [seoRows, setSeoRows] = useState<CmsSeo[]>([]);

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
    void loadExtras();
  }, [loadExtras, tab]);

  if (tab === "testimonials") {
    return (
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
    );
  }

  if (tab === "team") {
    return (
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
    );
  }

  if (tab === "faqs") {
    return (
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
    );
  }

  return (
    <SeoEditor
      rows={seoRows}
      isDark={isDark}
      textPrimary={textPrimary}
      textMuted={textMuted}
      inputClass={inputClass}
      onReload={loadExtras}
    />
  );
}
