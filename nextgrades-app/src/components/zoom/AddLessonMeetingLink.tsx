"use client";

import { useState } from "react";
import { Link2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/context/ToastContext";
import { themeInputClass } from "@/lib/theme/form-fields";
import { formatLocalYmd } from "@/lib/zoom/datetime";
import { validateMeetingLink } from "@/lib/meetings/link";

type Props = {
  lessonId: string;
  onSaved: () => void;
};

export function AddLessonMeetingLink({ lessonId, onSaved }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const [open, setOpen] = useState(true);
  const [link, setLink] = useState("");
  const [date, setDate] = useState(formatLocalYmd());
  const [startTime, setStartTime] = useState("10:00");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const check = validateMeetingLink(link);
    if (!check.ok) {
      toast.error(
        t("zoom.meetingLinkRequired", {
          defaultValue: "Füge vor der Stunde einen gültigen Video-Link ein.",
        })
      );
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/live-classes/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingLink: link.trim(),
          date,
          startTime,
          timezone: "Europe/Vienna",
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Speichern fehlgeschlagen");
      toast.success(
        t("zoom.meetingLinkSaved", {
          defaultValue: "Video-Link gespeichert. SchülerInnen können jetzt beitreten.",
        })
      );
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("misc.errorGeneric", { defaultValue: "Etwas ist schiefgelaufen" }));
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
      >
        {t("zoom.addMeetingLink", { defaultValue: "Video-Link hinzufügen" })}
      </button>
    );
  }

  return (
    <div className="w-full space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:min-w-[280px]">
      <p className="text-xs font-semibold text-amber-900">
        {t("zoom.missingLinkBeforeMeeting", {
          defaultValue: "Vor der Stunde fehlt der Video-Link – ohne Link geht der Beitritt nicht.",
        })}
      </p>
      <input
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="https://zoom.us/j/…"
        className={themeInputClass}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          min={formatLocalYmd()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={themeInputClass}
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className={themeInputClass}
        />
      </div>
      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D1B2A] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
        {t("zoom.saveMeetingLink", { defaultValue: "Link speichern" })}
      </button>
    </div>
  );
}
