"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  User,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Button } from "@/components/ui/Button";
import {
  fetchStudentAppointmentsData,
  type StudentAppointmentsData,
} from "@/lib/dashboard/student-overview";
import { StudentDashboardLayout } from "./StudentDashboardLayout";
import { studentPanel, formatTimeRange, lessonDateParts, st } from "./student-ui";
import { ZoomMeetingButton } from "@/components/zoom/ZoomMeetingButton";
import { cn } from "@/lib/utils";

type Tab = "upcoming" | "past" | "calendar";

function MiniCalendar({ lessons, locale }: { lessons: { start_time: string }[]; locale: string }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lessonDays = new Set(
    lessons.map((l) => new Date(l.start_time).getDate())
  );

  const cells: (number | null)[] = [];
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <p className={cn("mb-3 text-sm font-semibold", st.textPrimary)}>
        {now.toLocaleDateString(locale, { month: "long", year: "numeric" })}
      </p>
      <div className={cn("grid grid-cols-7 gap-1 text-center text-[10px]", st.textSubtle)}>
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) =>
          day === null ? (
            <span key={`e-${i}`} />
          ) : (
            <span
              key={day}
              className={cn(
                "relative flex h-8 items-center justify-center rounded-lg text-xs",
                day === now.getDate() && "bg-[#D4AF37] font-bold text-[#0D1B2A]",
                lessonDays.has(day) && day !== now.getDate() && "font-semibold text-[#D4AF37]"
              )}
            >
              {day}
              {lessonDays.has(day) && day !== now.getDate() && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#D4AF37]" />
              )}
            </span>
          )
        )}
      </div>
    </div>
  );
}

