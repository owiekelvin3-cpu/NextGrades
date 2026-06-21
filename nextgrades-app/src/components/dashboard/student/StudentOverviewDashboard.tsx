"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  FileText,
  Target,
  TrendingUp,
  ListChecks,
  Bell,
  Clock,
  User,
  GraduationCap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  fetchStudentOverviewData,
  formatBytes,
  getFirstName,
  type StudentOverviewData,
} from "@/lib/dashboard/student-overview";
import { StudentDashboardLayout } from "./StudentDashboardLayout";
import { StudentWelcomeHeader } from "./StudentWelcomeHeader";
import { StudentQuickNav } from "./StudentQuickNav";
import { formatTimeRange, lessonDateParts, st } from "./student-ui";
import {
  OverviewStatCard,
  OverviewPanel,
} from "@/components/dashboard/overview/OverviewPrimitives";
import { SwipeableCardRow, SwipeableCard } from "@/components/mobile/SwipeableCardRow";
import { cn } from "@/lib/utils";
import { ZoomMeetingButton } from "@/components/zoom/ZoomMeetingButton";

function ProgressSparkline({ values }: { values: number[] }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => {
      const x = values.length === 1 ? 40 : (i / (values.length - 1)) * 80;
      const y = 28 - (v / max) * 24;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 80 32" className="h-7 w-16" aria-hidden>
      <polyline fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" points={points} />
    </svg>
  );
}

