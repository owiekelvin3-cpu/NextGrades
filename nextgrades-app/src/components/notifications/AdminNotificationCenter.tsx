"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, History, Loader2, Send, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { themeInputClass } from "@/lib/theme/form-fields";

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

  const inputCls = cn(themeInputClass, "py-2.5");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <Card hoverable={false} className="p-6 lg:col-span-3">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-gold-muted)]">
              <Sparkles className="h-4 w-4 text-[var(--brand-gold)]" />
            </span>
            <h2 className="font-semibold text-foreground">
              {t("notifications.admin.compose", { defaultValue: "Compose announcement" })}
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
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
                        ? "bg-[var(--brand-navy)] text-white shadow-sm dark:bg-[var(--brand-gold)] dark:text-[var(--brand-navy)]"
                        : "border border-border-default bg-surface-subtle text-text-muted hover:border-[var(--border-strong)] hover:text-foreground"
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
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
                <Clock className="h-3.5 w-3.5" />
                {t("notifications.admin.schedule", { defaultValue: "Schedule (optional)" })}
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className={inputCls}
              />
            </div>

            <Button variant="gold" onClick={() => void handleSend()} disabled={sending} className="w-full gap-2 sm:w-auto">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {scheduledAt
                ? t("notifications.admin.scheduleBtn", { defaultValue: "Schedule" })
                : t("notifications.admin.sendNow", { defaultValue: "Send now" })}
            </Button>
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card hoverable={false} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Summary</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{history.length}</p>
            <p className="text-sm text-text-muted">Total announcements sent</p>
          </Card>
          <Card hoverable={false} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Audience</p>
            <p className="mt-2 text-lg font-semibold capitalize text-foreground">
              {audience === "all" ? "All users" : audience}
            </p>
            <p className="text-sm text-text-muted">Selected for next send</p>
          </Card>
        </div>
      </div>

      <Card hoverable={false} className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <History className="h-5 w-5 text-[var(--brand-gold)]" />
          <h2 className="font-semibold text-foreground">
            {t("notifications.admin.history", { defaultValue: "Delivery history" })}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-[var(--brand-gold)]" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border-default bg-surface-subtle py-12 text-center">
            <Users className="mb-3 h-8 w-8 text-text-muted" />
            <p className="text-sm text-text-muted">
              {t("notifications.admin.noHistory", { defaultValue: "No announcements yet." })}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {history.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-default bg-surface-subtle px-4 py-4 transition-colors hover:bg-[var(--table-row-hover)]"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{a.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-text-muted">{a.message}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {a.audience} · {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-text-muted">{a.delivered_count} delivered</span>
                  <Badge variant={a.delivery_status === "sent" ? "success" : "warning"}>{a.delivery_status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
