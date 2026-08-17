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
} from "lucide-react";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { useToast } from "@/context/ToastContext";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import { CreateLiveClassForm } from "@/components/zoom/CreateLiveClassForm";
import { useZoomStatus } from "@/components/zoom/ZoomSetupStrip";
import { teacherPanel, teacherStatCard } from "./teacher-ui";
import { formatTimeRange, lessonDateParts } from "@/components/dashboard/student/student-ui";
import { ZoomMeetingButton } from "@/components/zoom/ZoomMeetingButton";
import { MeetingProviderBadge } from "@/components/meetings/MeetingProviderIcon";
import { lessonHasMeetingLink } from "@/lib/meetings/link";
import { cn } from "@/lib/utils";

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
  student_id: string;
  student_name?: string | null;
};

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
  const [now] = useState(() => Date.now());

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

  const upcoming = useMemo(
    () =>
      meetings
        .filter((m) => m.status === "scheduled" && new Date(m.start_time).getTime() >= now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [meetings, now]
  );

  const nextMeeting = upcoming[0] ?? null;
  const nextParts = nextMeeting ? lessonDateParts(nextMeeting.start_time, locale, todayLabel) : null;

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
                : t("zoom.pasteLinkReady", { defaultValue: "Optional — add a video link if you have one" })}
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
            <div className="flex items-center justify-between gap-3 border-b border-border-default px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {t("zoom.scheduledMeetings", { defaultValue: "Upcoming lessons" })}
                </h2>
                <p className="mt-0.5 text-xs text-text-muted">
                  {t("zoom.scheduledMeetingsDesc", {
                    defaultValue: "Students see these under My appointments.",
                  })}
                </p>
              </div>
              {upcoming.length > 0 && (
                <span className="rounded-full bg-[#D4AF37]/15 px-2.5 py-1 text-xs font-semibold text-[#B8941F]">
                  {upcoming.length}
                </span>
              )}
            </div>

            {loading ? (
              <LoadingBlock />
            ) : upcoming.length === 0 ? (
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
                {upcoming.map((m) => {
                  const parts = lessonDateParts(m.start_time, locale, todayLabel);
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
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeRange(m.start_time, m.duration, locale)}
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
                      <div className="flex shrink-0 gap-2">
                        {lessonHasMeetingLink(m) && (
                          <ZoomMeetingButton
                            lessonId={m.id}
                            mode="start"
                            provider={m.meeting_provider}
                            size="md"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => void handleDelete(m.id)}
                          className="rounded-xl border border-red-100 p-2.5 text-red-500 transition hover:bg-red-50"
                          aria-label={t("zoom.cancelMeeting", { defaultValue: "Cancel meeting" })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
