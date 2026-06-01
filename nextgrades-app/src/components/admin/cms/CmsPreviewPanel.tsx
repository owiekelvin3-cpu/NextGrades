"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getPreviewUrl } from "@/lib/cms/page-routes";
import {
  buildPreviewOverrides,
  CMS_PREVIEW_OVERRIDES,
  CMS_PREVIEW_READY,
} from "@/lib/cms/preview-overrides";
import type { MergedCmsField } from "@/lib/cms/merge-content";
import { cn } from "@/lib/utils";

type Device = "desktop" | "tablet" | "mobile";
type PreviewMode = "draft" | "published";

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

type Props = {
  pageId: string;
  previewTick: number;
  editLocale: "en" | "de";
  isDark: boolean;
  fields: MergedCmsField[];
  activePageFields: MergedCmsField[];
  onRefresh: () => void;
};

export function CmsPreviewPanel({
  pageId,
  previewTick,
  editLocale,
  isDark,
  fields,
  activePageFields,
  onRefresh,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [mode, setMode] = useState<PreviewMode>("draft");
  const [iframeReady, setIframeReady] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const baseUrl = getPreviewUrl(pageId, previewTick);

  const pushOverrides = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    if (mode === "published") {
      iframe.contentWindow.postMessage(
        { type: CMS_PREVIEW_OVERRIDES, overrides: {}, locale: editLocale },
        window.location.origin
      );
      return;
    }

    const overrides = buildPreviewOverrides(activePageFields);
    iframe.contentWindow.postMessage(
      { type: CMS_PREVIEW_OVERRIDES, overrides, locale: editLocale },
      window.location.origin
    );
  }, [activePageFields, editLocale, mode]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === CMS_PREVIEW_READY) {
        setIframeReady(true);
        pushOverrides();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [pushOverrides]);

  useEffect(() => {
    if (iframeReady) {
      pushOverrides();
    }
  }, [fields, iframeReady, mode, pushOverrides, editLocale, activePageFields]);

  useEffect(() => {
    setIframeReady(false);
    setIframeError(false);
  }, [baseUrl, mode]);

  useEffect(() => {
    if (mode === "published" && iframeRef.current) {
      iframeRef.current.src = baseUrl;
    }
  }, [mode, baseUrl]);

  const devices: { id: Device; icon: typeof Monitor; label: string }[] = [
    { id: "desktop", icon: Monitor, label: "Desktop" },
    { id: "tablet", icon: Tablet, label: "Tablet" },
    { id: "mobile", icon: Smartphone, label: "Mobile" },
  ];

  return (
    <div
      className={cn(
        "flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border",
        isDark ? "border-white/10 bg-[#0A1628]" : "border-gray-200 bg-gray-50"
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3",
          isDark ? "border-white/10 bg-[#112240]" : "border-gray-200 bg-white"
        )}
      >
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-[#D4AF37]" />
          <span className="text-sm font-semibold">Live preview</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <div className={cn("mr-2 flex rounded-lg border p-0.5", isDark ? "border-white/10" : "border-gray-200")}>
            {(["draft", "published"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-semibold capitalize",
                  mode === m ? "bg-[#D4AF37] text-[#0D1B2A]" : isDark ? "text-gray-400" : "text-gray-500"
                )}
              >
                {m}
              </button>
            ))}
          </div>
          {devices.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => setDevice(id)}
              className={cn(
                "rounded-lg p-1.5 transition-colors",
                device === id
                  ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                  : isDark
                    ? "text-gray-400 hover:bg-white/10"
                    : "text-gray-500 hover:bg-gray-100"
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          <Button variant="outline" size="sm" type="button" onClick={onRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <a href={baseUrl.split("?")[0]} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" type="button">
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-auto bg-[#E5E7EB] p-4 dark:bg-[#050a12]">
        <div
          className="h-full min-h-[480px] transition-all duration-300"
          style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }}
        >
          <div className="relative h-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xl">
            {!iframeReady && !iframeError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 text-sm text-gray-500">
                Loading preview…
              </div>
            )}
            {iframeError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/95 p-4 text-center text-sm text-gray-600">
                <p>Preview could not load this page in the frame.</p>
                <a href={baseUrl.split("?")[0]} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#D4AF37] hover:underline">
                  Open page in new tab
                </a>
              </div>
            )}
            <iframe
              ref={iframeRef}
              key={`${baseUrl}-${mode}`}
              title="Website preview"
              src={baseUrl}
              className="h-full w-full border-0"
              style={{ minHeight: device === "mobile" ? 680 : 520 }}
              onLoad={() => setIframeError(false)}
              onError={() => setIframeError(true)}
            />
          </div>
        </div>
      </div>
      <p className={cn("px-4 py-2 text-[11px]", isDark ? "text-gray-500" : "text-gray-500")}>
        {mode === "draft"
          ? "This preview updates as you type. Tap Put on live website at the bottom to save for everyone."
          : "Showing what visitors see on the live website right now."}
      </p>
    </div>
  );
}
