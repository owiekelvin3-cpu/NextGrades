"use client";

import { useCmsEditor } from "@/context/CmsEditorContext";
import { Button } from "@/components/ui/Button";
import { CloudUpload, Eye, Loader2, Save } from "lucide-react";

type Props = {
  pageId: string | null;
};

export function CmsPublishBar({ pageId }: Props) {
  const { dirtyCount, pageDirtyCount, saveDraft, publish, publishing, bumpPreview } = useCmsEditor();
  const count = pageId ? pageDirtyCount(pageId) : dirtyCount;

  if (!count) return null;

  return (
    <div className="sticky bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-amber-800">
          {count} unsaved change{count === 1 ? "" : "s"} — not visible on the live site yet
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={publishing} onClick={() => void saveDraft(pageId ?? undefined)}>
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save draft
          </Button>
          <Button variant="outline" size="sm" disabled={publishing} onClick={bumpPreview}>
            <Eye className="mr-2 h-4 w-4" />
            Refresh preview
          </Button>
          <Button variant="gold" size="sm" disabled={publishing} onClick={() => void publish(pageId ?? undefined)}>
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="mr-2 h-4 w-4" />}
            Save all changes
          </Button>
        </div>
      </div>
    </div>
  );
}
