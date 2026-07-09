"use client";

import { useCallback, useEffect, useState } from "react";
import { cmsFetch } from "@/lib/cms/cms-fetch";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Save } from "lucide-react";

type ThemeSettings = {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  border_radius: string;
  font_heading: string;
  font_body: string;
};

const defaults: ThemeSettings = {
  primary_color: "#D4AF37",
  secondary_color: "#0D1B2A",
  accent_color: "#1B4965",
  logo_url: null,
  logo_dark_url: null,
  favicon_url: null,
  border_radius: "0.75rem",
  font_heading: "inherit",
  font_body: "inherit",
};

export function CmsThemePage() {
  const toast = useToast();
  const [form, setForm] = useState<ThemeSettings>(defaults);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await cmsFetch("/api/cms/theme");
    if (res.ok) {
      const data = await res.json();
      if (data) setForm({ ...defaults, ...data });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await cmsFetch("/api/cms/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }
      toast.success("Theme updated - refresh the public site to see changes");
      document.documentElement.style.setProperty("--cms-primary", form.primary_color);
      document.documentElement.style.setProperty("--cms-secondary", form.secondary_color);
      document.documentElement.style.setProperty("--cms-accent", form.accent_color);
      document.documentElement.style.setProperty("--cms-radius", form.border_radius);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-[#0D1B2A]">Theme settings</h1>
        <p className="mt-1 text-gray-600">Brand colors, logos, and global styling.</p>

        <Card className="mt-6 space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <ColorField label="Primary" value={form.primary_color} onChange={(v) => setForm((f) => ({ ...f, primary_color: v }))} />
            <ColorField label="Secondary" value={form.secondary_color} onChange={(v) => setForm((f) => ({ ...f, secondary_color: v }))} />
            <ColorField label="Accent" value={form.accent_color} onChange={(v) => setForm((f) => ({ ...f, accent_color: v }))} />
          </div>
          <TextField label="Logo URL (light background)" value={form.logo_url ?? ""} onChange={(v) => setForm((f) => ({ ...f, logo_url: v || null }))} />
          <TextField label="Logo URL (dark background)" value={form.logo_dark_url ?? ""} onChange={(v) => setForm((f) => ({ ...f, logo_dark_url: v || null }))} />
          <TextField label="Favicon URL" value={form.favicon_url ?? ""} onChange={(v) => setForm((f) => ({ ...f, favicon_url: v || null }))} />
          <TextField label="Border radius" value={form.border_radius} onChange={(v) => setForm((f) => ({ ...f, border_radius: v }))} />
          <Button variant="gold" onClick={() => void save()} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save theme
          </Button>
        </Card>

        <div
          className="mt-6 rounded-2xl p-8 text-white"
          style={{ background: `linear-gradient(135deg, ${form.secondary_color}, ${form.accent_color})` }}
        >
          <p className="text-sm opacity-80">Preview</p>
          <h2 className="mt-2 text-2xl font-bold" style={{ color: form.primary_color }}>
            NextGrades
          </h2>
          <button
            type="button"
            className="mt-4 px-6 py-2 font-semibold text-[#0D1B2A]"
            style={{ backgroundColor: form.primary_color, borderRadius: form.border_radius }}
          >
            Sample button
          </button>
        </div>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1 flex gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 cursor-pointer rounded border" />
        <input className="flex-1 rounded-lg border px-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </label>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
