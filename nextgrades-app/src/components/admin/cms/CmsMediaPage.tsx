"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Search, Trash2, Upload, FileText, Film } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { cmsFetch } from "@/lib/cms/cms-fetch";
import { cn } from "@/lib/utils";

type MediaItem = {
  id: string;
  file_name: string;
  url: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
};

export function CmsMediaPage() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video" | "pdf">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (filter !== "all") params.set("type", filter);
      const res = await cmsFetch(`/api/cms/media?${params}`);
      if (!res.ok) throw new Error("Failed to load media");
      setItems(await res.json());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [query, filter, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await cmsFetch("/api/cms/media", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      toast.success("Uploaded");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this file permanently?")) return;
    const res = await cmsFetch("/api/cms/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Deleted");
    await load();
  };

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file) void upload(file);
    };
    const onDrag = (e: DragEvent) => e.preventDefault();
    el.addEventListener("drop", onDrop);
    el.addEventListener("dragover", onDrag);
    return () => {
      el.removeEventListener("drop", onDrop);
      el.removeEventListener("dragover", onDrag);
    };
  });

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-foreground">Media library</h1>
        <p className="mt-1 text-text-muted">Upload and manage images, videos, and documents for your website.</p>

        <div
          ref={dropRef}
          className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--brand-gold)]/40 bg-[var(--brand-gold-muted)] px-6 py-12"
        >
          <Upload className="h-10 w-10 text-[var(--brand-gold)]" />
          <p className="mt-2 font-medium text-foreground">Drag & drop files here</p>
          <p className="text-sm text-gray-500">JPG, PNG, WebP up to 5 MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
          <Button variant="gold" className="mt-4" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? "Uploading…" : "Choose file"}
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4"
              placeholder="Search files…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {(["all", "image", "video", "pdf"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium capitalize",
                filter === f ? "bg-[var(--brand-navy)] text-white" : "border border-border-default bg-surface-elevated text-text-muted"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-8 text-center text-gray-500">Loading…</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="relative aspect-video bg-gray-100">
                  {item.file_type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      {item.file_type === "video" ? <Film className="h-10 w-10" /> : <FileText className="h-10 w-10" />}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => void remove(item.id)}
                    className="absolute right-2 top-2 rounded-lg bg-red-500/90 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-foreground">{item.file_name}</p>
                  <p className="truncate text-xs text-gray-400">{item.url}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="mt-12 text-center text-gray-500">
            <ImagePlus className="mx-auto h-12 w-12 opacity-30" />
            <p className="mt-2">No media yet. Upload your first file.</p>
          </div>
        )}
      </div>
    </div>
  );
}
