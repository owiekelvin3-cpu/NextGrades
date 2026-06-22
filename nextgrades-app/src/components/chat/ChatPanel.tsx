"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Plus,
  Trash2,
  Pencil,
  Maximize2,
  Sparkles,
  AlertCircle,
  BookOpen,
  PanelLeftClose,
  PanelLeft,
  FileUp,
  Languages,
  Brain,
  ListChecks,
} from "lucide-react";
import { useChatContext } from "./ChatProvider";
import { ChatMessageBubble, ChatScrollArea } from "./ChatMessageBubble";
import { ChatInput } from "./ChatInput";
import { ChatLanguageSwitcher } from "./ChatLanguageSwitcher";
import { ChatModelSelector } from "./ChatModelSelector";
import { QUICK_PROMPTS } from "@/lib/chat/prompts";
import type { ChatRole } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
  fullPage?: boolean;
}

type MaterialOption = { id: string; title: string };

const CAPABILITY_ICONS = [FileUp, Brain, ListChecks, Languages];

export function ChatPanel({ open, onClose, fullPage }: ChatPanelProps) {
  const chat = useChatContext();
  const [sidebarOpen, setSidebarOpen] = useState(fullPage ?? false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [materials, setMaterials] = useState<MaterialOption[]>([]);

  const role = (chat.status?.role ?? "student") as ChatRole;
  const models = chat.status?.models ?? [];
  const prompts = QUICK_PROMPTS[role]?.[chat.responseLanguage] ?? QUICK_PROMPTS.student.de;
  const disabled = !chat.status?.enabled || !chat.status?.configured;
  const isDe = chat.responseLanguage === "de";

  const emptyCopy = isDe
    ? {
        title: "Wobei kann ich dir helfen?",
        subtitle: "Stelle Fragen, lade Dateien hoch, lass dir Inhalte erklären oder erstelle Lernmaterial.",
        capabilities: [
          { title: "Dateien hochladen", desc: "PDF, Word, TXT analysieren" },
          { title: "Themen erklären", desc: "Einfach & Schritt für Schritt" },
          { title: "Zusammenfassen", desc: "Lernnotizen & Reviews" },
          { title: "Übersetzen", desc: "DE ↔ EN mit einem Klick" },
        ],
      }
    : {
        title: "How can I help you today?",
        subtitle: "Ask questions, upload files, get explanations, or generate study materials.",
        capabilities: [
          { title: "Upload files", desc: "Analyze PDF, Word, TXT" },
          { title: "Explain topics", desc: "Simple step-by-step help" },
          { title: "Summarize", desc: "Notes & revision sheets" },
          { title: "Translate", desc: "DE ↔ EN in one click" },
        ],
      };

  useEffect(() => {
    if (open || fullPage) void chat.initChat();
  }, [open, fullPage, chat.initChat]);

  useEffect(() => {
    if (fullPage) setSidebarOpen(true);
  }, [fullPage]);

  useEffect(() => {
    if (role !== "teacher" && role !== "admin") return;
    fetch("/api/quiz/materials")
      .then((r) => (r.ok ? r.json() : { materials: [] }))
      .then((d) =>
        setMaterials(
          (d.materials ?? []).map((m: { id: string; title: string }) => ({
            id: m.id,
            title: m.title,
          }))
        )
      )
      .catch(() => {});
  }, [role]);

  const panelClass = fullPage
    ? "chat-panel flex h-full w-full overflow-hidden bg-[var(--chat-panel)]"
    : cn(
        "chat-panel fixed z-50 flex overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-[var(--border-default)]",
        "inset-x-0 bottom-0 top-0 sm:inset-auto sm:bottom-5 sm:right-5 sm:top-auto",
        "w-full sm:w-[min(100vw-2rem,480px)]",
        "h-[100dvh] sm:h-[min(780px,calc(100dvh-2.5rem))] sm:rounded-2xl",
        "bg-[var(--chat-panel)]"
      );

  if (!open && !fullPage) return null;

  const showSidebar = fullPage ? sidebarOpen : sidebarOpen;
  const sidebarOverlay = !fullPage && sidebarOpen;

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={() => chat.newChat()}
          className="theme-btn-secondary flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {isDe ? "Neuer Chat" : "New chat"}
        </button>
        {(fullPage || sidebarOpen) && (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl p-2.5 text-text-muted hover:bg-surface-subtle lg:hidden"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {chat.sessions.length === 0 ? (
          <p className="px-3 py-2 text-xs text-text-muted">{isDe ? "Noch keine Chats" : "No chats yet"}</p>
        ) : (
          chat.sessions.map((s) => (
            <div
              key={s.id}
              className={cn(
                "chat-item group mb-0.5 flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm",
                chat.activeSessionId === s.id && "chat-item--active shadow-sm"
              )}
            >
              {renamingId === s.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => {
                    void chat.renameSession(s.id, renameValue);
                    setRenamingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void chat.renameSession(s.id, renameValue);
                      setRenamingId(null);
                    }
                  }}
                  className="theme-input w-full rounded-lg px-2 py-1 text-xs"
                />
              ) : (
                <button
                  type="button"
                  className="flex-1 truncate text-left"
                  onClick={() => void chat.loadSession(s.id)}
                >
                  {s.title}
                </button>
              )}
              <button
                type="button"
                className="hidden rounded p-1 opacity-60 hover:opacity-100 group-hover:block"
                onClick={() => {
                  setRenamingId(s.id);
                  setRenameValue(s.title);
                }}
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                type="button"
                className="hidden rounded p-1 text-red-400 group-hover:block"
                onClick={() => void chat.deleteSession(s.id)}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {(open || fullPage) && (
        <motion.div
          initial={fullPage ? false : { opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={panelClass}
        >
          {sidebarOverlay && (
            <button
              type="button"
              className="absolute inset-0 z-[5] bg-black/40 sm:hidden"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {showSidebar && (
            <aside
              className={cn(
                "chat-sidebar flex shrink-0 flex-col border-r",
                fullPage ? "hidden w-64 md:flex" : "absolute inset-y-0 left-0 z-10 w-[min(85vw,280px)] shadow-xl",
                !fullPage && "sm:relative sm:shadow-none"
              )}
            >
              <div className="flex items-center gap-2 border-b border-border-default px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--brand-gold)] to-[var(--color-gold-light)] shadow-sm">
                  <Sparkles className="h-4 w-4 text-[var(--brand-navy)]" />
                </div>
                <span className="text-sm font-bold text-foreground">NextGrades AI</span>
              </div>
              {sidebarContent}
            </aside>
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="chat-header flex shrink-0 items-center justify-between gap-2 border-b px-2 py-2 backdrop-blur-sm sm:px-3">
              <div className="flex min-w-0 flex-1 items-center gap-1">
                {!sidebarOpen && (
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="rounded-xl p-2 text-text-muted hover:bg-surface-subtle"
                    aria-label="Open sidebar"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <ChatModelSelector
                    models={models}
                    value={chat.selectedModelId}
                    onChange={(id) => void chat.setSelectedModelId(id)}
                    disabled={disabled || chat.streaming}
                  />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <ChatLanguageSwitcher
                  value={chat.responseLanguage}
                  onChange={(language) => void chat.setResponseLanguage(language)}
                  disabled={disabled || chat.streaming}
                />
                <button
                  type="button"
                  onClick={() => chat.newChat()}
                  className="hidden rounded-xl p-2 text-text-muted hover:bg-surface-subtle sm:flex"
                  aria-label="New chat"
                >
                  <Plus className="h-4 w-4" />
                </button>
                {!fullPage && (
                  <>
                    <Link
                      href="/dashboard/chat"
                      className="rounded-xl p-2 text-text-muted hover:bg-surface-subtle"
                      aria-label="Full page"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl p-2 text-text-muted hover:bg-surface-subtle"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </header>

            {disabled && (
              <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {!chat.status?.configured
                  ? isDe
                    ? "Kein KI-Anbieter verfügbar. GROQ_API_KEY hinzufügen oder kostenloses Modell wählen."
                    : "No AI provider available. Add GROQ_API_KEY or select a free model."
                  : isDe
                    ? "Chatbot ist derzeit deaktiviert."
                    : "Chatbot is currently disabled by admin."}
              </div>
            )}

            {materials.length > 0 && (
              <div className="chat-toolbar flex items-center gap-2 border-b px-3 py-2 sm:px-4">
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-[var(--brand-gold)]" />
                <select
                  value={chat.materialId ?? ""}
                  onChange={(e) => chat.setMaterialId(e.target.value || undefined)}
                  className="min-w-0 flex-1 truncate rounded-lg border-0 bg-transparent px-1 py-1 text-xs text-foreground-secondary outline-none"
                >
                  <option value="">{isDe ? "Kein Material" : "No material context"}</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <ChatScrollArea>
              {chat.messages.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center px-4 py-10 text-center sm:min-h-[360px] sm:px-6 sm:py-12">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#F5A623]/10 shadow-sm sm:h-16 sm:w-16">
                    <Sparkles className="h-7 w-7 text-[#D4AF37] sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-foreground sm:text-2xl">
                    {emptyCopy.title}
                  </h3>
                  <p className="mb-8 max-w-md text-sm leading-relaxed text-gray-500 sm:text-base">
                    {emptyCopy.subtitle}
                  </p>

                  <div className="mb-8 grid w-full max-w-lg grid-cols-2 gap-2 sm:gap-3">
                    {emptyCopy.capabilities.map((cap, i) => {
                      const Icon = CAPABILITY_ICONS[i] ?? Sparkles;
                      return (
                        <div
                          key={cap.title}
                          className="rounded-xl border border-gray-200 bg-white p-3 text-left dark:border-white/10 dark:bg-[#222]"
                        >
                          <Icon className="mb-2 h-4 w-4 text-[#D4AF37]" aria-hidden />
                          <p className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                            {cap.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">{cap.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex w-full max-w-lg flex-wrap justify-center gap-2">
                    {prompts.slice(0, 4).map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={disabled}
                        onClick={() => void chat.sendMessage(prompt)}
                        className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-[#D4AF37]/40 hover:bg-[#FFF9E6] disabled:opacity-50 dark:border-white/10 dark:bg-[#2a2a2a] dark:text-gray-300 dark:hover:bg-[#333] sm:px-4 sm:text-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {chat.messages.map((msg) => (
                    <ChatMessageBubble
                      key={msg.id}
                      role={msg.role}
                      content={msg.content}
                      attachments={msg.attachments}
                      streaming={msg.streaming}
                      translation={msg.translation}
                      responseLanguage={chat.responseLanguage}
                      onRegenerate={msg.role === "assistant" ? chat.regenerate : undefined}
                      onTranslate={(lang) => void chat.translateMessage(msg.id, lang)}
                    />
                  ))}
                </>
              )}

              {chat.error && (
                <div className="mx-auto max-w-3xl px-3 py-3 sm:px-6">
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                    {chat.error}
                  </div>
                </div>
              )}
            </ChatScrollArea>

            <ChatInput
              onSend={(m) => void chat.sendMessage(m)}
              onStop={chat.stopGeneration}
              onUpload={chat.uploadFile}
              onRemoveAttachment={chat.removeAttachment}
              attachments={chat.pendingAttachments}
              uploading={chat.uploadingFile}
              streaming={chat.streaming}
              disabled={disabled || chat.loading}
              responseLanguage={chat.responseLanguage}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FloatingChatButton({ onClick, unread }: { onClick: () => void; unread?: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5A623] text-[#0D1B2A] shadow-lg shadow-[#D4AF37]/30 md:bottom-6 md:right-6"
      aria-label="Open AI chatbot"
    >
      <Bot className="h-6 w-6" strokeWidth={2} />
      {unread ? (
        <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-red-500 ring-2 ring-white" />
      ) : null}
    </motion.button>
  );
}

export function FloatingChatWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard/chat")) return null;

  return (
    <>
      {!open && <FloatingChatButton onClick={() => setOpen(true)} />}
      <ChatPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