export function StudentOverviewDashboard() {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.language);
  const searchParams = useSearchParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentOverviewData | null>(null);

  useEffect(() => {
    fetchStudentOverviewData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchParams.get("subscription") === "success") {
      toast.success(t("checkout.successTitle", { defaultValue: "Subscription activated!" }));
    }
  }, [searchParams, toast, t]);

  const title = t("studentDashboard.overviewTitle");
  const todayLabel = t("dashboardCommon.today", { defaultValue: "Today" });

  if (loading) {
    return (
      <StudentDashboardLayout title={title}>
        <LoadingBlock />
      </StudentDashboardLayout>
    );
  }

  if (!data) {
    return (
      <StudentDashboardLayout title={title}>
        <div className={`${st.panel} mx-auto max-w-md p-10 text-center`}>
          <GraduationCap className="mx-auto mb-4 h-12 w-12 text-[#D4AF37]" />
          <p className={st.textMuted}>{t("studentDashboard.signInRequired")}</p>
          <Button variant="gold" size="md" href="/login" className="mt-6">
            {t("common.login")}
          </Button>
        </div>
      </StudentDashboardLayout>
    );
  }

  const firstName = getFirstName(data.profile.fullName);
  const unitsTotal = data.units?.total ?? 0;
  const unitsRemaining = data.units?.remaining ?? 0;
  const unitsUsed = Math.max(0, unitsTotal - unitsRemaining);
  const unitsPercent = unitsTotal > 0 ? Math.round((unitsUsed / unitsTotal) * 100) : 0;

  const appointmentHint = data.nextLesson
    ? new Date(data.nextLesson.start_time).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "short",
      })
    : t("studentDashboard.noAppointments");

  return (
    <StudentDashboardLayout title={title} suppressMobileTitle>
      <div className="content-ready mx-auto flex max-w-6xl flex-col gap-6 md:gap-8">
        <StudentWelcomeHeader
          firstName={firstName}
          learningGoal={data.learningGoal}
          dateLocale={dateLocale}
        />

        <StudentQuickNav openTaskCount={data.openTaskCount} appointmentHint={appointmentHint} />

        <section>
          <SwipeableCardRow desktopCols={4}>
            <SwipeableCard>
              <OverviewStatCard
                label={t("studentDashboard.remainingUnits")}
                value={
                  data.units
                    ? t("studentDashboard.unitsOf", { remaining: unitsRemaining, total: unitsTotal })
                    : "—"
                }
                href="/pricing"
                icon={Target}
                iconClassName={st.statIconGold}
                footer={
                  data.units ? (
                    <div className={st.progressTrack}>
                      <div className={st.progressBar} style={{ width: `${unitsPercent}%` }} />
                    </div>
                  ) : undefined
                }
              />
            </SwipeableCard>

            <SwipeableCard>
              <OverviewStatCard
                label={t("studentDashboard.nextAppointment")}
                value={
                  data.nextLesson
                    ? new Date(data.nextLesson.start_time).toLocaleDateString(dateLocale, {
                        day: "numeric",
                        month: "short",
                      })
                    : "—"
                }
                href="/dashboard/student/appointments"
                icon={Calendar}
                iconClassName={st.statIconGold}
                footer={
                  data.nextLesson ? (
                    <p className={cn("text-xs", st.textMuted)}>
                      {formatTimeRange(data.nextLesson.start_time, data.nextLesson.duration, dateLocale)} ·{" "}
                      {data.nextLesson.subject_name}
                    </p>
                  ) : (
                    <p className={cn("text-xs", st.textMuted)}>{t("studentDashboard.noAppointments")}</p>
                  )
                }
              />
            </SwipeableCard>

            <SwipeableCard>
              <OverviewStatCard
                label={t("studentDashboard.totalProgress")}
                value={`${data.overallProgress}%`}
                href="/dashboard/student/progress"
                icon={TrendingUp}
                iconClassName={st.statIconGold}
                footer={
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-xs", st.textMuted)}>
                      {t("studentDashboard.progressKeepGoing", { defaultValue: "Weiter so!" })}
                    </p>
                    <ProgressSparkline values={data.progressSparkline} />
                  </div>
                }
              />
            </SwipeableCard>

            <SwipeableCard>
              <OverviewStatCard
                label={t("studentDashboard.openTasks")}
                value={data.openTaskCount}
                href="/dashboard/student/quizzes"
                icon={ListChecks}
                iconClassName={st.statIconGold}
                footer={
                  <p className={cn("text-xs", st.textMuted)}>
                    {data.openTaskCount === 0
                      ? t("studentDashboard.noOpenTasks")
                      : t("studentDashboard.tasksWaitingDesc", { defaultValue: "Aufgaben warten auf dich" })}
                  </p>
                }
              />
            </SwipeableCard>
          </SwipeableCardRow>
        </section>

        <div className="grid gap-5 lg:grid-cols-5">
          <OverviewPanel
            className="lg:col-span-3"
            title={t("studentDashboard.upcomingAppointments")}
            href="/dashboard/student/appointments"
            linkLabel={t("studentDashboard.showAllAppointments")}
            noPadding
          >
            {data.lessons.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className={st.empty}>{t("studentDashboard.noAppointments")}</p>
                <Button variant="gold" size="sm" href="/consultation" className="mt-4">
                  {t("studentDashboard.bookConsultation")}
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border-default">
                {data.lessons.slice(0, 4).map((lesson) => {
                  const parts = lessonDateParts(lesson.start_time, dateLocale, todayLabel);
                  return (
                    <li
                      key={lesson.id}
                      className={cn(
                        "flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center",
                        parts.isToday && "bg-[#D4AF37]/[0.04]"
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className={cn(st.dateBadge, parts.isToday && st.dateBadgeToday)}>
                          <span className={st.dateDay}>{parts.day}</span>
                          <span className="text-[10px] font-bold uppercase text-[#D4AF37]">{parts.month}</span>
                        </div>
                        <div className="min-w-0">
                          <p className={cn("font-semibold", st.textPrimary)}>{lesson.subject_name}</p>
                          <p className={cn("text-sm", st.textMuted)}>{parts.weekday}</p>
                          <div className={cn("mt-1 flex flex-wrap items-center gap-x-3 text-xs", st.textSubtle)}>
                            {lesson.teacher_name && (
                              <span className="inline-flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {lesson.teacher_name}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeRange(lesson.start_time, lesson.duration, dateLocale)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 pl-[4.5rem] sm:pl-0">
                        {lesson.zoom_meeting_id || lesson.zoom_link ? (
                          <ZoomMeetingButton lessonId={lesson.id} mode="join" size="sm" />
                        ) : (
                          <span className={cn("text-xs", st.textSubtle)}>{t("studentDashboard.noZoomLink")}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </OverviewPanel>

          <OverviewPanel
            className="lg:col-span-2"
            title={t("studentDashboard.nav.notifications")}
            href="/dashboard/notifications"
            linkLabel={t("studentDashboard.showAll", { defaultValue: "Alle" })}
            noPadding
          >
            {data.notifications.length === 0 ? (
              <p className={cn("px-5 py-12 text-center", st.empty)}>{t("studentDashboard.noMessages")}</p>
            ) : (
              <ul className="divide-y divide-border-default">
                {data.notifications.slice(0, 5).map((n) => (
                  <li key={n.id}>
                    <Link
                      href="/dashboard/notifications"
                      className={cn(
                        "flex gap-3 px-5 py-4 transition hover:bg-surface-subtle dark:hover:bg-white/[0.03]",
                        !n.is_read && st.unreadBg
                      )}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-subtle dark:bg-white/[0.06]">
                        <Bell className="h-4 w-4 text-text-muted" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm", !n.is_read && "font-semibold", st.textPrimary)}>{n.title}</p>
                        {n.message && (
                          <p className={cn("mt-0.5 line-clamp-2 text-xs", st.textMuted)}>{n.message}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </OverviewPanel>
        </div>

        <section className="grid gap-5 lg:grid-cols-3">
          <OverviewPanel
            title={t("studentDashboard.myCourses")}
            href="/dashboard/student/courses"
            linkLabel={t("studentDashboard.toMyCourses")}
            noPadding
          >
            {data.courses.length === 0 ? (
              <p className={cn("px-5 py-10 text-center", st.empty)}>{t("studentDashboard.noCourses")}</p>
            ) : (
              <ul className="divide-y divide-border-default">
                {data.courses.slice(0, 3).map((course) => (
                  <li key={course.enrollmentId} className="px-5 py-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className={cn("truncate text-sm font-semibold", st.textPrimary)}>{course.subjectName}</span>
                      <span className="text-sm font-semibold tabular-nums text-[#D4AF37]">{course.progressPercent}%</span>
                    </div>
                    {course.teacherName && <p className={cn("mb-2 text-xs", st.textSubtle)}>{course.teacherName}</p>}
                    <div className={st.progressTrackMd}>
                      <div className={st.progressBar} style={{ width: `${course.progressPercent}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </OverviewPanel>

          <OverviewPanel
            title={t("studentDashboard.myMaterials")}
            href="/dashboard/student/resources"
            linkLabel={t("studentDashboard.toMaterialLibraryBtn", { defaultValue: "Bibliothek" })}
            noPadding
          >
            {data.materials.length === 0 ? (
              <p className={cn("px-5 py-10 text-center", st.empty)}>{t("studentDashboard.noMaterials")}</p>
            ) : (
              <ul className="divide-y divide-border-default">
                {data.materials.slice(0, 4).map((m) => (
                  <li key={m.id} className={cn("flex items-center gap-3 px-5 py-3.5", st.listRow)}>
                    <div className={st.fileIcon}>
                      <FileText className="h-4 w-4 text-red-500 dark:text-red-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-sm font-medium", st.textPrimary)}>{m.title}</p>
                      <p className={cn("text-xs", st.textSubtle)}>
                        {m.type.toUpperCase()}
                        {m.file_size ? ` · ${formatBytes(m.file_size)}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </OverviewPanel>

          <OverviewPanel
            title={t("studentDashboard.tasks")}
            href="/dashboard/student/quizzes"
            linkLabel={t("studentDashboard.allTasks")}
            noPadding
          >
            {data.tasks.length === 0 ? (
              <p className={cn("px-5 py-10 text-center", st.empty)}>{t("studentDashboard.noTasks")}</p>
            ) : (
              <ul className="divide-y divide-border-default">
                {data.tasks.slice(0, 4).map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className={cn("truncate text-sm font-medium", st.textPrimary)}>{task.title}</p>
                      {task.dueLabel && (
                        <p className={cn("text-xs", st.textSubtle)}>
                          {new Date(task.dueLabel).toLocaleDateString(dateLocale, { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>
                    <Badge variant={task.status === "in_progress" ? "success" : "warning"}>
                      {task.status === "in_progress" ? t("studentDashboard.taskInProgress") : t("studentDashboard.taskOpen")}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </OverviewPanel>
        </section>
      </div>
    </StudentDashboardLayout>
  );
}
