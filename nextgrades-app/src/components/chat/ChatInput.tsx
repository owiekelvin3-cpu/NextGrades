"use client";

import { useState, useRef, useEffect, KeyboardEvent, DragEvent, ChangeEvent } from "react";
import { ArrowUp, Square, Plus, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatResponseLanguage } from "@/lib/chat/languages";
import type { ChatAttachment } from "@/lib/chat/attachments";
import { CHAT_ACCEPTED_MIME, MAX_CHAT_ATTACHMENTS } from "@/lib/chat/attachments";
import { ChatAttachmentList } from "./ChatAttachmentChip";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  onUpload?: (file: File) => Promise<void>;
  onRemoveAttachment?: (id: string) => void;
  attachments?: ChatAttachment[];
  uploading?: boolean;
  streaming?: boolean;
  disabled?: boolean;
  responseLanguage?: ChatResponseLanguage;
}

export function ChatInput({
  onSend,
  onStop,
  onUpload,
  onRemoveAttachment,
  attachments = [],
  uploading,
  streaming,
  disabled,
  responseLanguage = "de",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isDe = responseLanguage === "de";
  const canSend = (value.trim() || attachments.length > 0) && !disabled && !streaming && !uploading;
  const atAttachmentLimit = attachments.length >= MAX_CHAT_ATTACHMENTS;

  const placeholder = isDe
    ? "Nachricht eingeben oder Datei anhängen…"
    : "Message NextGrades AI or attach a file…";

  const disclaimer = isDe
    ? "KI kann Fehler machen. Wichtige Informationen überprüfen."
    : "AI can make mistakes. Verify important information.";

  const uploadHint = isDe
    ? "PDF, Word, TXT, Bilder · max. 5 Dateien"
    : "PDF, Word, TXT, images · max 5 files";

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [value]);

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (!onUpload || disabled || atAttachmentLimit) return;
    const list = Array.from(files).slice(0, MAX_CHAT_ATTACHMENTS - attachments.length);
    for (const file of list) {
      await onUpload(file);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) void handleFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="shrink-0 bg-gradient-to-t from-[#F7F7F8] via-[#F7F7F8] to-transparent px-3 pb-3 pt-2 dark:from-[#171717] dark:via-[#171717] sm:px-4 sm:pb-4">
      <div className="mx-auto max-w-3xl">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "relative rounded-[22px] border bg-white shadow-sm transition-all dark:bg-[#2f2f2f]",
            dragOver
              ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/25"
              : "border-gray-200 focus-within:border-gray-300 focus-within:shadow-md dark:border-white/10 dark:focus-within:border-white/20"
          )}
        >
          {attachments.length > 0 && (
            <div className="border-b border-gray-100 px-3 py-2.5 dark:border-white/10">
              <ChatAttachmentList files={attachments} onRemove={onRemoveAttachment} />
            </div>
          )}

          <div className="flex items-end gap-1 px-2 py-2 sm:gap-2 sm:px-3 sm:py-2.5">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept={CHAT_ACCEPTED_MIME}
              multiple
              onChange={onFileChange}
            />
            <button
              type="button"
              disabled={disabled || uploading || atAttachmentLimit}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                "text-gray-500 hover:bg-gray-100 hover:text-[#D4AF37] dark:text-gray-400 dark:hover:bg-white/10",
                (disabled || uploading || atAttachmentLimit) && "cursor-not-allowed opacity-40"
              )}
              aria-label={isDe ? "Datei anhängen" : "Attach file"}
              title={isDe ? "Datei anhängen" : "Attach file"}
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Plus className="h-5 w-5" aria-hidden />
              )}
            </button>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={disabled}
              rows={1}
              placeholder={placeholder}
              className="max-h-[200px] min-h-[26px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 sm:min-h-[28px]"
            />

            {streaming ? (
              <button
                type="button"
                onClick={onStop}
                className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0D1B2A] text-white transition hover:opacity-90 dark:bg-white dark:text-[#0D1B2A]"
                aria-label={isDe ? "Stoppen" : "Stop"}
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canSend}
                className={cn(
                  "mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                  canSend
                    ? "bg-gradient-to-br from-[#D4AF37] to-[#F5A623] text-[#0D1B2A] shadow-md hover:opacity-95"
                    : "bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-gray-500"
                )}
                aria-label={isDe ? "Senden" : "Send"}
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-col items-center gap-0.5 sm:flex-row sm:justify-center sm:gap-3">
          <p className="flex items-center gap-1 text-[11px] text-gray-400">
            <Paperclip className="h-3 w-3" aria-hidden />
            {uploadHint}
          </p>
          <span className="hidden text-gray-300 sm:inline">·</span>
          <p className="text-[11px] text-gray-400">{disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
