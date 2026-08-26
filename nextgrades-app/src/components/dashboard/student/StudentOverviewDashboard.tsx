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
import { motion } from "framer-motion";
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
import { StudentHeroBand } from "./StudentHeroBand";
import { StudentQuickNav } from "./StudentQuickNav";
import { StudentMobileDashboard } from "./StudentMobileDashboard";
import { StudentKpiCard, StudentKpiStrip } from "./StudentKpiCard";
import { StudentPanel } from "./StudentPanel";
import { formatTimeRange, lessonDateParts, lessonDisplayTitle, st } from "./student-ui";
import { studentStaggerContainer, studentStaggerItem } from "./student-motion";
import { OverviewEmptyState } from "@/components/dashboard/overview/OverviewPrimitives";
import { cn } from "@/lib/utils";
import { localizeNotificationMessage, localizeNotificationTitle } from "@/lib/notifications/format";
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
      <polyline
        fill="none"
        stroke="var(--brand-gold)"
        strokeWidth="2"
        strokeLinecap="round"
        points={points}
      />
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
          <GraduationCap className="mx-auto mb-4 h-12 w-12 text-[var(--brand-gold)]" />
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

  const nextLessonCta = data.nextLesson
    ? new Date(data.nextLesson.start_time).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;

  return (
    <StudentDashboardLayout title={title} suppressMobileTitle hideTopBar>
      <StudentMobileDashboard data={data} firstName={firstName} dateLocale={dateLocale} />

      <motion.div
        className="hidden md:flex content-ready mx-auto max-w-6xl flex-col gap-6 md:gap-8"
        variants={studentStaggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={studentStaggerItem}>
          <StudentHeroBand
            firstName={firstName}
            learningGoal={data.learningGoal}
            dateLocale={dateLocale}
            overallProgress={data.overallProgress}
            nextLessonLabel={nextLessonCta}
          />
        </motion.div>

        <motion.div variants={studentStaggerItem}>
          <StudentQuickNav openTaskCount={data.openTaskCount} appointmentHint={appointmentHint} />
        </motion.div>

        <motion.section variants={studentStaggerItem}>
          <StudentKpiStrip>
            <StudentKpiCard
              label={t("studentDashboard.remainingUnits")}
              value={
                data.units
                  ? t("studentDashboard.unitsOf", { remaining: unitsRemaining, total: unitsTotal })
                  : "-"
              }
              href="/pricing"
              icon={Target}
              footer={
                data.units ? (
                  <div className={st.progressTrack}>
                    <div className={st.progressBar} style={{ width: `${unitsPercent}%` }} />
                  </div>
                ) : undefined
              }
            />
            <StudentKpiCard
              label={t("studentDashboard.nextAppointment")}
              value={
                data.nextLesson
                  ? new Date(data.nextLesson.start_time).toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "short",
                    })
                  : "-"
              }
              href="/dashboard/student/appointments"
              icon={Calendar}
              accent="navy"
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
            <StudentKpiCard
              label={t("studentDashboard.totalProgress")}
              value={`${data.overallProgress}%`}
              href="/dashboard/student/progress"
              icon={TrendingUp}
              accent="emerald"
              footer={
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("text-xs", st.textMuted)}>{t("studentDashboard.progressKeepGoing")}</p>
                  <ProgressSparkline values={data.progressSparkline} />
                </div>
              }
            />
            <StudentKpiCard
              label={t("studentDashboard.openTasks")}
              value={data.openTaskCount}
              href="/dashboard/student/quizzes"
              icon={ListChecks}
              accent="violet"
              footer={
                data.openTaskCount === 0 ? (
                  <p className={cn("text-xs", st.textMuted)}>{t("studentDashboard.noOpenTasks")}</p>
                ) : null
              }
            />
          </StudentKpiStrip>
        </motion.section>

        <motion.div variants={studentStaggerItem} className="grid gap-5 lg:grid-cols-5">
          <StudentPanel
            className="lg:col-span-3"
            title={t("studentDashboard.upcomingAppointments")}
            href="/dashboard/student/appointments"
            linkLabel={t("studentDashboard.showAllAppointments")}
            icon={Calendar}
            noPadding
          >
            {data.lessons.length === 0 ? (
              <OverviewEmptyState
                icon={Calendar}
                title={t("studentDashboard.noAppointments")}
                actionHref="/consultation"
                actionLabel={t("studentDashboard.bookConsultation")}
              />
            ) : (
              <ul className="divide-y divide-border-default">
                {data.lessons.slice(0, 4).map((lesson) => {
                  const parts = lessonDateParts(lesson.start_time, dateLocale, todayLabel);
                  return (
                    <li
                      key={lesson.id}
                      className={cn(
                        "flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center",
                        parts.isToday && st.unreadBg
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className={cn(st.dateBadge, parts.isToday && st.dateBadgeToday)}>
                          <span className={st.dateDay}>{parts.day}</span>
                          <span className="text-[10px] font-bold uppercase text-[var(--brand-gold)]">
                            {parts.month}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className={cn("font-semibold", st.textPrimary)}>
                            {lessonDisplayTitle(
                              lesson,
                              t("studentDashboard.lessonFallback", { defaultValue: "Lesson" })
                            )}
                          </p>
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
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        {lesson.zoom_meeting_id || lesson.zoom_link ? (
                          <ZoomMeetingButton
                            lessonId={lesson.id}
                            mode="join"
                            size="sm"
                            className="w-full justify-center sm:w-auto"
                          />
                        ) : (
                          <span className={cn("text-xs", st.textSubtle)}>{t("studentDashboard.noZoomLink")}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </StudentPanel>

          <StudentPanel
            className="lg:col-span-2"
            title={t("studentDashboard.nav.notifications")}
            href="/dashboard/notifications"
            linkLabel={t("studentDashboard.showAll", { defaultValue: "All" })}
            icon={Bell}
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
                        "flex gap-3 px-5 py-4 transition hover:bg-[var(--table-row-hover)]",
                        !n.is_read && st.unreadBg
                      )}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-gold-muted)]">
                        <Bell className="h-4 w-4 text-[var(--brand-gold)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm", !n.is_read && "font-semibold", st.textPrimary)}>
                          {localizeNotificationTitle(n.title, i18n.language)}
                        </p>
                        {n.message && (
                          <p className={cn("mt-0.5 line-clamp-2 text-xs", st.textMuted)}>
                            {localizeNotificationMessage(n.message, i18n.language)}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </StudentPanel>
        </motion.div>

        <motion.section variants={studentStaggerItem} className="grid gap-5 lg:grid-cols-3">
          <StudentPanel
            title={t("studentDashboard.myCourses")}
            href="/dashboard/student/courses"
            linkLabel={t("studentDashboard.toMyCourses")}
            icon={GraduationCap}
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
                      <span className="text-sm font-semibold tabular-nums text-[var(--brand-gold)]">
                        {course.progressPercent}%
                      </span>
                    </div>
                    {course.teacherName && <p className={cn("mb-2 text-xs", st.textSubtle)}>{course.teacherName}</p>}
                    <div className={st.progressTrackMd}>
                      <div className={st.progressBar} style={{ width: `${course.progressPercent}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </StudentPanel>

          <StudentPanel
            title={t("studentDashboard.myMaterials")}
            href="/dashboard/student/resources"
            linkLabel={t("studentDashboard.toMaterialLibraryBtn", { defaultValue: "Library" })}
            icon={FileText}
            noPadding
          >
            {data.materials.length === 0 ? (
              <p className={cn("px-5 py-10 text-center", st.empty)}>{t("studentDashboard.noMaterials")}</p>
            ) : (
              <ul className="divide-y divide-border-default">
                {data.materials.slice(0, 4).map((m) => (
                  <li key={m.id} className={cn("flex items-center gap-3 px-5 py-3.5", st.listRow)}>
                    <div className={st.fileIcon}>
                      <FileText className="h-4 w-4" />
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
          </StudentPanel>

          <StudentPanel
            title={t("studentDashboard.tasks")}
            href="/dashboard/student/quizzes"
            linkLabel={t("studentDashboard.allTasks")}
            icon={ListChecks}
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
                          {new Date(task.dueLabel).toLocaleDateString(dateLocale, {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      )}
                    </div>
                    <Badge variant={task.status === "in_progress" ? "success" : "warning"}>
                      {task.status === "in_progress"
                        ? t("studentDashboard.taskInProgress")
                        : t("studentDashboard.taskOpen")}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </StudentPanel>
        </motion.section>
      </motion.div>
    </StudentDashboardLayout>
  );
}
