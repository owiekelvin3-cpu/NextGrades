"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, Copy, Check, Download, ExternalLink, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { st } from "./student-ui";

type SubscribeData = {
  feedUrl: string;
  webcalUrl: string;
  googleCalendarUrl: string;
  lessonCount: number;
};

type StudentCalendarConnectModalProps = {
  open: boolean;
  onClose: () => void;
};

export function StudentCalendarConnectModal({ open, onClose }: StudentCalendarConnectModalProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<SubscribeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/calendar/subscribe");
      const json = (await res.json().catch(() => ({}))) as SubscribeData & { error?: string };
      if (!res.ok) {
        throw new Error(json.error || t("misc.errorGeneric", { defaultValue: "Something went wrong." }));
      }
      setData(json);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : t("misc.errorGeneric", { defaultValue: "Something went wrong." }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      return;
    }
    void load();
  }, [open, load]);

  const handleCopy = async () => {
    if (!data?.webcalUrl) return;
    try {
      await navigator.clipboard.writeText(data.webcalUrl);
      setCopied(true);
      toast.success(t("studentDashboard.calendarLinkCopied", { defaultValue: "Calendar link copied." }));
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("studentDashboard.calendarCopyFailed", { defaultValue: "Could not copy link." }));
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/student/calendar/subscribe", { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || t("misc.errorGeneric", { defaultValue: "Something went wrong." }));
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "nextgrades-lessons.ics";
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(t("studentDashboard.calendarDownloaded", { defaultValue: "Calendar file downloaded." }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("misc.errorGeneric", { defaultValue: "Something went wrong." }));
    } finally {
      setDownloading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={cn("w-full max-w-lg rounded-2xl p-6 shadow-xl", st.panel)} role="dialog" aria-modal="true">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", st.goldIconWrap)}>
              <Calendar className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className={cn("text-lg font-bold", st.textPrimary)}>
                {t("studentDashboard.connectCalendarTitle", { defaultValue: "Connect your calendar" })}
              </h2>
              <p className={cn("mt-1 text-sm", st.textMuted)}>
                {t("studentDashboard.connectCalendarDesc", {
                  defaultValue: "Sync your NextGrades lessons with Google Calendar, Apple Calendar, or Outlook.",
                })}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={cn("rounded-lg p-1.5", st.iconBtn)} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className={cn("flex items-center gap-2 py-8 text-sm", st.textMuted)}>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("misc.loading", { defaultValue: "Loading..." })}
          </div>
        ) : error ? (
          <div className="space-y-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button variant="outline" onClick={() => void load()} className="w-full">
              {t("misc.tryAgain", { defaultValue: "Try again" })}
            </Button>
          </div>
        ) : data ? (
          <div className="space-y-4">
            <p className={cn("text-sm", st.textMuted)}>
              {data.lessonCount > 0
                ? t("studentDashboard.calendarLessonCount", {
                    count: data.lessonCount,
                    defaultValue: "{{count}} lessons will stay in sync.",
                  })
                : t("studentDashboard.calendarNoLessons", {
                    defaultValue: "No lessons yet — your calendar will update automatically when lessons are scheduled.",
                  })}
            </p>

            <div>
              <label className={cn("mb-1.5 block text-xs font-medium uppercase tracking-wide", st.textSubtle)}>
                {t("studentDashboard.calendarSubscribeLink", { defaultValue: "Subscription link" })}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={data.webcalUrl}
                  className={cn("min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-xs", st.input)}
                  onFocus={(e) => e.target.select()}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => void handleCopy()} className="shrink-0 gap-1.5">
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  {copied
                    ? t("misc.copied", { defaultValue: "Copied" })
                    : t("misc.copy", { defaultValue: "Copy" })}
                </Button>
              </div>
              <p className={cn("mt-1.5 text-xs", st.textSubtle)}>
                {t("studentDashboard.calendarSubscribeHint", {
                  defaultValue: "Paste this link in your calendar app under “Add calendar” or “Subscribe”.",
                })}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="gold"
                className="flex-1 gap-2"
                onClick={() => window.open(data.googleCalendarUrl, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="h-4 w-4" />
                {t("studentDashboard.addGoogleCalendar", { defaultValue: "Add to Google Calendar" })}
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => void handleDownload()}
                disabled={downloading}
              >
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {t("studentDashboard.downloadIcs", { defaultValue: "Download .ics" })}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("misc.close", { defaultValue: "Close" })}
          </Button>
        </div>
      </div>
    </div>
  );
}
