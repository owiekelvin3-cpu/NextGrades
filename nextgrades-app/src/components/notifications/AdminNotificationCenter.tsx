"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Megaphone, Send, Clock, Users, Loader2 } from "lucide-react";
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

export function AdminNotificationCenter() {
  const { t } = useTranslation();
  const toast = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<"all" | "students" | "teachers" | "admins">("all");
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

  const panel = cn(
    "rounded-2xl border p-6",
    isDark ? "border-white/10 bg-[#112240]" : "border-gray-200 bg-white"
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-[#0D1B2A]")}>
          {t("notifications.admin.title", { defaultValue: "Notification center" })}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("notifications.admin.subtitle", {
            defaultValue: "Send announcements to students, teachers, or all users.",
          })}
        </p>
      </div>

      <div className={panel}>
        <div className="mb-4 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-[#D4AF37]" />
          <h2 className="font-semibold">{t("notifications.admin.compose", { defaultValue: "Compose announcement" })}</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {t("notifications.admin.audience", { defaultValue: "Audience" })}
            </label>
            <div className="flex flex-wrap gap-2">
              {(["all", "students", "teachers", "admins"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAudience(a)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                    audience === a
                      ? "bg-[#D4AF37] text-[#0D1B2A]"
                      : isDark
                        ? "bg-white/10 text-gray-300"
                        : "bg-gray-100 text-gray-600"
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
            className={cn(
              "w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",
              isDark ? "border-white/15 bg-[#0D1B2A] text-white" : "border-gray-200"
            )}
          />

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder={t("notifications.admin.messagePlaceholder", { defaultValue: "Your message…" })}
            className={cn(
              "w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]/50",
              isDark ? "border-white/15 bg-[#0D1B2A] text-white" : "border-gray-200"
            )}
          />

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              {t("notifications.admin.schedule", { defaultValue: "Schedule (optional)" })}
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className={cn(
                "rounded-xl border px-4 py-2.5 text-sm outline-none",
                isDark ? "border-white/15 bg-[#0D1B2A] text-white" : "border-gray-200"
              )}
            />
          </div>

          <Button variant="gold" onClick={() => void handleSend()} disabled={sending}>
            {sending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {scheduledAt
              ? t("notifications.admin.scheduleBtn", { defaultValue: "Schedule" })
              : t("notifications.admin.sendNow", { defaultValue: "Send now" })}
          </Button>
        </div>
      </div>

      <div className={panel}>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-400" />
          <h2 className="font-semibold">{t("notifications.admin.history", { defaultValue: "Delivery history" })}</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-500">{t("notifications.admin.noHistory", { defaultValue: "No announcements yet." })}</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-white/10">
            {history.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-gray-500">
                    {a.audience} · {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{a.delivered_count} delivered</span>
                  <Badge variant={a.delivery_status === "sent" ? "success" : "warning"}>
                    {a.delivery_status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
