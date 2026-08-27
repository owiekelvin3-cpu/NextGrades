"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  Video,
  Trash2,
  Clock,
  CalendarDays,
  Users,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import { CreateLiveClassForm } from "@/components/zoom/CreateLiveClassForm";
import { useZoomStatus } from "@/components/zoom/ZoomSetupStrip";
import { teacherPanel, teacherStatCard } from "./teacher-ui";
import { formatTimeRange, lessonDateParts } from "@/components/dashboard/student/student-ui";
import { ZoomMeetingButton } from "@/components/zoom/ZoomMeetingButton";
import { AddLessonMeetingLink } from "@/components/zoom/AddLessonMeetingLink";
import { MeetingProviderBadge } from "@/components/meetings/MeetingProviderIcon";
import { lessonHasMeetingLink } from "@/lib/meetings/link";
import { cn } from "@/lib/utils";
import { themeSelectClass } from "@/lib/theme/form-fields";

const SCHEDULE_PATH = "/dashboard/teacher/schedule";
const CONNECT_HREF = `/api/zoom/authorize?return=${encodeURIComponent(SCHEDULE_PATH)}`;

type LessonRow = {
  id: string;
  start_time: string;
  duration: number;
  zoom_link: string | null;
  zoom_meeting_id: string | null;
  meeting_url: string | null;
  meeting_provider: string | null;
  meeting_title: string | null;
  meeting_type: string | null;
  status: string;
  cancel_reason?: string | null;
  student_id: string;
  student_name?: string | null;
};

type AttendanceChoice = "attended" | "excused" | "no_show";

function lessonStatusLabel(
  lesson: LessonRow,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  if (lesson.status === "scheduled") {
    return t("teacherDashboard.lessonStatusUpcoming", { defaultValue: "Bevorstehend" });
  }
  if (lesson.status === "completed") {
    return t("teacherDashboard.lessonStatusCompleted", { defaultValue: "Abgeschlossen" });
  }
  if (lesson.status === "no_show") {
    return t("teacherDashboard.lessonStatusNoShow", { defaultValue: "SchülerIn nicht erschienen" });
  }
  if (lesson.status === "cancelled") {
    const reason = (lesson.cancel_reason ?? "").toLowerCase();
    if (reason.includes("teacher")) {
      return t("teacherDashboard.lessonStatusTeacherCancelled", { defaultValue: "Lehrkraft abgesagt" });
    }
    return t("teacherDashboard.lessonStatusCancelled", { defaultValue: "Abgesagt" });
  }
  return lesson.status;
}

function lessonStatusVariant(status: string): "success" | "warning" | "default" {
  if (status === "completed") return "success";
  if (status === "scheduled") return "warning";
  return "default";
}

