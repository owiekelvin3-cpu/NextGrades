"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  User,
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
import { studentPanel, formatTimeRange, lessonDateParts, lessonDisplayTitle, st } from "./student-ui";
import { StudentTabBar } from "./StudentTabBar";
import { StudentCalendarConnectModal } from "./StudentCalendarConnectModal";
import { ZoomMeetingButton } from "@/components/zoom/ZoomMeetingButton";
import { lessonHasMeetingLink } from "@/lib/meetings/link";
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
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  useEffect(() => {
    fetchStudentAppointmentsData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const title = t("studentDashboard.nav.appointments");
  const description = t("studentDashboard.appointmentsDesc", {
    defaultValue: "See upcoming and past lessons.",
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
    <Button
      variant="outline"
      size="sm"
      className="w-full gap-2 sm:w-auto"
      onClick={() => setShowCalendarModal(true)}
    >
      <Calendar className="h-4 w-4" />
      {t("studentDashboard.connectCalendar", { defaultValue: "Connect calendar" })}
    </Button>
  );

  return (
    <StudentDashboardLayout title={title} description={description} headerAction={headerActions}>
      <StudentCalendarConnectModal open={showCalendarModal} onClose={() => setShowCalendarModal(false)} />
      <div className={st.pageGrid}>
        <div className={cn(st.mainColumn, "space-y-6")}>
          <StudentTabBar
            tabs={[
              {
                id: "upcoming",
                label: t("studentDashboard.tabUpcoming", { defaultValue: "Upcoming appointments" }),
                shortLabel: t("studentDashboard.tabUpcomingShort", { defaultValue: "Upcoming" }),
              },
              {
                id: "past",
                label: t("studentDashboard.tabPast", { defaultValue: "Past appointments" }),
                shortLabel: t("studentDashboard.tabPastShort", { defaultValue: "Past" }),
              },
              {
                id: "calendar",
                label: t("studentDashboard.tabCalendar", { defaultValue: "Calendar view" }),
                shortLabel: t("studentDashboard.tabCalendarShort", { defaultValue: "Calendar" }),
              },
            ]}
            active={tab}
            onChange={(id) => setTab(id as Tab)}
          />

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
                          "flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center",
                          parts.isToday && tab === "upcoming" && st.unreadBg
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
                          <div className={cn(st.dateBadgeLg, parts.isToday && st.dateBadgeToday)}>
                            <span className={st.dateDayLg}>{parts.day}</span>
                            <span className="text-[10px] font-bold uppercase text-[#D4AF37]">{parts.month}</span>
                            {parts.isToday && (
                              <span className="text-[9px] font-semibold text-[#D4AF37]">{todayLabel}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={cn("font-semibold", st.textPrimary)}>
                              {lessonDisplayTitle(
                                lesson,
                                t("studentDashboard.lessonFallback", { defaultValue: "Lesson" })
                              )}
                            </p>
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
                        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                          {lessonHasMeetingLink(lesson) && tab === "upcoming" ? (
                            <ZoomMeetingButton
                              lessonId={lesson.id}
                              mode="join"
                              provider={lesson.meeting_provider}
                              className="w-full justify-center sm:w-auto"
                            />
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
                { icon: Video, color: st.stepIconBlue, title: t("studentDashboard.stepStart", { defaultValue: "Start appointment" }) },
                { icon: Clock, color: st.stepIconOrange, title: t("studentDashboard.stepOnTime", { defaultValue: "Be on time" }) },
                { icon: Calendar, color: st.stepIconGreen, title: t("studentDashboard.stepLearn", { defaultValue: "Learn & progress" }) },
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

        {/* Right sidebar - next appointment first on mobile */}
        <aside className={st.asideWidgets}>
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
                <span className={cn("mt-2 inline-block", st.goldChip)}>
                  {data.nextLesson.subject_name}
                </span>
              )}
              {data.nextLesson && lessonHasMeetingLink(data.nextLesson) && (
                <ZoomMeetingButton
                  lessonId={data.nextLesson.id}
                  mode="join"
                  provider={data.nextLesson.meeting_provider}
                  className="mt-4 w-full justify-center"
                />
              )}
            </div>
          )}

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

          <div className={cn(studentPanel("p-5"), "hidden lg:block")}>
            <MiniCalendar lessons={[...data.upcoming, ...data.past]} locale={locale} />
          </div>

          {data.primaryTeacher && (
            <div className={studentPanel("p-5")}>
              <h3 className={cn("text-sm font-semibold", st.textPrimary)}>
                {t("studentDashboard.yourTeacher", { defaultValue: "Your teacher" })}
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold", st.goldIconWrap)}>
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
