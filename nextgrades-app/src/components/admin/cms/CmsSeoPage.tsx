"use client";

import { useCallback, useEffect, useState } from "react";
import { CMS_SIDEBAR_PAGES } from "@/lib/cms/cms-nav";
import { cmsFetch } from "@/lib/cms/cms-fetch";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CmsSeo } from "@/lib/cms/types";
import { Gauge, Save } from "lucide-react";

function seoScore(title: string, desc: string): { score: number; tips: string[] } {
  const tips: string[] = [];
  let score = 100;
  if (!title.trim()) {
    score -= 30;
    tips.push("Add a meta title");
  } else if (title.length > 60) {
    score -= 10;
    tips.push("Meta title is long — aim for under 60 characters");
  }
  if (!desc.trim()) {
    score -= 25;
    tips.push("Add a meta description");
  } else if (desc.length < 120) {
    score -= 10;
    tips.push("Description could be longer (120–160 characters is ideal)");
  } else if (desc.length > 160) {
    score -= 10;
    tips.push("Description may be truncated in search results");
  }
  return { score: Math.max(0, score), tips };
}

export function CmsSeoPage() {
  const toast = useToast();
  const [rows, setRows] = useState<CmsSeo[]>([]);
  const [activePage, setActivePage] = useState("home");
  const [form, setForm] = useState<Partial<CmsSeo>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await cmsFetch("/api/cms/seo");
    if (res.ok) setRows(await res.json());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const row = rows.find((r) => r.page_name === activePage);
    setForm(
      row ?? {
        page_name: activePage,
        title: "",
        description: "",
        keywords: "",
        og_image_url: "",
        og_title: "",
        og_description: "",
      }
    );
  }, [activePage, rows]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await cmsFetch("/api/cms/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast.success("SEO saved");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const analysis = seoScore(form.title ?? "", form.description ?? "");

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-[#0D1B2A]">SEO settings</h1>
        <p className="mt-1 text-gray-600">Control how each page appears in Google and social shares.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {CMS_SIDEBAR_PAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePage(p.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                activePage === p.id ? "bg-[#D4AF37] text-[#0D1B2A]" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <Card className="mt-6 space-y-4 p-6">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
            <Gauge className="h-8 w-8 text-[#D4AF37]" />
            <div>
              <p className="font-bold text-[#0D1B2A]">SEO score: {analysis.score}/100</p>
              <ul className="mt-1 text-sm text-gray-600">
                {analysis.tips.length ? analysis.tips.map((t) => <li key={t}>• {t}</li>) : <li>Looking good!</li>}
              </ul>
            </div>
          </div>

          <Field label="Meta title" value={form.title ?? ""} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
          <Field label="Meta description" value={form.description ?? ""} onChange={(v) => setForm((f) => ({ ...f, description: v }))} textarea />
          <Field label="Keywords (comma-separated)" value={form.keywords ?? ""} onChange={(v) => setForm((f) => ({ ...f, keywords: v }))} />
          <Field label="Open Graph title" value={form.og_title ?? ""} onChange={(v) => setForm((f) => ({ ...f, og_title: v }))} />
          <Field label="Open Graph description" value={form.og_description ?? ""} onChange={(v) => setForm((f) => ({ ...f, og_description: v }))} textarea />
          <Field label="Social sharing image URL" value={form.og_image_url ?? ""} onChange={(v) => setForm((f) => ({ ...f, og_image_url: v }))} />

          <Button variant="gold" onClick={() => void save()} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save SEO
          </Button>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const cls = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#D4AF37] focus:outline-none";
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {textarea ? (
        <textarea rows={3} className={`${cls} mt-1`} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={`${cls} mt-1`} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
