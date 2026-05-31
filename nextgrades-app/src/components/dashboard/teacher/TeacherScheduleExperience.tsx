"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Video, Trash2, Clock, User } from "lucide-react";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { useToast } from "@/context/ToastContext";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import { CreateLiveClassForm } from "@/components/zoom/CreateLiveClassForm";
import { teacherPanel } from "./teacher-ui";
import { formatTimeRange, lessonDateParts } from "@/components/dashboard/student/student-ui";

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

export function TeacherScheduleExperience() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const toast = useToast();
  const [meetings, setMeetings] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const todayLabel = t("dashboardCommon.today", { defaultValue: "Today" });

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

  const upcoming = meetings.filter(
    (m) => m.status === "scheduled" && new Date(m.start_time).getTime() >= Date.now()
  );

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.appointments")}
      description={t("zoom.scheduleDesc", { defaultValue: "Schedule live classes and manage Zoom meetings." })}
    >
      <div className="mx-auto max-w-[1400px] space-y-6">
        <CreateLiveClassForm onCreated={() => void load()} />

        <div className={teacherPanel()}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-[#0D1B2A]">
              {t("zoom.scheduledMeetings", { defaultValue: "Scheduled meetings" })}
            </h2>
          </div>

          {loading ? (
            <LoadingBlock />
          ) : upcoming.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-500">
              {t("zoom.noMeetings", { defaultValue: "No upcoming Zoom meetings." })}
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcoming.map((m) => {
                const parts = lessonDateParts(m.start_time, locale, todayLabel);
                return (
                  <div key={m.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#0D1B2A]">
                        {m.meeting_title || t("zoom.liveClass", { defaultValue: "Live class" })}
                      </p>
                      <p className="text-sm text-gray-500">{parts.weekday}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeRange(m.start_time, m.duration, locale)}
                        </span>
                        {m.meeting_type && (
                          <span className="rounded bg-gray-100 px-2 py-0.5 capitalize">
                            {m.meeting_type.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {m.zoom_link && (
                        <a
                          href={m.zoom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#2D8CFF] px-4 py-2 text-sm font-semibold text-white"
                        >
                          <Video className="h-4 w-4" />
                          {t("zoom.startMeeting", { defaultValue: "Start" })}
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDelete(m.id)}
                        className="rounded-xl border border-red-200 p-2 text-red-500 hover:bg-red-50"
                        aria-label="Cancel"
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

        <p className="text-center text-sm text-gray-500">
          {t("zoom.connectHint", { defaultValue: "Connect Zoom in" })}{" "}
          <Link href="/dashboard/teacher/settings" className="font-medium text-[#D4AF37] hover:underline">
            {t("settings.title", { defaultValue: "Settings" })}
          </Link>
        </p>
      </div>
    </TeacherDashboardLayout>
  );
}
