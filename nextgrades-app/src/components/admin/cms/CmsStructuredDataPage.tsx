"use client";

import { useCallback, useEffect, useState } from "react";
import { cmsFetch } from "@/lib/cms/cms-fetch";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChevronDown, ChevronUp, Plus, Save, Trash2 } from "lucide-react";
import { themeInputClass } from "@/lib/theme/form-fields";
import { cn } from "@/lib/utils";

type FieldDef = { key: string; label: string; textarea?: boolean };

type Config = {
  title: string;
  endpoint: string;
  fields: FieldDef[];
  empty: Record<string, unknown>;
};

const CONFIGS: Record<string, Config> = {
  programs: {
    title: "Programs",
    endpoint: "/api/cms/programs",
    fields: [
      { key: "slug", label: "Slug" },
      { key: "title_en", label: "Title (EN)" },
      { key: "title_de", label: "Title (DE)" },
      { key: "description_en", label: "Description (EN)", textarea: true },
      { key: "image_url", label: "Image URL" },
      { key: "price_label", label: "Price label" },
      { key: "cta_href", label: "Button link" },
    ],
    empty: { slug: "new-program", title_en: "New program", is_published: true, sort_order: 0 },
  },
  subjects: {
    title: "Subjects",
    endpoint: "/api/cms/subjects",
    fields: [
      { key: "slug", label: "Slug" },
      { key: "title_en", label: "Title (EN)" },
      { key: "title_de", label: "Title (DE)" },
      { key: "description_en", label: "Description (EN)", textarea: true },
      { key: "image_url", label: "Image URL" },
      { key: "category", label: "Category" },
    ],
    empty: { slug: "new-subject", title_en: "New subject", is_published: true, sort_order: 0 },
  },
  pricing: {
    title: "Pricing plans",
    endpoint: "/api/cms/pricing-plans",
    fields: [
      { key: "slug", label: "Slug" },
      { key: "name_en", label: "Plan name (EN)" },
      { key: "price_monthly", label: "Monthly price" },
      { key: "price_annual", label: "Annual price" },
      { key: "description_en", label: "Description", textarea: true },
    ],
    empty: { slug: "new-plan", name_en: "New plan", is_published: true, sort_order: 0 },
  },
  resources: {
    title: "Marketing resources",
    endpoint: "/api/cms/marketing-resources",
    fields: [
      { key: "title_en", label: "Title (EN)" },
      { key: "resource_type", label: "Type (article, pdf, video)" },
      { key: "file_url", label: "File URL" },
      { key: "category", label: "Category" },
    ],
    empty: { title_en: "New resource", resource_type: "article", is_published: true, sort_order: 0 },
  },
  testimonials: {
    title: "Testimonials",
    endpoint: "/api/cms/testimonials",
    fields: [
      { key: "name", label: "Name" },
      { key: "role", label: "Role / school" },
      { key: "content", label: "Quote", textarea: true },
      { key: "rating", label: "Rating (1-5)" },
    ],
    empty: { name: "", role: "", content: "", rating: 5, is_active: true, sort_order: 0 },
  },
  team: {
    title: "Team members",
    endpoint: "/api/cms/team",
    fields: [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "bio", label: "Bio", textarea: true },
      { key: "photo_url", label: "Photo URL" },
    ],
    empty: { name: "", role: "", bio: "", photo_url: "", is_active: true, sort_order: 0 },
  },
  faqs: {
    title: "FAQs",
    endpoint: "/api/cms/faqs",
    fields: [
      { key: "question", label: "Question" },
      { key: "answer", label: "Answer", textarea: true },
      { key: "category", label: "Category" },
    ],
    empty: { question: "", answer: "", category: "general", is_active: true, sort_order: 0 },
  },
};

export function CmsStructuredDataPage({ kind }: { kind: keyof typeof CONFIGS }) {
  const config = CONFIGS[kind];
  const toast = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await cmsFetch(config.endpoint);
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, [config.endpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (item: Record<string, unknown>) => {
    const method = item.id ? "PUT" : "POST";
    const res = await cmsFetch(config.endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      toast.error("Save failed");
      return;
    }
    toast.success("Saved");
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const res = await cmsFetch(config.endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    await load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    for (let i = 0; i < next.length; i++) {
      await save({ ...next[i], sort_order: i });
    }
    await load();
  };

  const addNew = () => {
    setItems((prev) => [...prev, { ...config.empty, sort_order: prev.length }]);
  };

  const updateField = (index: number, key: string, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
            <p className="mt-1 text-sm text-text-muted">Add, edit, delete, and reorder items.</p>
          </div>
          <Button variant="gold" onClick={addNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add new
          </Button>
        </div>

        {loading ? (
          <p className="mt-8 text-text-muted">Loading…</p>
        ) : (
          <div className="mt-6 space-y-4">
            {items.map((item, i) => (
              <Card key={String(item.id ?? `new-${i}`)} hoverable={false} className="space-y-3 p-5">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    className="rounded-lg border border-border-default p-2 text-foreground transition-colors hover:bg-surface-subtle"
                    onClick={() => void move(i, -1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-border-default p-2 text-foreground transition-colors hover:bg-surface-subtle"
                    onClick={() => void move(i, 1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {item.id != null ? (
                    <button
                      type="button"
                      className="rounded-lg border border-border-default p-2 text-[var(--alert-error-fg)] transition-colors hover:bg-[var(--alert-error-bg)]"
                      onClick={() => void remove(String(item.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                {config.fields.map((f) =>
                  f.textarea ? (
                    <label key={f.key} className="block text-sm">
                      <span className="font-medium text-foreground">{f.label}</span>
                      <textarea
                        rows={2}
                        className={cn(themeInputClass, "mt-1 py-2.5")}
                        value={String(item[f.key] ?? "")}
                        onChange={(e) => updateField(i, f.key, e.target.value)}
                      />
                    </label>
                  ) : (
                    <label key={f.key} className="block text-sm">
                      <span className="font-medium text-foreground">{f.label}</span>
                      <input
                        className={cn(themeInputClass, "mt-1 py-2.5")}
                        value={String(item[f.key] ?? "")}
                        onChange={(e) => updateField(i, f.key, e.target.value)}
                      />
                    </label>
                  )
                )}
                <Button variant="outline" size="sm" onClick={() => void save(item)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
