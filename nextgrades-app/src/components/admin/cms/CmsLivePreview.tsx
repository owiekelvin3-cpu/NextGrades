"use client";

import { ExternalLink, Monitor, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getPreviewUrl } from "@/lib/cms/page-routes";
import { cn } from "@/lib/utils";

type Props = {
  pageId: string;
  previewTick: number;
  isDark: boolean;
  onRefresh: () => void;
};

export function CmsLivePreview({ pageId, previewTick, isDark, onRefresh }: Props) {
  const url = getPreviewUrl(pageId, previewTick);

  return (
    <div
      className={cn(
        "flex h-full min-h-[320px] flex-col rounded-2xl border overflow-hidden",
        isDark ? "border-white/10 bg-[#0A1628]" : "border-gray-200 bg-gray-50"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 border-b px-4 py-3",
          isDark ? "border-white/10 bg-[#112240]" : "border-gray-200 bg-white"
        )}
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Monitor className="h-4 w-4 text-[#D4AF37]" />
          Live preview
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" type="button" onClick={onRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <a href={url.split("?")[0]} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" type="button">
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </div>
      <div className="relative flex-1 bg-white">
        <iframe
          key={url}
          title="Website preview"
          src={url}
          className="absolute inset-0 h-full w-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
      <p className={cn("px-4 py-2 text-[11px]", isDark ? "text-gray-500" : "text-gray-500")}>
        Preview reloads after save. Use the site language switcher in the preview to check German copy.
      </p>
    </div>
  );
}
