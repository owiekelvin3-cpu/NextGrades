"use client";

import { useRef, useState } from "react";
import { ImageIcon, Upload, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { cmsFetch } from "@/lib/cms/cms-fetch";

type Props = {
  value: string;
  onChange: (url: string) => void;
  inputClass: string;
  isDark: boolean;
  label?: string;
};

export function ImageFieldEditor({ value, onChange, inputClass, isDark, label }: Props) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await cmsFetch("/api/cms/media", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Upload failed");
      }
      if (typeof data.url === "string" && data.url) {
        onChange(data.url);
        toast.success("Photo added - tap Put on live website below when you are done");
        return;
      }
      throw new Error("Upload succeeded but no image URL was returned");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div
          className={`relative overflow-hidden rounded-xl border ${isDark ? "border-white/15 bg-black/20" : "border-gray-200 bg-gray-50"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label ?? "Preview"} className="h-48 w-full object-cover" />
          {value.startsWith("http") && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 rounded-lg bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      ) : (
        <div
          className={`flex h-32 items-center justify-center rounded-xl border border-dashed ${isDark ? "border-white/20 text-gray-500" : "border-gray-300 text-gray-400"}`}
        >
          <ImageIcon className="h-8 w-8" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          type="url"
          className={`${inputClass} flex-1 min-w-[200px]`}
          placeholder="https://… image URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </div>
      <p className="text-xs text-gray-500">Paste a URL or upload JPG, PNG, or WebP (max 5 MB).</p>
    </div>
  );
}
