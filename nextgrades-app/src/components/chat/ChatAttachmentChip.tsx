"use client";

import { FileText, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatAttachment } from "@/lib/chat/attachments";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatAttachmentChip({
  file,
  onRemove,
  compact,
}: {
  file: ChatAttachment;
  onRemove?: () => void;
  compact?: boolean;
}) {
  const isImage = file.kind === "image";

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 rounded-xl border bg-white/80 dark:bg-[#2a2a2a]",
        compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
        "border-gray-200 dark:border-white/10"
      )}
    >
      {isImage && file.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={file.previewUrl}
          alt=""
          className={cn("rounded-md object-cover", compact ? "h-8 w-8" : "h-10 w-10")}
        />
      ) : (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-md bg-[#D4AF37]/15 text-[#D4AF37]",
            compact ? "h-8 w-8" : "h-10 w-10"
          )}
        >
          {isImage ? (
            <ImageIcon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
          ) : (
            <FileText className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
          )}
        </div>
      )}
      <div className="min-w-0 pr-5">
        <p className="truncate font-medium text-gray-800 dark:text-gray-100">{file.name}</p>
        {!compact && (
          <p className="text-[11px] text-gray-400">{formatSize(file.size)}</p>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Remove file"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function ChatAttachmentList({
  files,
  onRemove,
  className,
}: {
  files: ChatAttachment[];
  onRemove?: (id: string) => void;
  className?: string;
}) {
  if (!files.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {files.map((file) => (
        <ChatAttachmentChip
          key={file.id}
          file={file}
          onRemove={onRemove ? () => onRemove(file.id) : undefined}
          compact
        />
      ))}
    </div>
  );
}