function CompleteLessonControls({
  lessonId,
  onCompleted,
}: {
  lessonId: string;
  onCompleted: () => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [attendance, setAttendance] = useState<AttendanceChoice>("attended");
  const [submitting, setSubmitting] = useState(false);

  const handleComplete = async () => {
    const confirmMsg = t("teacherDashboard.confirmCompleteLesson", {
      defaultValue: "Stunde als abgeschlossen markieren?",
    });
    if (!confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/teacher/lessons/${lessonId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendance }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(
        t("teacherDashboard.lessonCompleted", { defaultValue: "Stunde abgeschlossen." })
      );
      onCompleted();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t("misc.errorGeneric", { defaultValue: "Something went wrong" })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto">
      <select
        value={attendance}
        onChange={(e) => setAttendance(e.target.value as AttendanceChoice)}
        className={themeSelectClass(attendance, "rounded-lg py-2 text-xs")}
        aria-label={t("teacherDashboard.attendanceLabel", { defaultValue: "Anwesenheit" })}
      >
        <option value="attended">
          {t("teacherDashboard.attendanceAttended", { defaultValue: "Anwesend" })}
        </option>
        <option value="excused">
          {t("teacherDashboard.attendanceExcused", { defaultValue: "Entschuldigt" })}
        </option>
        <option value="no_show">
          {t("teacherDashboard.attendanceNoShow", { defaultValue: "Nicht erschienen" })}
        </option>
      </select>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={submitting}
        className="gap-2"
        onClick={() => void handleComplete()}
      >
        {submitting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" />
        )}
        {t("teacherDashboard.completeLesson", { defaultValue: "Stunde abschließen" })}
      </Button>
    </div>
  );
}

function ScheduleContent() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const toast = useToast();
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get("student") || "";
  const todayLabel = t("dashboardCommon.today", { defaultValue: "Today" });
  const { ready: zoomReady } = useZoomStatus(SCHEDULE_PATH);
  const [meetings, setMeetings] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarView, setCalendarView] = useState<"list" | "day" | "week" | "month">("list");
  const [filterStudent, setFilterStudent] = useState("");
  const [filterType, setFilterType] = useState<"all" | "1:1" | "group">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "scheduled" | "completed" | "cancelled" | "no_show">("all");
  const [anchorDate, setAnchorDate] = useState(() => new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/zoom/meetings");
      const data = await res.json();
      if (!res.ok) {
        setMeetings([]);
        return;
      }
      setMeetings(Array.isArray(data.meetings) ? (data.meetings as LessonRow[]) : []);
    } catch {
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("zoom.confirmDelete", { defaultValue: "Cancel this meeting?" }))) return;
    const res = await fetch(`/api/zoom/meetings/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error(t("zoom.deleteFailed", { defaultValue: "Could not cancel meeting" }));
      return;
    }
    toast.success(t("zoom.deleted", { defaultValue: "Meeting cancelled" }));
    void load();
  };

  const studentOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of meetings) {
      if (m.student_id) map.set(m.student_id, m.student_name?.trim() || m.student_id);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [meetings]);

  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      if (filterStudent && m.student_id !== filterStudent) return false;
      if (filterStatus !== "all" && m.status !== filterStatus) return false;
      const isGroup = (m.meeting_type || "").toLowerCase().includes("group") ||
        (m.meeting_type || "").toLowerCase().includes("webinar");
      if (filterType === "1:1" && isGroup) return false;
      if (filterType === "group" && !isGroup) return false;
      return true;
    });
  }, [meetings, filterStudent, filterStatus, filterType]);

  const upcoming = useMemo(
    () =>
      filteredMeetings
        .filter((m) => m.status === "scheduled")
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [filteredMeetings]
  );

  const displayLessons = useMemo(() => {
    const sorted = [...filteredMeetings].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    if (calendarView === "list") return sorted;

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const anchor = startOfDay(anchorDate);

    if (calendarView === "day") {
      const dayKey = anchor.toDateString();
      return sorted.filter((m) => new Date(m.start_time).toDateString() === dayKey);
    }

    if (calendarView === "week") {
      const day = anchor.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const weekStart = new Date(anchor);
      weekStart.setDate(anchor.getDate() + mondayOffset);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      return sorted.filter((m) => {
        const t0 = new Date(m.start_time).getTime();
        return t0 >= weekStart.getTime() && t0 < weekEnd.getTime();
      });
    }

    // month
    const y = anchor.getFullYear();
    const mo = anchor.getMonth();
    return sorted.filter((m) => {
      const d = new Date(m.start_time);
      return d.getFullYear() === y && d.getMonth() === mo;
    });
  }, [filteredMeetings, calendarView, anchorDate]);

  const nextMeeting = upcoming[0] ?? null;
  const nextParts = nextMeeting ? lessonDateParts(nextMeeting.start_time, locale, todayLabel) : null;

  const shiftAnchor = (dir: -1 | 1) => {
    setAnchorDate((prev) => {
      const next = new Date(prev);
      if (calendarView === "day") next.setDate(next.getDate() + dir);
      else if (calendarView === "week") next.setDate(next.getDate() + dir * 7);
      else if (calendarView === "month") next.setMonth(next.getMonth() + dir);
      return next;
    });
  };

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.schedule")}
      description={t("zoom.scheduleDesc", {
        defaultValue: "Add a lesson with a student. They will see it under My appointments.",
      })}
    >
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Quick stats */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className={teacherStatCard()}>
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {t("zoom.statUpcoming", { defaultValue: "Upcoming" })}
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">{upcoming.length}</p>
            <p className="mt-1 text-xs text-text-muted">
              {t("zoom.statUpcomingDesc", { defaultValue: "Lessons with your students" })}
            </p>
          </div>

          <div className={teacherStatCard()}>
            <div className="flex items-center gap-2 text-[#2D8CFF]">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {t("zoom.statNext", { defaultValue: "Next class" })}
              </span>
            </div>
            {nextMeeting && nextParts ? (
              <>
                <p className="mt-3 text-lg font-bold leading-tight text-foreground">
                  {nextParts.isToday ? todayLabel : nextParts.weekday}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {formatTimeRange(nextMeeting.start_time, nextMeeting.duration, locale)}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-text-muted">
                {t("zoom.noMeetingsShort", { defaultValue: "Nothing scheduled yet" })}
              </p>
            )}
          </div>

          <div className={teacherStatCard()}>
            <div className="flex items-center gap-2 text-emerald-600">
              <Video className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Zoom</span>
            </div>
            <p className="mt-3 text-lg font-bold text-foreground">
              {zoomReady
                ? t("zoom.statusConnected", { defaultValue: "Connected" })
                : t("zoom.statusDisconnected", { defaultValue: "Not connected" })}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {zoomReady
                ? t("zoom.readyToSchedule", { defaultValue: "Optional — auto-create Zoom links" })
                : t("zoom.pasteLinkReady", { defaultValue: "Video-Link vor der Stunde einfügen" })}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <CreateLiveClassForm
            onCreated={() => void load()}
            zoomReady={zoomReady}
            connectHref={CONNECT_HREF}
            initialStudentId={initialStudentId}
          />

          <div className={teacherPanel()}>
            <div className="space-y-3 border-b border-border-default px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {t("zoom.scheduledMeetings", { defaultValue: "Anstehende Stunden" })}
                  </h2>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {t("zoom.scheduledMeetingsDesc", {
                      defaultValue: "SchülerInnen sehen diese unter Meine Termine.",
                    })}
                  </p>
                </div>
                {upcoming.length > 0 && (
                  <span className="rounded-full bg-[#D4AF37]/15 px-2.5 py-1 text-xs font-semibold text-[#B8941F]">
                    {upcoming.length}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["list", t("teacherDashboard.calendarList", { defaultValue: "Liste" })],
                    ["day", t("teacherDashboard.calendarDay", { defaultValue: "Tag" })],
                    ["week", t("teacherDashboard.calendarWeek", { defaultValue: "Woche" })],
                    ["month", t("teacherDashboard.calendarMonth", { defaultValue: "Monat" })],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCalendarView(id)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                      calendarView === id
                        ? "bg-[#D4AF37] text-[#0D1B2A]"
                        : "bg-surface-subtle text-text-muted hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {calendarView !== "list" && (
                <div className="flex items-center justify-between gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => shiftAnchor(-1)}>
                    ←
                  </Button>
                  <p className="text-sm font-medium text-foreground">
                    {calendarView === "month"
                      ? anchorDate.toLocaleDateString(locale, { month: "long", year: "numeric" })
                      : calendarView === "week"
                        ? t("teacherDashboard.weekOf", {
                            defaultValue: "Woche ab {{date}}",
                            date: anchorDate.toLocaleDateString(locale, {
                              day: "numeric",
                              month: "short",
                            }),
                          })
                        : anchorDate.toLocaleDateString(locale, {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => shiftAnchor(1)}>
                    →
                  </Button>
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-3">
                <select
                  value={filterStudent}
                  onChange={(e) => setFilterStudent(e.target.value)}
                  className={themeSelectClass(filterStudent, "rounded-lg py-2 text-xs")}
                >
                  <option value="">
                    {t("teacherDashboard.filterAllStudents", { defaultValue: "Alle SchülerInnen" })}
                  </option>
                  {studentOptions.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                  className={themeSelectClass(filterType, "rounded-lg py-2 text-xs")}
                >
                  <option value="all">{t("teacherDashboard.filterAllTypes", { defaultValue: "1:1 & Gruppe" })}</option>
                  <option value="1:1">1:1</option>
                  <option value="group">{t("teacherDashboard.filterGroup", { defaultValue: "Gruppe" })}</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className={themeSelectClass(filterStatus, "rounded-lg py-2 text-xs")}
                >
                  <option value="all">{t("teacherDashboard.filterAllStatuses", { defaultValue: "Alle Status" })}</option>
                  <option value="scheduled">{t("teacherDashboard.lessonStatusUpcoming", { defaultValue: "Bevorstehend" })}</option>
                  <option value="completed">{t("teacherDashboard.lessonStatusCompleted", { defaultValue: "Abgeschlossen" })}</option>
                  <option value="cancelled">{t("teacherDashboard.lessonStatusCancelled", { defaultValue: "Abgesagt" })}</option>
                  <option value="no_show">{t("teacherDashboard.lessonStatusNoShow", { defaultValue: "Nicht erschienen" })}</option>
                </select>
              </div>
            </div>

            {loading ? (
              <LoadingBlock />
            ) : displayLessons.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-subtle">
                  <Users className="h-7 w-7 text-text-muted" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {t("zoom.emptyTitle", { defaultValue: "No lessons yet" })}
                </p>
                <p className="mx-auto mt-1 max-w-xs text-xs text-text-muted">
                  {t("zoom.emptyDescPaste", {
                    defaultValue: "Use the form to add a lesson with a student. They will see it immediately.",
                  })}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border-default p-2">
                {displayLessons.map((m) => {
                  const parts = lessonDateParts(m.start_time, locale, todayLabel);
                  const isScheduled = m.status === "scheduled";
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "flex flex-col gap-4 rounded-xl p-4 transition hover:bg-surface-subtle sm:flex-row sm:items-center",
                        parts.isToday && "bg-[var(--brand-gold-muted)]/50"
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div
                          className={cn(
                            "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border",
                            parts.isToday
                              ? "border-[var(--brand-gold)]/50 bg-[var(--brand-gold-muted)]"
                              : "border-border-default bg-surface-elevated"
                          )}
                        >
                          <span className="text-2xl font-bold text-foreground">{parts.day}</span>
                          <span className="text-[10px] font-bold uppercase text-[#D4AF37]">{parts.month}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {m.meeting_title || t("zoom.liveClass", { defaultValue: "Lesson" })}
                          </p>
                          {m.student_name ? (
                            <p className="text-sm text-text-muted">{m.student_name}</p>
                          ) : (
                            <p className="text-sm text-text-muted">{parts.weekday}</p>
                          )}
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                            <Badge variant={lessonStatusVariant(m.status)}>
                              {lessonStatusLabel(m, t)}
                            </Badge>
                            <span className="rounded-full bg-surface-subtle px-2 py-0.5 font-medium">
                              {(m.meeting_type || "").toLowerCase().includes("group") ||
                              (m.meeting_type || "").toLowerCase().includes("webinar")
                                ? t("teacherDashboard.filterGroup", { defaultValue: "Gruppe" })
                                : "1:1"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeRange(m.start_time, m.duration, locale)} · {m.duration}{" "}
                              {t("studentDashboard.minShort", { defaultValue: "Min." })}
                            </span>
                            {m.meeting_provider && (
                              <MeetingProviderBadge provider={m.meeting_provider} />
                            )}
                            {parts.isToday && (
                              <span className="rounded-full bg-[#D4AF37]/15 px-2 py-0.5 font-semibold text-[#B8941F]">
                                {todayLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
                        {isScheduled && (
                          <CompleteLessonControls lessonId={m.id} onCompleted={() => void load()} />
                        )}
                        {lessonHasMeetingLink(m) ? (
                          <ZoomMeetingButton
                            lessonId={m.id}
                            mode="start"
                            provider={m.meeting_provider}
                            size="md"
                          />
                        ) : (
                          <AddLessonMeetingLink lessonId={m.id} onSaved={() => void load()} />
                        )}
                        {isScheduled && (
                          <button
                            type="button"
                            onClick={() => void handleDelete(m.id)}
                            className="rounded-xl border border-red-100 p-2.5 text-red-500 transition hover:bg-red-50"
                            aria-label={t("zoom.cancelMeeting", { defaultValue: "Cancel meeting" })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherDashboardLayout>
  );
}

export function TeacherScheduleExperience() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ScheduleContent />
    </Suspense>
  );
}
