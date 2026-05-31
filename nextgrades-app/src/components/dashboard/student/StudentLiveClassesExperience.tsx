"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Video, User, Clock } from "lucide-react";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { fetchAllStudentLessonsForStudent } from "@/lib/dashboard/student-overview";
import { getSessionUserId } from "@/lib/dashboard/data";
import type { DashboardLesson } from "@/lib/dashboard/data";
import { StudentDashboardLayout } from "./StudentDashboardLayout";
import { studentPanel, formatTimeRange, lessonDateParts } from "./student-ui";
import { ZoomMeetingButton } from "@/components/zoom/ZoomMeetingButton";
import { cn } from "@/lib/utils";

export function StudentLiveClassesExperience() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const todayLabel = t("dashboardCommon.today", { defaultValue: "Today" });
  const [lessons, setLessons] = useState<DashboardLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const uid = await getSessionUserId();
      if (!uid) {
        setLoading(false);
        return;
      }
      const all = await fetchAllStudentLessonsForStudent(uid);
      const live = all.filter(
        (l) =>
          l.zoom_link &&
          l.status === "scheduled" &&
          new Date(l.start_time).getTime() >= Date.now() - 30 * 60 * 1000
      );
      setLessons(live);
      setLoading(false);
    })();
  }, []);

  const title = t("studentDashboard.liveClasses", { defaultValue: "Live classes" });
  const description = t("studentDashboard.liveClassesDesc", {
    defaultValue: "Join your upcoming live classes with one click.",
  });

  return (
    <StudentDashboardLayout title={title} description={description}>
      <div className="mx-auto max-w-3xl">
        {loading ? (
          <LoadingBlock />
        ) : lessons.length === 0 ? (
          <div className={cn(studentPanel(), "p-12 text-center")}>
            <Video className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">
              {t("studentDashboard.noLiveClasses", { defaultValue: "No upcoming live classes scheduled." })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => {
              const parts = lessonDateParts(lesson.start_time, locale, todayLabel);
              return (
                <div key={lesson.id} className={studentPanel("p-5")}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div
                      className={cn(
                        "flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border",
                        parts.isToday ? "border-[#D4AF37]/50 bg-[#FFF9E6]" : "border-gray-100 bg-[#FAFBFC]"
                      )}
                    >
                      <span className="text-2xl font-bold text-[#0D1B2A]">{parts.day}</span>
                      <span className="text-[10px] font-bold uppercase text-[#D4AF37]">{parts.month}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-bold text-[#0D1B2A]">
                        {lesson.subject_name || t("zoom.liveClass", { defaultValue: "Live class" })}
                      </p>
                      <p className="text-sm text-gray-500">{parts.weekday}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                        {lesson.teacher_name && (
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {lesson.teacher_name}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTimeRange(lesson.start_time, lesson.duration, locale)}
                        </span>
                      </div>
                    </div>
                    {(lesson.zoom_meeting_id || lesson.zoom_link) && (
                      <ZoomMeetingButton lessonId={lesson.id} mode="join" className="shrink-0 px-6 py-3" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  );
}
