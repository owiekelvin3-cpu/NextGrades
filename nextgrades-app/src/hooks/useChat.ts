"use client";

import { useCallback, useRef, useState } from "react";
import {
  DEFAULT_CHAT_RESPONSE_LANGUAGE,
  parseChatResponseLanguage,
  type ChatResponseLanguage,
} from "@/lib/chat/languages";
import { publicChatErrorMessage } from "@/lib/chat/errors";
import { getStoredLanguage } from "@/lib/preferences";
import { DEFAULT_MODEL_ID } from "@/lib/chat/models";
import type { AiModelInfo, ChatMessage, ChatSession, ChatRole } from "@/lib/chat/types";
import type { ChatAttachment } from "@/lib/chat/attachments";
import { MAX_CHAT_ATTACHMENTS } from "@/lib/chat/attachments";

export type MessageTranslation = {
  text: string;
  language: ChatResponseLanguage;
  loading?: boolean;
};

export type LocalMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  translation?: MessageTranslation;
  attachments?: ChatAttachment[];
};

type ChatStatus = {
  enabled: boolean;
  configured: boolean;
  role: ChatRole;
  models?: AiModelInfo[];
  defaultModelId?: string;
};

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ChatStatus | null>(null);
  const [materialId, setMaterialId] = useState<string | undefined>();
  const [responseLanguage, setResponseLanguageState] = useState<ChatResponseLanguage>(
    DEFAULT_CHAT_RESPONSE_LANGUAGE
  );
  const [selectedModelId, setSelectedModelIdState] = useState(DEFAULT_MODEL_ID);
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const initRef = useRef(false);
  const [chatReady, setChatReady] = useState(false);

  const loadPreferences = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/preferences");
      if (!res.ok) return;
      const data = await res.json();
      const stored = parseChatResponseLanguage(data.preferences?.response_language);
      const siteLang = getStoredLanguage();
      setResponseLanguageState(siteLang === "de" ? "de" : stored);
      if (data.preferences?.preferred_model) {
        setSelectedModelIdState(data.preferences.preferred_model);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setResponseLanguage = useCallback(async (language: ChatResponseLanguage) => {
    setResponseLanguageState(language);
    try {
      await fetch("/api/chat/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response_language: language }),
      });
    } catch {
      /* keep local choice */
    }
  }, []);

  const setSelectedModelId = useCallback(async (modelId: string) => {
    setSelectedModelIdState(modelId);
    try {
      await fetch("/api/chat/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_model: modelId }),
      });
    } catch {
      /* keep local choice */
    }
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
      const availableIds = (data.models as AiModelInfo[] | undefined)?.map((m) => m.id) ?? [];
      if (availableIds.length && !availableIds.includes(selectedModelId)) {
        setSelectedModelIdState(availableIds[0]);
      }
    } catch {
      /* ignore */
    }
  }, [selectedModelId]);

  const loadSessions = useCallback(async () => {
    const res = await fetch("/api/chat/sessions");
    if (!res.ok) return;
    const data = await res.json();
    setSessions(data.sessions ?? []);
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`);
      if (!res.ok) throw new Error("Failed to load chat");
      const data = await res.json();
      setActiveSessionId(sessionId);
      setMessages(
        (data.messages as ChatMessage[])
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content }))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    setActiveSessionId(null);
    setMessages([]);
    setError(null);
    setStreaming(false);
    setPendingAttachments((prev) => {
      prev.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      });
      return [];
    });
  }, []);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      await fetch(`/api/chat/sessions/${sessionId}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) newChat();
    },
    [activeSessionId, newChat]
  );

  const renameSession = useCallback(async (sessionId: string, title: string) => {
    const res = await fetch(`/api/chat/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const data = await res.json();
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title: data.session.title } : s)));
    }
  }, []);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const translateMessage = useCallback(
    async (messageId: string, targetLanguage: ChatResponseLanguage) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg?.content || msg.streaming) return;

      if (msg.translation?.language === targetLanguage && msg.translation.text) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, translation: undefined } : m
          )
        );
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, translation: { text: "", language: targetLanguage, loading: true } }
            : m
        )
      );

      try {
        const res = await fetch("/api/chat/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: msg.content, targetLanguage }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error || "Translation failed");
        }
        const data = (await res.json()) as { translation: string; targetLanguage: ChatResponseLanguage };
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  translation: {
                    text: data.translation,
                    language: data.targetLanguage,
                    loading: false,
                  },
                }
              : m
          )
        );
      } catch (e) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, translation: undefined } : m))
        );
        setError(e instanceof Error ? e.message : "Translation failed");
      }
    },
    [messages]
  );

  const removeAttachment = useCallback((id: string) => {
    setPendingAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    if (pendingAttachments.length >= MAX_CHAT_ATTACHMENTS) {
      setError(`Maximum ${MAX_CHAT_ATTACHMENTS} files per message`);
      return;
    }

    setUploadingFile(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/chat/upload", { method: "POST", body: formData });
      const data = (await res.json()) as { attachment?: ChatAttachment; error?: string };
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const attachment = data.attachment!;
      if (attachment.kind === "image") {
        attachment.previewUrl = URL.createObjectURL(file);
      }
      setPendingAttachments((prev) => [...prev, attachment]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingFile(false);
    }
  }, [pendingAttachments.length]);

  const sendMessage = useCallback(
    async (text: string, opts?: { regenerate?: boolean; attachments?: ChatAttachment[] }) => {
      const attachments = opts?.attachments ?? (opts?.regenerate ? [] : pendingAttachments);
      const trimmed = text.trim();
      if ((!trimmed && !attachments.length) || streaming) return;

      setError(null);
      const userMsg: LocalMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        attachments: attachments.length ? attachments : undefined,
      };

      if (!opts?.regenerate) {
        setMessages((prev) => [...prev, userMsg]);
      }

      setPendingAttachments((prev) => {
        prev.forEach((a) => {
          if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
        });
        return [];
      });

      const assistantId = `assistant-${Date.now()}`;
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", streaming: true }]);
      setStreaming(true);

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSessionId ?? undefined,
            message: trimmed,
            attachments: attachments.map(({ id, name, mimeType, size, content, kind }) => ({
              id,
              name,
              mimeType,
              size,
              content,
              kind,
            })),
            materialId,
            regenerate: opts?.regenerate,
            responseLanguage,
            modelId: selectedModelId,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Request failed (${res.status})`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";
        let sessionId = activeSessionId;
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = JSON.parse(line.slice(6)) as {
              type: string;
              sessionId?: string;
              content?: string;
              error?: string;
            };

            if (payload.type === "meta" && payload.sessionId) {
              sessionId = payload.sessionId;
              setActiveSessionId(payload.sessionId);
            }
            if (payload.type === "token" && payload.content) {
              fullContent += payload.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: fullContent, streaming: true } : m
                )
              );
            }
            if (payload.type === "error") {
              throw new Error(payload.error || "Generation failed");
            }
            if (payload.type === "done") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: fullContent, streaming: false } : m
                )
              );
            }
          }
        }

        if (sessionId) void loadSessions();
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.streaming ? { ...m, streaming: false, content: m.content || "…" } : m
            )
          );
        } else {
          setError(
            publicChatErrorMessage(e instanceof Error ? e.message : "Failed to send", responseLanguage)
          );
          setMessages((prev) => prev.filter((m) => !m.streaming || m.content));
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [activeSessionId, materialId, pendingAttachments, responseLanguage, selectedModelId, streaming, loadSessions]
  );

  const regenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMessages((prev) => {
      const lastAssistantIdx = prev.map((m) => m.role).lastIndexOf("assistant");
      if (lastAssistantIdx === -1) return prev;
      return prev.slice(0, lastAssistantIdx);
    });
    void sendMessage(lastUser.content, { regenerate: true });
  }, [messages, sendMessage]);

  const initChat = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;
    setChatReady(true);
    await Promise.all([loadStatus(), loadPreferences(), loadSessions()]);
  }, [loadStatus, loadPreferences, loadSessions]);

  // Full chat page initializes immediately via initChat() in ChatPanel

  return {
    chatReady,
    initChat,
    sessions,
    activeSessionId,
    messages,
    loading,
    streaming,
    error,
    status,
    materialId,
    responseLanguage,
    selectedModelId,
    pendingAttachments,
    uploadingFile,
    uploadFile,
    removeAttachment,
    setMaterialId,
    setResponseLanguage,
    setSelectedModelId,
    loadSession,
    newChat,
    deleteSession,
    renameSession,
    sendMessage,
    stopGeneration,
    regenerate,
    translateMessage,
    loadSessions,
  };
}
