"use client";

import { useEffect, useState } from "react";
import { FileText, File, Image, AlertCircle, Loader2 } from "lucide-react";
import { NextGradesVideoPlayer } from "@/components/resources/NextGradesVideoPlayer";
import type { MediaKind } from "@/lib/resources/media-type";
import { cn } from "@/lib/utils";

type Props = {
  kind: MediaKind;
  url: string;
  title: string;
  fileName?: string | null;
  poster?: string | null;
  onView?: () => void;
  onDownload?: () => void;
};

function DocumentPreview({
  title,
  fileName,
  kind,
  onDownload,
}: {
  title: string;
  fileName?: string | null;
  kind: MediaKind;
  onDownload?: () => void;
}) {
  const Icon =
    kind === "document" && fileName?.match(/\.(xls|xlsx|csv)$/i)
      ? File
      : kind === "image"
        ? Image
        : FileText;

  return (
    <div className="flex aspect-[16/10] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 px-8 text-center shadow-sm">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0D1B2A]/5">
        <Icon className="h-10 w-10 text-[#D4AF37]" />
      </div>
      <h2 className="text-lg font-bold text-[#0D1B2A]">{title}</h2>
      {fileName && <p className="mt-2 text-sm text-gray-500">{fileName}</p>}
      <p className="mt-4 max-w-md text-sm text-gray-600">
        Diese Datei kann im Browser nicht direkt angezeigt werden. Lade sie herunter, um sie zu öffnen.
      </p>
      {onDownload && (
        <button
          type="button"
          onClick={onDownload}
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#D4AF37] px-5 text-sm font-semibold text-[#0D1B2A] transition hover:bg-[#e0bc4a]"
        >
          Datei herunterladen
        </button>
      )}
    </div>
  );
}

export function ResourceInlineViewer({
  kind,
  url,
  title,
  fileName,
  poster,
  onView,
  onDownload,
}: Props) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(kind === "text");
  const [textError, setTextError] = useState<string | null>(null);

  useEffect(() => {
    if (kind !== "text") return;
    let cancelled = false;
    setTextLoading(true);
    setTextError(null);

    void fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load text");
        return res.text();
      })
      .then((body) => {
        if (!cancelled) setTextContent(body);
      })
      .catch(() => {
        if (!cancelled) setTextError("Could not load this document.");
      })
      .finally(() => {
        if (!cancelled) setTextLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [kind, url]);

  useEffect(() => {
    if (kind === "pdf") onView?.();
  }, [kind, url, onView]);

  if (kind === "video") {
    return (
      <NextGradesVideoPlayer
        src={url}
        poster={poster}
        title={title}
        onPlay={onView}
        className="w-full"
      />
    );
  }

  if (kind === "pdf") {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
          <p className="text-xs text-gray-500">
            Wenn das PDF hier nicht erscheint, öffne es in einem neuen Tab.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
            >
              Im neuen Tab öffnen
            </a>
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex min-h-9 items-center rounded-lg bg-[#D4AF37] px-3 text-xs font-semibold text-[#0D1B2A] transition hover:bg-[#e0bc4a]"
              >
                Herunterladen
              </button>
            )}
          </div>
        </div>
        <object data={`${url}#toolbar=1&navpanes=0`} type="application/pdf" className="h-[min(80vh,900px)] w-full bg-white">
          <iframe
            src={`${url}#toolbar=1&navpanes=0`}
            title={title}
            className="h-[min(80vh,900px)] w-full bg-white"
            onLoad={onView}
          />
        </object>
      </div>
    );
  }

  if (kind === "image") {
    return (
      <div
        className={cn(
          "flex min-h-[min(70vh,720px)] items-center justify-center overflow-hidden rounded-2xl",
          "border border-gray-200 bg-[#0D1B2A]/5 shadow-sm"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={title}
          className="max-h-[min(70vh,720px)] w-full object-contain"
          onLoad={onView}
        />
      </div>
    );
  }

  if (kind === "text") {
    if (textLoading) {
      return (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
      );
    }
    if (textError) {
      return (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-700">
          <AlertCircle className="mb-2 h-8 w-8" />
          <p className="text-sm">{textError}</p>
        </div>
      );
    }
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <pre className="max-h-[min(80vh,900px)] overflow-auto whitespace-pre-wrap p-6 text-sm leading-relaxed text-gray-800">
          {textContent}
        </pre>
      </div>
    );
  }

  return (
    <DocumentPreview title={title} fileName={fileName} kind={kind} onDownload={onDownload} />
  );
}
