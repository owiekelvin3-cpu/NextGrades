"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Video,
  Loader2,
  Calendar,
  Clock,
  User,
  Users,
  Radio,
  Presentation,
  ChevronDown,
  Sparkles,
  Link2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { fetchSubjects, getSessionUserId } from "@/lib/dashboard/data";
import { ZOOM_MEETING_TYPES, type ZoomMeetingType } from "@/lib/zoom/config";
import { teacherPanel } from "@/components/dashboard/teacher/teacher-ui";
import { themeInputClass, themeSelectClass } from "@/lib/theme/form-fields";
import { cn } from "@/lib/utils";
import { detectMeetingProvider, validateMeetingLink } from "@/lib/meetings/link";
import { MeetingProviderIcon } from "@/components/meetings/MeetingProviderIcon";

const TIMEZONES = ["Europe/Berlin", "Europe/Vienna", "Europe/Zurich", "Europe/London", "UTC"];
const DURATION_PRESETS = [30, 45, 60, 90] as const;

const MEETING_TYPE_META: Record<
  ZoomMeetingType,
  { icon: typeof Video; accent: string; descKey: string; descDefault: string }
> = {
  live_class: {
    icon: Video,
    accent: "border-[#2D8CFF] bg-blue-50 text-[#2D8CFF]",
    descKey: "zoom.typesDesc.live_class",
    descDefault: "Open session for enrolled students",
  },
  private_session: {
    icon: User,
    accent: "border-[#D4AF37] bg-[#FFF9E6] text-[#B8941F]",
    descKey: "zoom.typesDesc.private_session",
    descDefault: "1:1 with one student",
  },
  group_session: {
    icon: Users,
    accent: "border-violet-300 bg-violet-50 text-violet-600",
    descKey: "zoom.typesDesc.group_session",
    descDefault: "Small group lesson",
  },
  webinar: {
    icon: Presentation,
    accent: "border-emerald-300 bg-emerald-50 text-emerald-600",
    descKey: "zoom.typesDesc.webinar",
    descDefault: "Large audience presentation",
  },
};

function defaultScheduleValues() {
  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setMinutes(0, 0, 0);
  next.setHours(10);
  return {
    date: next.toISOString().slice(0, 10),
    startTime: "10:00",
  };
}

type Props = {
  onCreated?: () => void;
  zoomReady?: boolean;
  connectHref?: string;
};