export function StudentAppointmentsExperience() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const todayLabel = t("dashboardCommon.today", { defaultValue: "Today" });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentAppointmentsData | null>(null);
  const [tab, setTab] = useState<Tab>("upcoming");

  useEffect(() => {
    fetchStudentAppointmentsData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const title = t("studentDashboard.nav.appointments");
  const description = t("studentDashboard.appointmentsDesc", {
    defaultValue: "Here you can see all your upcoming and past appointments.",
  });

  const list = useMemo(() => {
    if (!data) return [];
    if (tab === "past") return data.past;
    if (tab === "calendar") return data.upcoming;
    return data.upcoming;
  }, [data, tab]);

  const unitsTotal = data?.units?.total ?? 0;
  const unitsRemaining = data?.units?.remaining ?? 0;
  const unitsUsed = Math.max(0, unitsTotal - unitsRemaining);
  const unitsPercent = unitsTotal > 0 ? Math.round((unitsUsed / unitsTotal) * 100) : 0;

  if (loading) {
    return (
      <StudentDashboardLayout title={title} description={description}>
        <LoadingBlock />
      </StudentDashboardLayout>
    );
  }

  if (!data) {
    return (
      <StudentDashboardLayout title={title} description={description}>
        <p className={cn("text-center", st.textMuted)}>{t("studentDashboard.signInRequired")}</p>
      </StudentDashboardLayout>
    );
  }

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" className="gap-2">
        <Calendar className="h-4 w-4" />
        {t("studentDashboard.connectCalendar", { defaultValue: "Connect calendar" })}
      </Button>
      <Button variant="gold" size="sm" href="/consultation" className="gap-2">
        <Plus className="h-4 w-4" />
        {t("studentDashboard.requestAppointment", { defaultValue: "Request new appointment" })}
      </Button>
    </div>
  );

  return (
    <StudentDashboardLayout title={title} description={description} topRightAction={headerActions}>
      <div className="mx-auto grid max-w-[1400px] gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-6 border-b border-border-default">
            {(
              [
                ["upcoming", t("studentDashboard.tabUpcoming", { defaultValue: "Upcoming appointments" })],
                ["past", t("studentDashboard.tabPast", { defaultValue: "Past appointments" })],
                ["calendar", t("studentDashboard.tabCalendar", { defaultValue: "Calendar view" })],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "border-b-2 pb-3 text-sm font-medium transition",
                  tab === id ? st.tabActive : st.tabInactive
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "calendar" ? (
            <div className={studentPanel("p-6")}>
              <MiniCalendar lessons={[...data.upcoming, ...data.past]} locale={locale} />
            </div>
          ) : (
            <div className={studentPanel()}>
              <div className={cn(st.panelHeader, "border-b")}>
                <h2 className={cn("text-sm font-semibold", st.textPrimary)}>
                  {tab === "upcoming"
                    ? t("studentDashboard.yourUpcoming", { defaultValue: "Your upcoming appointments" })
                    : t("studentDashboard.yourPast", { defaultValue: "Your past appointments" })}
                </h2>
              </div>
              {list.length === 0 ? (
                <p className={cn("px-5 py-12 text-center", st.empty)}>{t("studentDashboard.noAppointments")}</p>
              ) : (
                <div className={st.divider}>
                  {list.map((lesson) => {
                    const parts = lessonDateParts(lesson.start_time, locale, todayLabel);
                    return (
                      <div
                        key={lesson.id}
                        className={cn(
                          "flex flex-col gap-4 p-5 sm:flex-row sm:items-center",
                          parts.isToday && tab === "upcoming" && st.unreadBg
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <div className={cn(st.dateBadgeLg, parts.isToday && st.dateBadgeToday)}>
                            <span className={st.dateDayLg}>{parts.day}</span>
                            <span className="text-[10px] font-bold uppercase text-[#D4AF37]">{parts.month}</span>
                            {parts.isToday && (
                              <span className="text-[9px] font-semibold text-[#D4AF37]">{todayLabel}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={cn("font-semibold", st.textPrimary)}>{lesson.subject_name}</p>
                            <p className={cn("text-sm", st.textMuted)}>{parts.weekday}</p>
                            <div className={cn("mt-1 flex flex-wrap gap-x-3 text-xs", st.textSubtle)}>
                              {lesson.teacher_name && (
                                <span className="inline-flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {lesson.teacher_name}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeRange(lesson.start_time, lesson.duration, locale)} · {lesson.duration}{" "}
                                {t("studentDashboard.minShort", { defaultValue: "min" })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {lesson.zoom_meeting_id && tab === "upcoming" ? (
                            <ZoomMeetingButton lessonId={lesson.id} mode="join" />
                          ) : null}
                          <button type="button" className={st.iconBtn} aria-label="More">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* How it works */}
          <div className={studentPanel("p-6")}>
            <h3 className={cn("mb-4 text-sm font-semibold", st.textPrimary)}>
              {t("studentDashboard.howAppointmentsWork", { defaultValue: "How your appointments work" })}
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Video, color: "bg-blue-50 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400", title: t("studentDashboard.stepStart", { defaultValue: "Start appointment" }) },
                { icon: Clock, color: "bg-orange-50 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400", title: t("studentDashboard.stepOnTime", { defaultValue: "Be on time" }) },
                { icon: Calendar, color: "bg-green-50 text-green-500 dark:bg-green-500/15 dark:text-green-400", title: t("studentDashboard.stepLearn", { defaultValue: "Learn & progress" }) },
              ].map((step) => (
                <div key={step.title} className="flex flex-col items-center text-center">
                  <div className={cn("mb-2 flex h-12 w-12 items-center justify-center rounded-full", step.color)}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className={cn("text-sm font-medium", st.textPrimary)}>{step.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-4">
          <div className={studentPanel("p-5")}>
            <h3 className={cn("text-sm font-semibold", st.textPrimary)}>
              {t("studentDashboard.remainingUnits")}
            </h3>
            <p className={cn("mt-2 text-sm", st.textMuted)}>
              {data.units
                ? t("studentDashboard.unitsLeftDesc", {
                    remaining: unitsRemaining,
                    total: unitsTotal,
                    defaultValue: `${unitsRemaining} of ${unitsTotal} units left`,
                  })
                : t("studentDashboard.noUnits")}
            </p>
            {data.units && (
              <div className={cn("mt-3", st.progressTrackMd)}>
                <div className={st.progressBar} style={{ width: `${unitsPercent}%` }} />
              </div>
            )}
            <Link href="/pricing" className="mt-3 inline-flex text-xs font-medium text-[#D4AF37] hover:underline">
              {t("studentDashboard.viewDetails", { defaultValue: "View details" })}
            </Link>
          </div>

          {data.nextLesson && (
            <div className={studentPanel("p-5")}>
              <h3 className={cn("text-sm font-semibold", st.textPrimary)}>{t("studentDashboard.nextAppointment")}</h3>
              <p className={cn("mt-2 text-sm font-medium", st.textPrimary)}>
                {lessonDateParts(data.nextLesson.start_time, locale, todayLabel).full}
              </p>
              <p className={cn("text-sm", st.textMuted)}>
                {formatTimeRange(data.nextLesson.start_time, data.nextLesson.duration, locale)}
              </p>
              {data.nextLesson.subject_name && (
                <span className="mt-2 inline-block rounded-lg bg-[#D4AF37]/10 px-2 py-1 text-xs font-medium text-[#D4AF37]">
                  {data.nextLesson.subject_name}
                </span>
              )}
              {data.nextLesson.zoom_meeting_id && (
                <ZoomMeetingButton lessonId={data.nextLesson.id} mode="join" className="mt-4 w-full justify-center" />
              )}
            </div>
          )}

          <div className={studentPanel("p-5")}>
            <MiniCalendar lessons={[...data.upcoming, ...data.past]} locale={locale} />
          </div>

          {data.primaryTeacher && (
            <div className={studentPanel("p-5")}>
              <h3 className={cn("text-sm font-semibold", st.textPrimary)}>
                {t("studentDashboard.yourTeacher", { defaultValue: "Your teacher" })}
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37]/20 text-sm font-bold text-[#D4AF37]">
                  {data.primaryTeacher.name.charAt(0)}
                </div>
                <div>
                  <p className={cn("text-sm font-semibold", st.textPrimary)}>{data.primaryTeacher.name}</p>
                  {data.primaryTeacher.subject && (
                    <p className={cn("text-xs", st.textMuted)}>{data.primaryTeacher.subject}</p>
                  )}
                </div>
              </div>
              <Link href="/dashboard/chat" className="mt-3 inline-flex text-xs font-medium text-[#D4AF37] hover:underline">
                {t("studentDashboard.viewProfile", { defaultValue: "View profile" })}
              </Link>
            </div>
          )}
        </aside>
      </div>
    </StudentDashboardLayout>
  );
}
