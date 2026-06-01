"use client";

import { useCallback, useEffect, useState } from "react";
import { cmsFetch } from "@/lib/cms/cms-fetch";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChevronDown, ChevronUp, Plus, Save, Trash2 } from "lucide-react";

type NavItem = {
  id?: string;
  location: "header" | "footer";
  label_en: string;
  label_de: string;
  href: string;
  sort_order: number;
  is_visible: boolean;
};

const defaultItem = (location: "header" | "footer", order: number): NavItem => ({
  location,
  label_en: "New link",
  label_de: "Neuer Link",
  href: "/",
  sort_order: order,
  is_visible: true,
});

export function CmsNavigationPage() {
  const toast = useToast();
  const [header, setHeader] = useState<NavItem[]>([]);
  const [footer, setFooter] = useState<NavItem[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [hRes, fRes] = await Promise.all([
      cmsFetch("/api/cms/navigation?location=header"),
      cmsFetch("/api/cms/navigation?location=footer"),
    ]);
    if (hRes.ok) setHeader(await hRes.json());
    if (fRes.ok) setFooter(await fRes.json());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveAll = async () => {
    setSaving(true);
    try {
      const items = [...header, ...footer].filter((i) => i.id);
      const res = await cmsFetch("/api/cms/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }
      toast.success("Navigation saved");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addItem = async (location: "header" | "footer") => {
    const list = location === "header" ? header : footer;
    const item = defaultItem(location, list.length);
    const res = await cmsFetch("/api/cms/navigation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      toast.error("Could not add link");
      return;
    }
    await load();
  };

  const deleteItem = async (id: string) => {
    const res = await cmsFetch("/api/cms/navigation", {
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

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1B2A]">Navigation</h1>
            <p className="mt-1 text-gray-600">Header and footer menu links.</p>
          </div>
          <Button variant="gold" onClick={() => void saveAll()} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save all
          </Button>
        </div>

        <NavSection
          title="Header menu"
          items={header}
          onChange={setHeader}
          onAdd={() => void addItem("header")}
          onDelete={(id) => void deleteItem(id)}
        />
        <NavSection
          title="Footer menu"
          items={footer}
          onChange={setFooter}
          onAdd={() => void addItem("footer")}
          onDelete={(id) => void deleteItem(id)}
        />
      </div>
    </div>
  );
}

function NavSection({
  title,
  items,
  onChange,
  onAdd,
  onDelete,
}: {
  title: string;
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    onChange(next.map((item, i) => ({ ...item, sort_order: i })));
  };

  const update = (index: number, patch: Partial<NavItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <Card className="mt-8 space-y-3 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#0D1B2A]">{title}</h2>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" />
          Add link
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={item.id ?? i} className="flex flex-wrap gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <input
            className="min-w-[120px] flex-1 rounded-lg border px-3 py-2 text-sm"
            placeholder="Label (EN)"
            value={item.label_en}
            onChange={(e) => update(i, { label_en: e.target.value })}
          />
          <input
            className="min-w-[120px] flex-1 rounded-lg border px-3 py-2 text-sm"
            placeholder="Label (DE)"
            value={item.label_de}
            onChange={(e) => update(i, { label_de: e.target.value })}
          />
          <input
            className="min-w-[140px] flex-[2] rounded-lg border px-3 py-2 text-sm"
            placeholder="/path"
            value={item.href}
            onChange={(e) => update(i, { href: e.target.value })}
          />
          <div className="flex gap-1">
            <button type="button" className="rounded-lg border p-2" onClick={() => move(i, -1)}>
              <ChevronUp className="h-4 w-4" />
            </button>
            <button type="button" className="rounded-lg border p-2" onClick={() => move(i, 1)}>
              <ChevronDown className="h-4 w-4" />
            </button>
            {item.id && (
              <button type="button" className="rounded-lg border p-2 text-red-500" onClick={() => onDelete(item.id!)}>
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </Card>
  );
}