export function CreateLiveClassForm({
  onCreated,
  zoomReady = false,
  connectHref = "/api/zoom/authorize?return=%2Fdashboard%2Fteacher%2Fschedule",
}: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const defaults = defaultScheduleValues();
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showAutoZoom, setShowAutoZoom] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: defaults.date,
    startTime: defaults.startTime,
    duration: "60",
    timezone: "Europe/Berlin",
    meetingType: "live_class" as ZoomMeetingType,
    studentId: "",
    subjectId: "",
    meetingLink: "",
    passcode: "",
  });

  const linkPreview = useMemo(() => {
    if (!form.meetingLink.trim()) return null;
    const check = validateMeetingLink(form.meetingLink);
    if (!check.ok) return { ok: false as const, error: check.error };
    return { ok: true as const, provider: check.provider };
  }, [form.meetingLink]);

  useEffect(() => {
    void (async () => {
      const uid = await getSessionUserId();
      if (!uid) return;
      const [studentsRes, subjectRows] = await Promise.all([
        fetch("/api/teacher/scheduling-students"),
        fetchSubjects(),
      ]);
      const studentsData = studentsRes.ok
        ? ((await studentsRes.json()) as { students?: { id: string; name: string }[] })
        : { students: [] };
      setStudents(studentsData.students ?? []);
      setSubjects(subjectRows.map((s) => ({ id: s.id, name: s.name })));
    })();
  }, []);

  const buildPayload = () => {
    const body: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      date: form.date,
      startTime: form.startTime,
      duration: Number(form.duration),
      timezone: form.timezone,
      meetingType: form.meetingType,
      subjectId: form.subjectId || undefined,
    };

    if (form.meetingType === "private_session") {
      body.studentId = form.studentId;
    } else if (form.studentId) {
      body.studentId = form.studentId;
    } else if (form.subjectId) {
      body.subjectId = form.subjectId;
    }

    return body;
  };

  const handlePasteLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId && !form.subjectId) {
      toast.error(
        t("zoom.selectStudentOrSubject", {
          defaultValue: "Select a student or a subject so the class appears in their portal.",
        })
      );
      return;
    }
    const check = validateMeetingLink(form.meetingLink);
    if (!check.ok) {
      toast.error(check.error);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/teacher/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...buildPayload(),
          meetingLink: form.meetingLink,
          passcode: form.passcode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule class");

      toast.success(
        t("zoom.classCreated", { defaultValue: "Live class scheduled and students notified!" })
      );
      const nextDefaults = defaultScheduleValues();
      setForm((f) => ({
        ...f,
        title: "",
        description: "",
        meetingLink: "",
        passcode: "",
        date: nextDefaults.date,
        startTime: nextDefaults.startTime,
      }));
      onCreated?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("misc.errorGeneric", { defaultValue: "Something went wrong" })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAutoZoomSubmit = async () => {
    if (!zoomReady) return;
    if (!form.studentId && !form.subjectId) {
      toast.error(
        t("zoom.selectStudentOrSubject", {
          defaultValue: "Select a student or a subject so the class appears in their portal.",
        })
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/zoom/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create class");
      toast.success(t("zoom.classCreated", { defaultValue: "Live class created and students notified!" }));
      onCreated?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("misc.errorGeneric", { defaultValue: "Something went wrong" })
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls = themeInputClass;
  const selectCls = (value: string) => themeSelectClass(value, "rounded-lg py-2.5");
  const selectedMeta = MEETING_TYPE_META[form.meetingType];

  return (
    <div className={teacherPanel()}>
      <div className="border-b border-gray-100 bg-gradient-to-r from-[#0D1B2A] to-[#1a3354] px-5 py-5 text-white sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/20">
            <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-base font-bold">
              {t("zoom.scheduleNew", { defaultValue: "Schedule a live class" })}
            </h2>
            <p className="mt-1 text-sm text-gray-300">
              {t("zoom.schedulePasteDesc", {
                defaultValue: "Create a meeting in Zoom, paste the join link, and students can join with one tap.",
              })}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => void handlePasteLinkSubmit(e)} className="space-y-6 p-5 sm:p-6">
        {/* Meeting link */}
        <div>
          <label htmlFor="meeting-link" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t("zoom.meetingLink", { defaultValue: "Meeting link" })}
          </label>
          <div className="flex gap-3">
            {linkPreview?.ok ? (
              <MeetingProviderIcon provider={linkPreview.provider} size="lg" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <Link2 className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <input
                id="meeting-link"
                required
                type="url"
                inputMode="url"
                value={form.meetingLink}
                onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                placeholder="https://zoom.us/j/123456789"
                className={inputCls}
              />
              {linkPreview && !linkPreview.ok ? (
                <p className="mt-1.5 text-xs text-red-600">{linkPreview.error}</p>
              ) : linkPreview?.ok ? (
                <p className="mt-1.5 text-xs text-emerald-600">
                  {t("zoom.linkDetected", {
                    defaultValue: "{{provider}} link detected",
                    provider: detectMeetingProvider(form.meetingLink) === "zoom" ? "Zoom" : "Video",
                  })}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">
                  {t("zoom.meetingLinkHint", {
                    defaultValue: "Paste the join link from Zoom, Google Meet, or Teams.",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Meeting type pills */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t("zoom.meetingType", { defaultValue: "Meeting type" })}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ZOOM_MEETING_TYPES.map((type) => {
              const meta = MEETING_TYPE_META[type];
              const Icon = meta.icon;
              const active = form.meetingType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, meetingType: type })}
                  className={cn(
                    "flex flex-col items-start rounded-xl border-2 px-3 py-3 text-left transition",
                    active ? meta.accent : "border-gray-100 bg-[#FAFBFC] text-gray-600 hover:border-gray-200"
                  )}
                >
                  <Icon className="mb-2 h-4 w-4" />
                  <span className="text-xs font-semibold leading-tight">
                    {t(`zoom.types.${type}`, { defaultValue: type.replace(/_/g, " ") })}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {t(selectedMeta.descKey, { defaultValue: selectedMeta.descDefault })}
          </p>
        </div>

        <div>
          <label htmlFor="meeting-title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t("zoom.meetingTitle", { defaultValue: "Meeting title" })}
          </label>
          <input
            id="meeting-title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t("zoom.titlePlaceholder", { defaultValue: "e.g. Algebra - Quadratic equations" })}
            className={inputCls}
          />
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t("zoom.when", { defaultValue: "When" })}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={cn(inputCls, "pl-10")}
              />
            </div>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className={cn(inputCls, "pl-10")}
              />
            </div>
          </div>
          <div className="mt-3">
            <p className="mb-2 text-xs text-gray-500">{t("zoom.duration", { defaultValue: "Duration (minutes)" })}</p>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setForm({ ...form, duration: String(mins) })}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold transition",
                    form.duration === String(mins)
                      ? "bg-[#0D1B2A] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {mins} {t("zoom.minShort", { defaultValue: "min" })}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              {t("zoom.subject", { defaultValue: "Subject" })}
            </label>
            <select
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className={selectCls(form.subjectId)}
            >
              <option value="">{t("zoom.selectSubject", { defaultValue: "Select subject" })}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              {form.meetingType === "private_session"
                ? t("zoom.student", { defaultValue: "Student" })
                : t("zoom.studentOptional", { defaultValue: "Student (optional)" })}
            </label>
            <select
              required={form.meetingType === "private_session"}
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className={selectCls(form.studentId)}
            >
              <option value="">{t("zoom.selectStudent", { defaultValue: "Select student" })}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {students.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-700">
                {t("zoom.noStudentsYet", {
                  defaultValue: "No students found yet. Add a student account first.",
                })}
              </p>
            )}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-[#FAFBFC] px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-200"
          >
            {t("zoom.moreOptions", { defaultValue: "More options" })}
            <ChevronDown className={cn("h-4 w-4 transition", showMore && "rotate-180")} />
          </button>
          {showMore && (
            <div className="mt-3 space-y-4 rounded-xl border border-gray-100 bg-[#FAFBFC] p-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  {t("zoom.passcodeOptional", { defaultValue: "Meeting passcode (optional)" })}
                </label>
                <input
                  value={form.passcode}
                  onChange={(e) => setForm({ ...form, passcode: e.target.value })}
                  placeholder={t("zoom.passcodePlaceholder", { defaultValue: "If your meeting has a password" })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  {t("zoom.description", { defaultValue: "Description" })}
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={t("zoom.descriptionPlaceholder", { defaultValue: "Optional notes for students…" })}
                  className={cn(inputCls, "resize-none")}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  {t("zoom.timezone", { defaultValue: "Time zone" })}
                </label>
                <select
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className={selectCls(form.timezone)}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <Button type="submit" variant="gold" disabled={loading} className="w-full gap-2 sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
          {t("zoom.scheduleAndNotify", { defaultValue: "Schedule & notify students" })}
        </Button>

        {zoomReady && (
          <div className="border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setShowAutoZoom(!showAutoZoom)}
              className="text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              {showAutoZoom
                ? t("zoom.hideAutoZoom", { defaultValue: "Hide auto-create option" })
                : t("zoom.showAutoZoom", { defaultValue: "Or auto-create via connected Zoom account" })}
            </button>
            {showAutoZoom && (
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="gap-2"
                  onClick={() => void handleAutoZoomSubmit()}
                >
                  <Video className="h-4 w-4" />
                  {t("zoom.createViaZoom", { defaultValue: "Auto-create in Zoom" })}
                </Button>
              </div>
            )}
          </div>
        )}

        {!zoomReady && (
          <p className="text-xs text-gray-500">
            {t("zoom.pastePreferred", {
              defaultValue: "Tip: create the meeting in the Zoom app, then paste the join link above.",
            })}{" "}
            <a href={connectHref} className="font-medium text-[#2D8CFF] hover:underline">
              {t("zoom.connectOptional", { defaultValue: "Connect Zoom (optional)" })}
            </a>
          </p>
        )}
      </form>
    </div>
  );
}
