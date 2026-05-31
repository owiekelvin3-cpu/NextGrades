"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Megaphone, Send, Clock, History, Users, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

type Announcement = {
  id: string;
  title: string;
  message: string;
  audience: string;
  delivery_status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  delivered_count: number;
  created_at: string;
};

const AUDIENCES = ["all", "students", "teachers", "admins"] as const;

export function AdminNotificationCenter() {
  const { t } = useTranslation();
  const toast = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]>("all");
  const [scheduledAt, setScheduledAt] = useState("");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        const json = (await res.json()) as { announcements: Announcement[] };
        setHistory(json.announcements ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
    void fetch("/api/admin/announcements", { method: "PATCH" });
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error(t("notifications.admin.required", { defaultValue: "Title and message are required." }));
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          audience,
          scheduledAt: scheduledAt || null,
        }),
      });
      const json = (await res.json()) as { error?: string; delivered?: number };
      if (!res.ok) {
        toast.error(json.error ?? "Failed to send");
        return;
      }
      toast.success(
        t("notifications.admin.sent", {
          count: json.delivered ?? 0,
          defaultValue: `Sent to ${json.delivered ?? 0} users.`,
        })
      );
      setTitle("");
      setMessage("");
      setScheduledAt("");
      void loadHistory();
    } finally {
      setSending(false);
    }
  };

  const inputCls = cn(
    "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/15",
    isDark ? "border-white/15 bg-[#0D1B2A] text-white" : "border-gray-200 bg-white"
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#0D1B2A] via-[#152a45] to-[#1a3354] p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#D4AF37]/10 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]/25">
            <Megaphone className="h-6 w-6 text-[#D4AF37]" />
          </div>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">
              {t("notifications.admin.title", { defaultValue: "Notification center" })}
            </h1>
            <p className="mt-1 text-sm text-gray-300">
              {t("notifications.admin.subtitle", {
                defaultValue: "Send announcements to students, teachers, or all users.",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Compose */}
        <div className={cn("lg:col-span-3 rounded-2xl border p-6 shadow-sm", isDark ? "border-white/10 bg-[#112240]" : "border-gray-200 bg-white")}>
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-semibold">{t("notifications.admin.compose", { defaultValue: "Compose announcement" })}</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                {t("notifications.admin.audience", { defaultValue: "Audience" })}
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {AUDIENCES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAudience(a)}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-xs font-semibold transition",
                      audience === a
                        ? "bg-[#0D1B2A] text-white shadow-sm dark:bg-[#D4AF37] dark:text-[#0D1B2A]"
                        : isDark
                          ? "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                          : "border border-gray-200 bg-gray-50 text-gray-600 hover:border-[#D4AF37]/30"
                    )}
                  >
                    {a === "all" ? "All users" : a.charAt(0).toUpperCase() + a.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("notifications.admin.titlePlaceholder", { defaultValue: "Announcement title" })}
              className={inputCls}
            />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder={t("notifications.admin.messagePlaceholder", { defaultValue: "Your message…" })}
              className={cn(inputCls, "resize-none")}
            />

            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                {t("notifications.admin.schedule", { defaultValue: "Schedule (optional)" })}
              </label>
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={inputCls} />
            </div>

            <Button variant="gold" onClick={() => void handleSend()} disabled={sending} className="w-full gap-2 sm:w-auto">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {scheduledAt
                ? t("notifications.admin.scheduleBtn", { defaultValue: "Schedule" })
                : t("notifications.admin.sendNow", { defaultValue: "Send now" })}
            </Button>
          </div>
        </div>

        {/* Quick stats sidebar */}
        <div className="space-y-4 lg:col-span-2">
          <div className={cn("rounded-2xl border p-5 shadow-sm", isDark ? "border-white/10 bg-[#112240]" : "border-gray-200 bg-white")}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Summary</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{history.length}</p>
            <p className="text-sm text-gray-500">Total announcements sent</p>
          </div>
          <div className={cn("rounded-2xl border p-5 shadow-sm", isDark ? "border-white/10 bg-[#112240]" : "border-gray-200 bg-white")}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Audience</p>
            <p className="mt-2 text-lg font-semibold capitalize text-foreground">{audience === "all" ? "All users" : audience}</p>
            <p className="text-sm text-gray-500">Selected for next send</p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className={cn("rounded-2xl border p-6 shadow-sm", isDark ? "border-white/10 bg-[#112240]" : "border-gray-200 bg-white")}>
        <div className="mb-5 flex items-center gap-2">
          <History className="h-5 w-5 text-gray-400" />
          <h2 className="font-semibold">{t("notifications.admin.history", { defaultValue: "Delivery history" })}</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 py-12 text-center dark:border-white/10">
            <Users className="mb-3 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">{t("notifications.admin.noHistory", { defaultValue: "No announcements yet." })}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {history.map((a) => (
              <li
                key={a.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-4 transition hover:border-[#D4AF37]/25",
                  isDark ? "border-white/10 bg-[#0D1B2A]/50" : "border-gray-100 bg-gray-50/50"
                )}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{a.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">{a.message}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {a.audience} · {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500">{a.delivered_count} delivered</span>
                  <Badge variant={a.delivery_status === "sent" ? "success" : "warning"}>{a.delivery_status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
