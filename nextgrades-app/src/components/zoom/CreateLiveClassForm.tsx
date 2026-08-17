"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Video,
  Loader2,
  Calendar,
  Clock,
  ChevronDown,
  Sparkles,
  Link2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { fetchSubjects } from "@/lib/dashboard/data";
import { type ZoomMeetingType } from "@/lib/zoom/config";
import { teacherPanel } from "@/components/dashboard/teacher/teacher-ui";
import { themeInputClass, themeSelectClass } from "@/lib/theme/form-fields";
import { cn } from "@/lib/utils";
import { detectMeetingProvider, validateMeetingLink } from "@/lib/meetings/link";
import { MeetingProviderIcon } from "@/components/meetings/MeetingProviderIcon";

const TIMEZONES = ["Europe/Berlin", "Europe/Vienna", "Europe/Zurich", "Europe/London", "UTC"];
const DURATION_PRESETS = [30, 45, 60, 90] as const;

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
  initialStudentId?: string;
};

export function CreateLiveClassForm({
  onCreated,
  zoomReady = false,
  connectHref = "/api/zoom/authorize?return=%2Fdashboard%2Fteacher%2Fschedule",
  initialStudentId = "",
}: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const defaults = defaultScheduleValues();
  const [students, setStudents] = useState<
    { id: string; name: string; remainingUnits?: number; totalUnits?: number }[]
  >([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [studentMenuOpen, setStudentMenuOpen] = useState(false);
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
    meetingType: "private_session" as ZoomMeetingType,
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
    let cancelled = false;
    void (async () => {
      setStudentsLoading(true);
      setStudentsError(null);
      try {
        const [studentsRes, subjectRows] = await Promise.all([
          fetch("/api/teacher/scheduling-students"),
          fetchSubjects(),
        ]);
        const studentsData = studentsRes.ok
          ? ((await studentsRes.json()) as { students?: { id: string; name: string }[] })
          : { students: [] };
        if (cancelled) return;
        if (!studentsRes.ok) {
          setStudentsError(
            t("zoom.studentsLoadError", { defaultValue: "Could not load students. Refresh and try again." })
          );
        }
        const list = studentsData.students ?? [];
        setStudents(list);
        setSubjects(subjectRows.map((s) => ({ id: s.id, name: s.name })));
        if (initialStudentId && list.some((s) => s.id === initialStudentId)) {
          setForm((f) => ({ ...f, studentId: initialStudentId }));
        }
      } catch {
        if (!cancelled) {
          setStudentsError(
            t("zoom.studentsLoadError", { defaultValue: "Could not load students. Refresh and try again." })
          );
        }
      } finally {
        if (!cancelled) setStudentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialStudentId, t]);

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
    if (!form.studentId) {
      toast.error(
        t("zoom.selectStudentRequired", {
          defaultValue: "Pick a student so the lesson appears in their portal.",
        })
      );
      return;
    }
    if (!form.subjectId) {
      toast.error(
        t("zoom.selectSubjectRequired", {
          defaultValue: "Pick a subject for this lesson.",
        })
      );
      return;
    }
    if (form.meetingLink.trim()) {
      const check = validateMeetingLink(form.meetingLink);
      if (!check.ok) {
        toast.error(check.error);
        return;
      }
    }

    const studentName = students.find((s) => s.id === form.studentId)?.name;
    const subjectName = subjects.find((s) => s.id === form.subjectId)?.name;
    const title =
      form.title.trim() ||
      [subjectName, studentName].filter(Boolean).join(" · ") ||
      t("zoom.lessonFallbackTitle", { defaultValue: "Tutoring lesson" });

    setLoading(true);
    try {
      const res = await fetch("/api/teacher/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...buildPayload(),
          title,
          meetingType: "private_session",
          studentId: form.studentId,
          meetingLink: form.meetingLink.trim() || undefined,
          passcode: form.passcode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule class");

      toast.success(
        t("zoom.lessonCreated", {
          defaultValue: "Lesson saved. The student can see it under My appointments.",
        })
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

  return (
    <div className={teacherPanel()}>
      <div className="border-b border-gray-100 bg-gradient-to-r from-[#0D1B2A] to-[#1a3354] px-5 py-5 text-white sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/20">
            <Sparkles className="h-5 w-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-base font-bold">
              {t("zoom.newLesson", { defaultValue: "New lesson" })}
            </h2>
            <p className="mt-1 text-sm text-gray-300">
              {t("zoom.newLessonDesc", {
                defaultValue: "Pick a student, date, and time. The lesson then appears in their appointments.",
              })}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => void handlePasteLinkSubmit(e)} className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              {t("zoom.student", { defaultValue: "Student" })}
            </label>
            <button
              type="button"
              disabled={studentsLoading || students.length === 0}
              onClick={() => setStudentMenuOpen((open) => !open)}
              className={cn(
                inputCls,
                "flex items-center justify-between text-left",
                !form.studentId && "text-gray-400"
              )}
            >
              <span className="truncate">
                {studentsLoading
                  ? t("zoom.loadingStudents", { defaultValue: "Loading students…" })
                  : (() => {
                      const selected = students.find((s) => s.id === form.studentId);
                      if (!selected) return t("zoom.selectStudent", { defaultValue: "Select student" });
                      const hasPackage = (selected.totalUnits ?? 0) > 0 || (selected.remainingUnits ?? 0) > 0;
                      return hasPackage
                        ? `${selected.name} · ${selected.remainingUnits ?? 0}/${selected.totalUnits ?? 0}`
                        : selected.name;
                    })()}
              </span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-gray-400", studentMenuOpen && "rotate-180")} />
            </button>
            {studentMenuOpen && students.length > 0 && (
              <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                {students.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-[#D4AF37]/15",
                        form.studentId === s.id && "bg-[#D4AF37]/20 font-semibold"
                      )}
                      onClick={() => {
                        setForm({ ...form, studentId: s.id });
                        setStudentMenuOpen(false);
                      }}
                    >
                      {s.name}
                      {(s.totalUnits ?? 0) > 0 || (s.remainingUnits ?? 0) > 0
                        ? ` · ${s.remainingUnits ?? 0}/${s.totalUnits ?? 0} Stunden`
                        : ""}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {studentsError && <p className="mt-1.5 text-xs text-red-600">{studentsError}</p>}
            {!studentsLoading && students.length === 0 && !studentsError && (
              <p className="mt-1.5 text-xs text-amber-700">
                {t("zoom.noStudentsYet", {
                  defaultValue: "No students found yet. Add a student account first.",
                })}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              {t("zoom.subject", { defaultValue: "Subject" })}
            </label>
            <select
              required
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

        <div>
          <label htmlFor="meeting-title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t("zoom.meetingTitle", { defaultValue: "Lesson title" })}
          </label>
          <input
            id="meeting-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t("zoom.titleOptionalPlaceholder", {
              defaultValue: "Optional — e.g. Algebra, quadratic equations",
            })}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="meeting-link" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t("zoom.meetingLinkOptional", { defaultValue: "Video link (optional)" })}
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
                  {t("zoom.meetingLinkOptionalHint", {
                    defaultValue: "Optional. Paste Zoom, Meet, or Teams if you already have a link.",
                  })}
                </p>
              )}
            </div>
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
          {t("zoom.saveLesson", { defaultValue: "Save lesson" })}
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
              defaultValue: "A video link is optional. The student still sees the lesson under My appointments.",
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
