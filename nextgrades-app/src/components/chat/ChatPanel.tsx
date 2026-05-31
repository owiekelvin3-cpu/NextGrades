"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
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
  const emptyCopy =
    chat.responseLanguage === "de"
      ? {
          title: "Wobei kann ich dir heute helfen?",
          subtitle: "Stelle Fragen, lass dir Inhalte erklären oder erstelle Lernmaterial.",
        }
      : {
          title: "How can I help you today?",
          subtitle: "Ask questions, get explanations, or generate study materials.",
        };

  useEffect(() => {
    if (open || fullPage) void chat.initChat();
  }, [open, fullPage, chat.initChat]);

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
    ? "flex h-full w-full overflow-hidden bg-[#F7F7F8] dark:bg-[#212121]"
    : cn(
        "fixed z-50 flex overflow-hidden shadow-2xl",
        "bottom-0 right-0 w-full sm:bottom-6 sm:right-6 sm:w-[440px]",
        "h-[100dvh] sm:h-[min(720px,calc(100dvh-3rem))] sm:rounded-2xl sm:border sm:border-gray-200 dark:sm:border-white/10",
        "bg-[#F7F7F8] dark:bg-[#212121]"
      );

  if (!open && !fullPage) return null;

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-3">
        <button
          type="button"
          onClick={() => chat.newChat()}
          className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/5"
        >
          <Plus className="h-4 w-4" />
          {chat.responseLanguage === "de" ? "Neuer Chat" : "New chat"}
        </button>
        {fullPage && (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-2 rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 md:hidden"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {chat.sessions.length === 0 ? (
          <p className="px-3 py-2 text-xs text-gray-400">
            {chat.responseLanguage === "de" ? "Noch keine Chats" : "No chats yet"}
          </p>
        ) : (
          chat.sessions.map((s) => (
            <div
              key={s.id}
              className={cn(
                "group mb-0.5 flex items-center gap-1 rounded-lg px-3 py-2.5 text-sm",
                chat.activeSessionId === s.id
                  ? "bg-gray-200/80 text-gray-900 dark:bg-white/10 dark:text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
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
                  className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-[#2f2f2f]"
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
          initial={fullPage ? false : { opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className={panelClass}
        >
          {/* Sidebar */}
          {(fullPage || sidebarOpen) && (
            <aside
              className={cn(
                "flex shrink-0 flex-col border-r border-gray-200 bg-[#F7F7F8] dark:border-white/10 dark:bg-[#171717]",
                fullPage ? "w-64" : "absolute inset-y-0 left-0 z-10 w-64 shadow-xl sm:relative sm:shadow-none"
              )}
            >
              <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-white/10">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#D4AF37]/20">
                  <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  NextGrades AI
                </span>
              </div>
              {sidebarContent}
            </aside>
          )}

          {/* Main */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-[#F7F7F8] px-3 py-2 dark:border-white/10 dark:bg-[#212121]">
              <div className="flex items-center gap-1">
                {!sidebarOpen && (
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
                    aria-label="Open sidebar"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </button>
                )}
                <ChatModelSelector
                  models={models}
                  value={chat.selectedModelId}
                  onChange={(id) => void chat.setSelectedModelId(id)}
                  disabled={disabled || chat.streaming}
                />
              </div>

              <div className="flex items-center gap-1">
                <ChatLanguageSwitcher
                  value={chat.responseLanguage}
                  onChange={(language) => void chat.setResponseLanguage(language)}
                  disabled={disabled || chat.streaming}
                />
                <button
                  type="button"
                  onClick={() => chat.newChat()}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
                  aria-label="New chat"
                >
                  <Plus className="h-4 w-4" />
                </button>
                {!fullPage && (
                  <Link
                    href="/dashboard/chat"
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
                    aria-label="Full page"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Link>
                )}
                {!fullPage && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </header>

            {disabled && (
              <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {!chat.status?.configured
                  ? chat.responseLanguage === "de"
                    ? "Kein KI-Anbieter verfügbar. GROQ_API_KEY hinzufügen oder kostenloses Modell wählen."
                    : "No AI provider available. Add GROQ_API_KEY or select a free model."
                  : chat.responseLanguage === "de"
                    ? "Chatbot ist derzeit deaktiviert."
                    : "Chatbot is currently disabled by admin."}
              </div>
            )}

            {materials.length > 0 && (
              <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2 dark:border-white/10 dark:bg-[#2f2f2f]">
                <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                <select
                  value={chat.materialId ?? ""}
                  onChange={(e) => chat.setMaterialId(e.target.value || undefined)}
                  className="flex-1 rounded-lg border-0 bg-transparent px-1 py-1 text-xs text-gray-600 outline-none dark:text-gray-300"
                >
                  <option value="">
                    {chat.responseLanguage === "de" ? "Kein Material" : "No material context"}
                  </option>
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
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-[#2f2f2f]">
                    <Sparkles className="h-8 w-8 text-[#D4AF37]" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {emptyCopy.title}
                  </h3>
                  <p className="mb-8 max-w-md text-sm text-gray-500">{emptyCopy.subtitle}</p>
                  <div className="flex max-w-lg flex-wrap justify-center gap-2">
                    {prompts.slice(0, 4).map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={disabled}
                        onClick={() => void chat.sendMessage(prompt)}
                        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-[#2f2f2f] dark:text-gray-300 dark:hover:bg-[#3f3f3f]"
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
                <div className="mx-auto max-w-3xl px-4 py-3 md:px-6">
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                    {chat.error}
                  </div>
                </div>
              )}
            </ChatScrollArea>

            <ChatInput
              onSend={(m) => void chat.sendMessage(m)}
              onStop={chat.stopGeneration}
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
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F5A623] text-[#0D1B2A] shadow-lg shadow-[#D4AF37]/30 md:bottom-6 md:right-6"
      aria-label="Open AI chat"
    >
      <MessageSquare className="h-6 w-6" />
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
