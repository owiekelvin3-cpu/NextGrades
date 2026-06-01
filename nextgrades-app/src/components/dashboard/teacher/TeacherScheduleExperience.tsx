"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Video,
  Trash2,
  Clock,
  CalendarDays,
  Sparkles,
  ExternalLink,
  Users,
} from "lucide-react";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { useToast } from "@/context/ToastContext";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import { CreateLiveClassForm } from "@/components/zoom/CreateLiveClassForm";
import { ZoomSetupStrip, useZoomStatus } from "@/components/zoom/ZoomSetupStrip";
import { teacherPanel, teacherStatCard } from "./teacher-ui";
import { formatTimeRange, lessonDateParts } from "@/components/dashboard/student/student-ui";
import { ZoomMeetingButton } from "@/components/zoom/ZoomMeetingButton";
import { cn } from "@/lib/utils";

const SCHEDULE_PATH = "/dashboard/teacher/schedule";
const CONNECT_HREF = `/api/zoom/authorize?return=${encodeURIComponent(SCHEDULE_PATH)}`;

type LessonRow = {
  id: string;
  start_time: string;
  duration: number;
  zoom_link: string | null;
  zoom_meeting_id: string | null;
  meeting_title: string | null;
  meeting_type: string | null;
  status: string;
  student_id: string;
};

function ScheduleContent() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const toast = useToast();
  const todayLabel = t("dashboardCommon.today", { defaultValue: "Today" });
  const { ready: zoomReady } = useZoomStatus(SCHEDULE_PATH);
  const [meetings, setMeetings] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/zoom/meetings");
    const data = await res.json();
    setMeetings((data.meetings ?? []) as LessonRow[]);
    setLoading(false);
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

  const setupSteps = [
    {
      step: 1,
      title: t("zoom.stepConnect", { defaultValue: "Connect Zoom" }),
      done: zoomReady,
    },
    {
      step: 2,
      title: t("zoom.stepSchedule", { defaultValue: "Schedule your class" }),
      done: upcoming.length > 0,
    },
    {
      step: 3,
      title: t("zoom.stepGoLive", { defaultValue: "Go live with one click" }),
      done: false,
    },
  ];

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.appointments")}
      description={t("zoom.scheduleDesc", {
        defaultValue: "Plan live classes, send invites automatically, and join from one place.",
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
            <p className="mt-3 text-3xl font-bold text-[#0D1B2A]">{upcoming.length}</p>
            <p className="mt-1 text-xs text-gray-500">
              {t("zoom.statUpcomingDesc", { defaultValue: "Scheduled live sessions" })}
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
                <p className="mt-3 text-lg font-bold leading-tight text-[#0D1B2A]">
                  {nextParts.isToday ? todayLabel : nextParts.weekday}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {formatTimeRange(nextMeeting.start_time, nextMeeting.duration, locale)}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                {t("zoom.noMeetingsShort", { defaultValue: "Nothing scheduled yet" })}
              </p>
            )}
          </div>

          <div className={teacherStatCard()}>
            <div className="flex items-center gap-2 text-emerald-600">
              <Video className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Zoom</span>
            </div>
            <p className="mt-3 text-lg font-bold text-[#0D1B2A]">
              {zoomReady
                ? t("zoom.statusConnected", { defaultValue: "Connected" })
                : t("zoom.statusDisconnected", { defaultValue: "Not connected" })}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {zoomReady
                ? t("zoom.readyToSchedule", { defaultValue: "Ready to schedule" })
                : t("zoom.setupRequired", { defaultValue: "Connect Zoom to start scheduling" })}
            </p>
          </div>
        </div>

        {/* Setup progress — only when not fully set up */}
        {(!zoomReady || upcoming.length === 0) && (
          <div className={teacherPanel("p-5 sm:p-6")}>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#D4AF37]" />
              <h2 className="text-sm font-semibold text-[#0D1B2A]">
                {t("zoom.getStarted", { defaultValue: "Get started in 3 steps" })}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {setupSteps.map((item) => (
                <div
                  key={item.step}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3",
                    item.done ? "border-green-200 bg-green-50" : "border-gray-100 bg-[#FAFBFC]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      item.done ? "bg-green-600 text-white" : "bg-[#0D1B2A] text-white"
                    )}
                  >
                    {item.done ? "✓" : item.step}
                  </span>
                  <p className="text-sm font-medium text-[#0D1B2A]">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <ZoomSetupStrip returnPath={SCHEDULE_PATH} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <CreateLiveClassForm
            onCreated={() => void load()}
            zoomReady={zoomReady}
            connectHref={CONNECT_HREF}
          />

          <div className={teacherPanel()}>
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[#0D1B2A]">
                  {t("zoom.scheduledMeetings", { defaultValue: "Scheduled meetings" })}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {t("zoom.scheduledMeetingsDesc", {
                    defaultValue: "Your upcoming live sessions — join or cancel anytime.",
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
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F2F5]">
                  <Users className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-[#0D1B2A]">
                  {t("zoom.emptyTitle", { defaultValue: "No classes scheduled yet" })}
                </p>
                <p className="mx-auto mt-1 max-w-xs text-xs text-gray-500">
                  {zoomReady
                    ? t("zoom.emptyDescReady", {
                        defaultValue: "Use the form on the left to schedule your first live class.",
                      })
                    : t("zoom.emptyDescConnect", {
                        defaultValue: "Connect Zoom first, then schedule your first session.",
                      })}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 p-2">
                {upcoming.map((m) => {
                  const parts = lessonDateParts(m.start_time, locale, todayLabel);
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "flex flex-col gap-4 rounded-xl p-4 transition hover:bg-[#FAFBFC] sm:flex-row sm:items-center",
                        parts.isToday && "bg-[#FFF9E6]/50"
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div
                          className={cn(
                            "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border",
                            parts.isToday ? "border-[#D4AF37]/50 bg-[#FFF9E6]" : "border-gray-100 bg-white"
                          )}
                        >
                          <span className="text-2xl font-bold text-[#0D1B2A]">{parts.day}</span>
                          <span className="text-[10px] font-bold uppercase text-[#D4AF37]">{parts.month}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#0D1B2A]">
                            {m.meeting_title || t("zoom.liveClass", { defaultValue: "Live class" })}
                          </p>
                          <p className="text-sm text-gray-500">{parts.weekday}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeRange(m.start_time, m.duration, locale)}
                            </span>
                            {m.meeting_type && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 capitalize text-gray-600">
                                {m.meeting_type.replace(/_/g, " ")}
                              </span>
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
                        {m.zoom_meeting_id && (
                          <ZoomMeetingButton lessonId={m.id} mode="start" size="md" />
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
