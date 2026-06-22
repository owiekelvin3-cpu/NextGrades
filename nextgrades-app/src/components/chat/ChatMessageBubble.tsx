"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, User, Copy, Check, RotateCcw, Languages, Loader2 } from "lucide-react";
import { MarkdownContent } from "./MarkdownContent";
import { cn } from "@/lib/utils";
import type { ChatResponseLanguage } from "@/lib/chat/languages";
import type { MessageTranslation } from "@/hooks/useChat";
import type { ChatAttachment } from "@/lib/chat/attachments";
import { ChatAttachmentList } from "./ChatAttachmentChip";

interface ChatMessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  translation?: MessageTranslation;
  attachments?: ChatAttachment[];
  responseLanguage: ChatResponseLanguage;
  onRegenerate?: () => void;
  onTranslate?: (targetLanguage: ChatResponseLanguage) => void;
}

export function ChatMessageBubble({
  role,
  content,
  streaming,
  translation,
  attachments,
  responseLanguage,
  onRegenerate,
  onTranslate,
}: ChatMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";
  const displayContent = translation?.text && !translation.loading ? translation.text : content;
  const showingTranslation = !!translation?.text && !translation.loading;
  const translateTarget: ChatResponseLanguage = responseLanguage === "de" ? "en" : "de";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "group w-full border-b border-transparent",
        isUser ? "bg-transparent" : "bg-surface-muted"
      )}
    >
      <div className="mx-auto flex max-w-3xl gap-4 px-4 py-6 md:px-6">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm",
            isUser
              ? "bg-[var(--brand-gold)] text-[var(--brand-navy)]"
              : "chat-bubble-user"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          {attachments && attachments.length > 0 && (
            <ChatAttachmentList files={attachments} className="mb-3" />
          )}

          {showingTranslation && (
            <p className="mb-2 text-[11px] font-medium text-text-muted">
              {translation?.language === "de" ? "Deutsch" : "English"} ·{" "}
              <button
                type="button"
                onClick={() => onTranslate?.(translateTarget)}
                className="theme-link underline"
              >
                {responseLanguage === "de" ? "Original anzeigen" : "Show original"}
              </button>
            </p>
          )}

          <div className="text-[15px] leading-7 text-foreground">
            {translation?.loading ? (
              <div className="flex items-center gap-2 text-text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {responseLanguage === "de" ? "Übersetze…" : "Translating…"}
                </span>
              </div>
            ) : isUser ? (
              <p className="whitespace-pre-wrap">{displayContent || (attachments?.length ? "" : "…")}</p>
            ) : content || streaming ? (
              <>
                {displayContent ? (
                  <MarkdownContent content={displayContent} />
                ) : streaming ? (
                  <TypingIndicator />
                ) : null}
                {streaming && displayContent && (
                  <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-text-muted" />
                )}
              </>
            ) : null}
          </div>

          {!streaming && content && (
            <div className="mt-3 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <ActionButton
                onClick={handleCopy}
                label={copied ? "Copied" : "Copy"}
                icon={copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              />
              {onTranslate && (
                <ActionButton
                  onClick={() => onTranslate(translateTarget)}
                  label={translateTarget === "de" ? "Auf Deutsch" : "To English"}
                  icon={<Languages className="h-4 w-4" />}
                />
              )}
              {!isUser && onRegenerate && (
                <ActionButton
                  onClick={onRegenerate}
                  label="Regenerate"
                  icon={<RotateCcw className="h-4 w-4" />}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  label,
  icon,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
    >
      {icon}
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function ChatScrollArea({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [children]);

  return (
    <div ref={ref} className="flex-1 overflow-y-auto overscroll-contain">
      {children}
    </div>
  );
}
