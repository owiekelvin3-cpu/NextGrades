"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  BookOpen,
  FileText,
  Video,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Target,
  Zap,
  TrendingUp,
  ListChecks,
  Bell,
  HelpCircle,
  MessageCircle,
  Clock,
  GraduationCap,
  ChevronRight,
  Heart,
  MoreHorizontal,
  User,
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
import { studentPanel, formatTimeRange, lessonDateParts } from "./student-ui";
import { SwipeableCardRow, SwipeableCard } from "@/components/mobile/SwipeableCardRow";
import { MobileAccordion } from "@/components/mobile/MobileAccordion";
import { mobile } from "@/lib/mobile/tokens";
import { cn } from "@/lib/utils";

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
      <polyline fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" points={points} />
    </svg>
  );
}

function PanelLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-0.5 text-xs font-medium text-[#D4AF37] hover:underline">
      {label}
      <ChevronRight className="h-3.5 w-3.5" />
    </Link>
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
        <div className={`${studentPanel()} mx-auto max-w-md p-10 text-center`}>
          <GraduationCap className="mx-auto mb-4 h-12 w-12 text-[#D4AF37]" />
          <p className="text-gray-600">{t("studentDashboard.signInRequired")}</p>
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

  return (
    <StudentDashboardLayout title={title}>
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 md:gap-6">
        {/* Welcome hero — mobile */}
        <section className={cn(mobile.card, mobile.cardPad, "md:hidden")}>
          <span className={mobile.pill}>
            <GraduationCap className="h-3.5 w-3.5" />
            {t("studentDashboard.overviewTitle", { defaultValue: "Dashboard" })}
          </span>
          <h2 className="mt-4 text-2xl font-bold leading-tight text-foreground">
            {t("studentDashboard.welcomeBack", { name: firstName })}
          </h2>
          <p className={cn(mobile.caption, "mt-3")}>
            {t("studentDashboard.welcomeSubtitleMock", {
              defaultValue: "Great to see you keep working toward your goals.",
            })}
          </p>
          <Link
            href="/dashboard/student/courses"
            className={cn(
              mobile.button,
              "mt-6 flex w-full items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#F5A623] text-[#0D1B2A]"
            )}
          >
            {t("studentDashboard.continueLearning", { subject: "", defaultValue: "Continue learning" })}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </section>

        {/* Welcome + goal — desktop */}
        <section className={cn(`${studentPanel()} p-6 sm:p-8`, "hidden md:block")}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#0D1B2A] sm:text-3xl">
                {t("studentDashboard.welcomeBack", { name: firstName })}
              </h2>
              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                {t("studentDashboard.welcomeSubtitleMock", {
                  defaultValue: "Great to see you keep working toward your goals.",
                })}
              </p>
            </div>
            <div className="w-full shrink-0 rounded-2xl border border-gray-100 bg-[#FAFBFC] p-5 lg:w-80">
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-[#D4AF37]" />
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t("studentDashboard.yourGoal")}
                </p>
              </div>
              <p className="mb-4 text-sm font-medium leading-relaxed text-[#0D1B2A]">
                {data.learningGoal || t("studentDashboard.noGoalSet")}
              </p>
              <Link
                href="/dashboard/student/settings"
                className="inline-flex items-center justify-center rounded-xl border border-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/5"
              >
                {t("studentDashboard.editGoal")}
              </Link>
            </div>
          </div>
        </section>

        {/* Stats — swipeable on mobile */}
        <section>
          <SwipeableCardRow desktopCols={4}>
            <SwipeableCard>
              <div className={`${studentPanel()} h-full p-5`}>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {t("studentDashboard.remainingUnits")}
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {data.units
                    ? t("studentDashboard.unitsOf", { remaining: unitsRemaining, total: unitsTotal })
                    : "—"}
                </p>
                {data.units && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-subtle">
                    <div className="h-full rounded-full bg-[#D4AF37]" style={{ width: `${unitsPercent}%` }} />
                  </div>
                )}
                <Link href="/pricing" className="mt-4 inline-flex min-h-10 items-center text-xs font-medium text-[#D4AF37]">
                  {t("studentDashboard.manageUnitsPackage", { defaultValue: "Manage unit package" })}
                </Link>
              </div>
            </SwipeableCard>

            <SwipeableCard>
              <div className={`${studentPanel()} h-full p-5`}>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {t("studentDashboard.nextAppointment")}
                </p>
                {data.nextLesson ? (
                  <>
                    <p className="mt-2 text-lg font-bold text-foreground">
                      {new Date(data.nextLesson.start_time).toLocaleDateString(dateLocale, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      {formatTimeRange(data.nextLesson.start_time, data.nextLesson.duration, dateLocale)} ·{" "}
                      {data.nextLesson.subject_name}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-text-muted">{t("studentDashboard.noAppointments")}</p>
                )}
                <Link href="/dashboard/student/appointments" className="mt-4 inline-flex min-h-10 items-center text-xs font-medium text-[#D4AF37]">
                  {t("studentDashboard.goToAppointmentBtn", { defaultValue: "Go to appointment" })}
                </Link>
              </div>
            </SwipeableCard>

            <SwipeableCard>
              <div className={`${studentPanel()} h-full p-5`}>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {t("studentDashboard.totalProgress")}
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-2xl font-bold text-foreground">{data.overallProgress}%</span>
                  <ProgressSparkline values={data.progressSparkline} />
                </div>
                <p className="mt-1 text-sm text-text-muted">{t("studentDashboard.progressKeepGoing", { defaultValue: "Keep it up!" })}</p>
                <Link href="/dashboard/student/progress" className="mt-4 inline-flex min-h-10 items-center text-xs font-medium text-[#D4AF37]">
                  {t("studentDashboard.viewProgress")}
                </Link>
              </div>
            </SwipeableCard>

            <SwipeableCard>
              <div className={`${studentPanel()} h-full p-5`}>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  {t("studentDashboard.openTasks")}
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {data.openTaskCount === 0 ? "0" : data.openTaskCount}
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  {data.openTaskCount === 0
                    ? t("studentDashboard.noOpenTasks")
                    : t("studentDashboard.tasksWaitingDesc", { defaultValue: "Tasks waiting for you" })}
                </p>
                <Link href="/dashboard/student/quizzes" className="mt-4 inline-flex min-h-10 items-center text-xs font-medium text-[#D4AF37]">
                  {t("studentDashboard.goToTasksBtn", { defaultValue: "Go to tasks" })}
                </Link>
              </div>
            </SwipeableCard>
          </SwipeableCardRow>
        </section>

        {/* Appointments — accordion on mobile */}
        {data.lessons.length > 0 && (
          <MobileAccordion
            defaultOpenId={data.lessons[0]?.id}
            items={data.lessons.slice(0, 3).map((lesson) => {
              const parts = lessonDateParts(lesson.start_time, dateLocale, todayLabel);
              return {
                id: lesson.id,
                icon: <Calendar className="h-5 w-5" />,
                title: lesson.subject_name || t("studentDashboard.lessonTopic", { defaultValue: "Lesson" }),
                summary: `${parts.weekday} · ${formatTimeRange(lesson.start_time, lesson.duration, dateLocale)}`,
                content: (
                  <div className="space-y-4">
                    {lesson.teacher_name && (
                      <p className="flex items-center gap-2 text-sm text-text-muted">
                        <User className="h-4 w-4" />
                        {lesson.teacher_name}
                      </p>
                    )}
                    {lesson.zoom_link ? (
                      <a
                        href={lesson.zoom_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          mobile.button,
                          "flex w-full items-center justify-center gap-2 bg-[#2D8CFF] text-white"
                        )}
                      >
                        <Video className="h-5 w-5" />
                        {t("studentDashboard.joinZoomMeeting", { defaultValue: "Join meeting" })}
                      </a>
                    ) : (
                      <p className="text-sm text-text-muted">{t("studentDashboard.noZoomLink")}</p>
                    )}
                    <Link
                      href="/dashboard/student/appointments"
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#D4AF37]"
                    >
                      {t("studentDashboard.showAllAppointments")}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ),
              };
            })}
          />
        )}

        <section className={cn(studentPanel(), "hidden md:block")}>
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-[#0D1B2A]">{t("studentDashboard.upcomingAppointments")}</h2>
            <PanelLink href="/dashboard/student/appointments" label={t("studentDashboard.showAllAppointments")} />
          </div>
          <div className="divide-y divide-gray-50 p-2">
            {data.lessons.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-gray-500">{t("studentDashboard.noAppointments")}</p>
            ) : (
              data.lessons.slice(0, 3).map((lesson, i) => {
                const parts = lessonDateParts(lesson.start_time, dateLocale, todayLabel);
                return (
                  <div key={lesson.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div
                        className={cn(
                          "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border text-center",
                          parts.isToday ? "border-[#D4AF37]/40 bg-[#FFF9E6]" : "border-gray-100 bg-[#FAFBFC]"
                        )}
                      >
                        <span className="text-xl font-bold leading-none text-[#0D1B2A]">{parts.day}</span>
                        <span className="text-[10px] font-bold uppercase text-[#D4AF37]">{parts.month}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0D1B2A]">
                          {lesson.subject_name}
                          {lesson.subject_name ? " — " : ""}
                          {t("studentDashboard.lessonTopic", { defaultValue: "Lesson" })}
                        </p>
                        <p className="text-sm text-gray-500">{parts.weekday}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-400">
                          {lesson.teacher_name && (
                            <span className="inline-flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {lesson.teacher_name}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeRange(lesson.start_time, lesson.duration, dateLocale)} ({lesson.duration}{" "}
                            {t("studentDashboard.minShort", { defaultValue: "min" })})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {lesson.zoom_link ? (
                        <a
                          href={lesson.zoom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#2D8CFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a7ae8]"
                        >
                          <Video className="h-4 w-4" />
                          {t("studentDashboard.joinZoomMeeting", { defaultValue: "Join Zoom meeting" })}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">{t("studentDashboard.noZoomLink")}</span>
                      )}
                      <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-gray-50" aria-label="More">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="border-t border-gray-100 px-5 py-3">
            <button type="button" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0D1B2A]">
              <Calendar className="h-4 w-4" />
              {t("studentDashboard.syncCalendar")}
            </button>
          </div>
        </section>

        {/* Explore — mobile accordion links */}
        <MobileAccordion
          className="md:hidden"
          items={[
            {
              id: "materials",
              icon: <FileText className="h-5 w-5" />,
              title: t("studentDashboard.myMaterials"),
              summary:
                data.materials.length > 0
                  ? `${data.materials.length} ${t("studentDashboard.tabAllMaterials", { defaultValue: "materials" })}`
                  : t("studentDashboard.noMaterials"),
              content: (
                <Link
                  href="/dashboard/student/resources"
                  className={cn(mobile.buttonOutline, "flex w-full items-center justify-center gap-2 text-foreground")}
                >
                  {t("studentDashboard.viewAllMaterials", { defaultValue: "View all materials" })}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ),
            },
            {
              id: "courses",
              icon: <BookOpen className="h-5 w-5" />,
              title: t("studentDashboard.myCourses"),
              summary: t("studentDashboard.coursesDesc", { defaultValue: "Track your learning progress" }),
              content: (
                <Link
                  href="/dashboard/student/courses"
                  className={cn(mobile.buttonOutline, "flex w-full items-center justify-center gap-2 text-foreground")}
                >
                  {t("mobileNav.courses")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ),
            },
            {
              id: "tasks",
              icon: <ListChecks className="h-5 w-5" />,
              title: t("studentDashboard.openTasks"),
              summary: `${data.openTaskCount} ${t("studentDashboard.tasksWaitingDesc", { defaultValue: "waiting" })}`,
              content: (
                <Link
                  href="/dashboard/student/quizzes"
                  className={cn(mobile.buttonOutline, "flex w-full items-center justify-center gap-2 text-foreground")}
                >
                  {t("studentDashboard.goToTasksBtn", { defaultValue: "Go to tasks" })}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ),
            },
          ]}
        />

        {/* Materials / Courses / Tasks — desktop */}
        <section className="hidden gap-6 md:grid lg:grid-cols-3">
          <div className={studentPanel("flex flex-col")}>
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-[#0D1B2A]">{t("studentDashboard.myMaterials")}</h2>
            </div>
            {data.materials.length === 0 ? (
              <p className="flex-1 px-5 py-8 text-center text-sm text-gray-500">{t("studentDashboard.noMaterials")}</p>
            ) : (
              <ul className="flex-1 divide-y divide-gray-50 px-2">
                {data.materials.slice(0, 4).map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-3 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                      <FileText className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#0D1B2A]">{m.title}</p>
                      <p className="text-xs text-gray-400">
                        {m.type.toUpperCase()}
                        {m.file_size ? ` · ${formatBytes(m.file_size)}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-gray-100 px-5 py-3">
              <Link href="/dashboard/student/resources" className="text-sm font-medium text-[#D4AF37] hover:underline">
                {t("studentDashboard.toMaterialLibraryBtn", { defaultValue: "Go to material library" })}
              </Link>
            </div>
          </div>

          <div className={studentPanel("flex flex-col")}>
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-[#0D1B2A]">{t("studentDashboard.myCourses")}</h2>
            </div>
            {data.courses.length === 0 ? (
              <p className="flex-1 px-5 py-8 text-center text-sm text-gray-500">{t("studentDashboard.noCourses")}</p>
            ) : (
              <ul className="flex-1 space-y-4 px-5 py-4">
                {data.courses.slice(0, 3).map((course) => (
                  <li key={course.enrollmentId}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-[#0D1B2A]">{course.subjectName}</span>
                      <span className="text-sm font-bold text-[#D4AF37]">{course.progressPercent}%</span>
                    </div>
                    {course.teacherName && (
                      <p className="mb-2 text-xs text-gray-400">{course.teacherName}</p>
                    )}
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-[#D4AF37]" style={{ width: `${course.progressPercent}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-gray-100 px-5 py-3">
              <Link href="/dashboard/student/courses" className="text-sm font-medium text-[#D4AF37] hover:underline">
                {t("studentDashboard.toMyCourses")}
              </Link>
            </div>
          </div>

          <div className={studentPanel("flex flex-col")}>
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-[#0D1B2A]">{t("studentDashboard.tasks")}</h2>
            </div>
            {data.tasks.length === 0 ? (
              <p className="flex-1 px-5 py-8 text-center text-sm text-gray-500">{t("studentDashboard.noTasks")}</p>
            ) : (
              <ul className="flex-1 divide-y divide-gray-50 px-2">
                {data.tasks.slice(0, 4).map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 px-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#0D1B2A]">{task.title}</p>
                      {task.dueLabel && (
                        <p className="text-xs text-gray-400">
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
            <div className="border-t border-gray-100 px-5 py-3">
              <Link href="/dashboard/student/quizzes" className="text-sm font-medium text-[#D4AF37] hover:underline">
                {t("studentDashboard.allTasks")}
              </Link>
            </div>
          </div>
        </section>

        {/* Messages + Quick access */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className={studentPanel()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-[#0D1B2A]">{t("studentDashboard.nav.messages")}</h2>
              <PanelLink href="/dashboard/notifications" label={t("studentDashboard.showAll", { defaultValue: "Show all" })} />
            </div>
            {data.notifications.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-500">{t("studentDashboard.noMessages")}</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.notifications.map((n) => (
                  <li key={n.id} className="flex gap-3 px-5 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/10">
                      <Bell className="h-4 w-4 text-[#D4AF37]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm", !n.is_read && "font-semibold text-[#0D1B2A]")}>{n.title}</p>
                      {n.message && <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{n.message}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={studentPanel()}>
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-[#0D1B2A]">{t("studentDashboard.quickAccess")}</h2>
            </div>
            <ul className="divide-y divide-gray-50">
              {[
                {
                  href: data.nextLesson?.zoom_link ?? "/dashboard/student/appointments",
                  external: !!data.nextLesson?.zoom_link,
                  icon: Video,
                  label: t("studentDashboard.joinZoom"),
                },
                { href: "/help", icon: HelpCircle, label: t("studentDashboard.helpCenter") },
                { href: "/contact", icon: MessageCircle, label: t("studentDashboard.contactSupport") },
                { href: "/contact", icon: MessageCircle, label: t("studentDashboard.giveFeedback") },
              ].map((item) => {
                const inner = (
                  <span className="flex items-center gap-3 px-5 py-4 text-sm font-medium text-[#0D1B2A] transition hover:bg-gray-50">
                    <item.icon className="h-4 w-4 text-[#D4AF37]" />
                    {item.label}
                    <ArrowRight className="ml-auto h-4 w-4 text-gray-300" />
                  </span>
                );
                return (
                  <li key={item.label}>
                    {item.external ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer">
                        {inner}
                      </a>
                    ) : (
                      <Link href={item.href}>{inner}</Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Motivation quote */}
        <section className="rounded-2xl border border-[#D4AF37]/20 bg-[#FFF9E6] p-6 sm:p-8">
          <blockquote className="text-center text-sm italic text-[#0D1B2A] sm:text-base">
            {t("studentDashboard.motivationQuoteFull", {
              defaultValue:
                "„The only way to do great work is to love what you do.“ — Steve Jobs",
            })}
          </blockquote>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => toast.success(t("studentDashboard.motivationSaved"))}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              <Heart className="h-4 w-4" />
              {t("studentDashboard.saveMotivation")}
            </button>
          </div>
        </section>
      </div>
    </StudentDashboardLayout>
  );
}
