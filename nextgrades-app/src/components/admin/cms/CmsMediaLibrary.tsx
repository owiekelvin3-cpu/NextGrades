"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, Search, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

type MediaItem = {
  id: string;
  file_name: string;
  url: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;
  isDark: boolean;
};

export function CmsMediaLibrary({ open, onClose, onSelect, isDark }: Props) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/cms/media?${params}`);
      if (!res.ok) throw new Error("Failed to load media");
      setItems(await res.json());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/cms/media", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      toast.success("Image uploaded");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this asset?")) return;
    const res = await fetch("/api/cms/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Deleted");
    void load();
  };

  if (!open) return null;

  const textPrimary = "text-foreground";
  const textMuted = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border shadow-2xl sm:rounded-3xl",
          isDark ? "border-white/10 bg-[#0D1B2A]" : "border-gray-200 bg-white"
        )}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className={cn("text-lg font-bold", textPrimary)}>Media library</h2>
            <p className={cn("text-sm", textMuted)}>Upload, search, and reuse images across the site</p>
          </div>
          <button type="button" onClick={onClose} className={cn("rounded-xl p-2", textMuted)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search files…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void load()}
              className={cn(
                "w-full rounded-xl border py-2.5 pr-3 pl-10 text-sm focus:border-[#D4AF37] focus:outline-none",
                isDark ? "border-white/15 bg-[#112240] text-white" : "border-gray-200 bg-gray-50"
              )}
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
          <Button variant="gold" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0D1B2A] border-t-transparent" />
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Upload
              </>
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className={textMuted}>Loading…</p>
          ) : items.length === 0 ? (
            <div className={cn("flex flex-col items-center justify-center py-16", textMuted)}>
              <ImagePlus className="mb-3 h-12 w-12 opacity-40" />
              <p>No media yet. Upload your first image.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group overflow-hidden rounded-xl border transition-shadow hover:shadow-lg",
                    isDark ? "border-white/10 bg-[#112240]" : "border-gray-200 bg-gray-50"
                  )}
                >
                  <button
                    type="button"
                    className="relative aspect-square w-full overflow-hidden"
                    onClick={() => {
                      onSelect?.(item.url);
                      onClose();
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={item.file_name} className="h-full w-full object-cover" />
                  </button>
                  <div className="flex items-center justify-between gap-1 px-2 py-2">
                    <p className={cn("truncate text-[11px]", textMuted)} title={item.file_name}>
                      {item.file_name}
                    </p>
                    <button
                      type="button"
                      onClick={() => void remove(item.id)}
                      className="shrink-0 rounded p-1 text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
