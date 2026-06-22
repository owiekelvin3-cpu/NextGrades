"use client";

import { useCallback, useState } from "react";
import type { MediaItem } from "@/lib/cms/spec-types";

export function useMediaUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<MediaItem> => {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File exceeds 10MB limit");
    }
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/cms/media", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      setProgress(100);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Upload failed");
      }
      const media = (data as { media?: MediaItem }).media ?? data;
      return media as MediaItem;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
      throw e;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, progress, uploading, error };
}
