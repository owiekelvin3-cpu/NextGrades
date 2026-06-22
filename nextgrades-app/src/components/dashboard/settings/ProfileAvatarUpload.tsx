"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileAvatarUploadProps {
  avatarUrl: string | null;
  name: string;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  disabled?: boolean;
  size?: "md" | "lg";
}

export function ProfileAvatarUpload({
  avatarUrl,
  name,
  onUpload,
  onRemove,
  disabled,
  size = "lg",
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const initials = name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  const dim = size === "lg" ? "h-28 w-28" : "h-20 w-20";

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative shrink-0">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border-2 border-[var(--brand-gold)]/30 bg-surface-subtle shadow-sm",
            dim
          )}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--brand-navy)] to-[var(--surface-elevated)]">
              {initials.length >= 1 ? (
                <span className="text-2xl font-bold text-[#D4AF37]">{initials}</span>
              ) : (
                <User className="h-10 w-10 text-text-muted" />
              )}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-surface-elevated bg-[#D4AF37] text-[#0D1B2A] shadow-md transition hover:bg-[#F5A623] disabled:opacity-50"
          aria-label="Upload photo"
        >
          <Camera className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
      <div className="text-center sm:text-left">
        <p className="text-sm font-semibold text-foreground">{name || "—"}</p>
        <p className="mt-1 text-xs text-text-muted">JPG, PNG or WebP · Max 5 MB</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-input-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-[var(--brand-gold)] disabled:opacity-50"
          >
            Upload photo
          </button>
          {avatarUrl && onRemove && (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => void onRemove()}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
