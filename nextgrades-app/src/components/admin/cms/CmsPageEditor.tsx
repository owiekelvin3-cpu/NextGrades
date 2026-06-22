"use client";

import { useState } from "react";
import { CmsClassicEditor } from "@/components/admin/cms/CmsClassicEditor";
import { CmsVisualEditor } from "@/components/admin/cms/CmsVisualEditor";
import { cn } from "@/lib/utils";
import { Layout, MousePointer2 } from "lucide-react";

type EditorMode = "classic" | "visual";

type Props = {
  pageId: string;
};

export function CmsPageEditor({ pageId }: Props) {
  const [mode, setMode] = useState<EditorMode>("classic");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-4 py-2">
        <ModeTab active={mode === "classic"} onClick={() => setMode("classic")} icon={Layout} label="Form editor" />
        <ModeTab
          active={mode === "visual"}
          onClick={() => setMode("visual")}
          icon={MousePointer2}
          label="Visual preview"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {mode === "classic" ? <CmsClassicEditor pageId={pageId} /> : <CmsVisualEditor pageId={pageId} />}
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-[#D4AF37]/15 text-[#0D1B2A]" : "text-gray-500 hover:bg-gray-50"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
