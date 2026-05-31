"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  BookOpen,
  FileText,
  Video,
  ArrowRight,
  Target,
  Zap,
  TrendingUp,
  ListChecks,
  Bell,
  HelpCircle,
  MessageCircle,
  Sparkles,
  Clock,
  GraduationCap,
  ChevronRight,
  Heart,
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
import {
  OverviewHero,
  OverviewStatCard,
  OverviewPanel,
  OverviewGoalCard,
} from "@/components/dashboard/overview/OverviewPrimitives";
import { SwipeableCardRow, SwipeableCard } from "@/components/mobile/SwipeableCardRow";
import { MobileAccordion } from "@/components/mobile/MobileAccordion";
import { mobile } from "@/lib/mobile/tokens";
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
      <polyline fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" points={points} />
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
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 md:gap-8">
        <OverviewHero
          eyebrow={t("studentDashboard.overviewTitle", { defaultValue: "Overview" })}
          title={t("studentDashboard.welcomeBack", { name: firstName })}
          subtitle={t("studentDashboard.welcomeSubtitleMock", {
            defaultValue: "Great to see you keep working toward your goals.",
          })}
          actions={[
            { href: "/dashboard/student/courses", label: t("studentDashboard.continueLearning", { subject: "", defaultValue: "Continue learning" }) },
            { href: "/dashboard/chat", label: t("studentDashboard.openAi"), icon: Sparkles },
            { href: "/dashboard/student/appointments", label: t("studentDashboard.myAppointments"), icon: Calendar },
          ]}
          aside={
            <OverviewGoalCard
              label={t("studentDashboard.yourGoal")}
              value={data.learningGoal || t("studentDashboard.noGoalSet")}
              actionHref="/dashboard/student/settings"
              actionLabel={t("studentDashboard.editGoal")}
            />
          }
        />

        {/* Stats — swipeable on mobile */}
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
                iconClassName="text-[#D4AF37] bg-[#FFF9E6] ring-[#D4AF37]/20"
                footer={
                  data.units ? (
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-[#D4AF37]" style={{ width: `${unitsPercent}%` }} />
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
                iconClassName="text-blue-600 bg-blue-50 ring-blue-100"
                footer={
                  data.nextLesson ? (
                    <p className="text-xs text-gray-500">
                      {formatTimeRange(data.nextLesson.start_time, data.nextLesson.duration, dateLocale)} ·{" "}
                      {data.nextLesson.subject_name}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">{t("studentDashboard.noAppointments")}</p>
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
                iconClassName="text-emerald-600 bg-emerald-50 ring-emerald-100"
                footer={
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-500">{t("studentDashboard.progressKeepGoing", { defaultValue: "Keep it up!" })}</p>
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
                iconClassName="text-violet-600 bg-violet-50 ring-violet-100"
                footer={
                  <p className="text-xs text-gray-500">
                    {data.openTaskCount === 0
                      ? t("studentDashboard.noOpenTasks")
                      : t("studentDashboard.tasksWaitingDesc", { defaultValue: "Tasks waiting for you" })}
                  </p>
                }
              />
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
                    {(lesson.zoom_meeting_id || lesson.zoom_link) ? (
                      <ZoomMeetingButton
                        lessonId={lesson.id}
                        mode="join"
                        className={cn(mobile.button, "flex w-full justify-center")}
                      />
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

        <OverviewPanel
          className="hidden md:block"
          title={t("studentDashboard.upcomingAppointments")}
          icon={Calendar}
          href="/dashboard/student/appointments"
          linkLabel={t("studentDashboard.showAllAppointments")}
          noPadding
        >
          {data.lessons.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-500">{t("studentDashboard.noAppointments")}</p>
          ) : (
            <ul className="space-y-2 p-3">
              {data.lessons.slice(0, 3).map((lesson) => {
                const parts = lessonDateParts(lesson.start_time, dateLocale, todayLabel);
                return (
                  <li
                    key={lesson.id}
                    className={cn(
                      "flex flex-col gap-4 rounded-xl border p-4 transition hover:border-[#D4AF37]/25 hover:shadow-sm sm:flex-row sm:items-center",
                      parts.isToday ? "border-[#D4AF37]/30 bg-gradient-to-r from-[#FFF9E6]/60 to-white" : "border-gray-100 bg-gray-50/40"
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div
                        className={cn(
                          "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border text-center",
                          parts.isToday ? "border-[#D4AF37]/40 bg-[#FFF9E6]" : "border-gray-100 bg-white"
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
                    <div className="flex shrink-0 items-center gap-2 pl-[4.5rem] sm:pl-0">
                      {(lesson.zoom_meeting_id || lesson.zoom_link) ? (
                        <ZoomMeetingButton lessonId={lesson.id} mode="join" size="sm" />
                      ) : (
                        <span className="text-xs text-gray-400">{t("studentDashboard.noZoomLink")}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </OverviewPanel>

        {/* Explore — mobile accordion links */}
        <MobileAccordion
          className="md:hidden"
          items={[
            {
              id: "ai",
              icon: <Sparkles className="h-5 w-5" />,
              title: t("studentDashboard.aiTitle"),
              summary: t("studentDashboard.aiDesc"),
              content: (
                <Link
                  href="/dashboard/chat"
                  className={cn(mobile.button, "flex w-full items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#F5A623] text-[#0D1B2A]")}
                >
                  {t("studentDashboard.openAi")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ),
            },
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
        <section className="hidden gap-5 md:grid lg:grid-cols-3">
          <OverviewPanel title={t("studentDashboard.myMaterials")} icon={FileText} href="/dashboard/student/resources" linkLabel={t("studentDashboard.toMaterialLibraryBtn", { defaultValue: "Library" })} noPadding>
            {data.materials.length === 0 ? (
              <p className="flex-1 px-5 py-10 text-center text-sm text-gray-500">{t("studentDashboard.noMaterials")}</p>
            ) : (
              <ul className="space-y-1 p-3">
                {data.materials.slice(0, 4).map((m) => (
                  <li key={m.id} className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-gray-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100">
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
          </OverviewPanel>

          <OverviewPanel title={t("studentDashboard.myCourses")} icon={BookOpen} href="/dashboard/student/courses" linkLabel={t("studentDashboard.toMyCourses")} noPadding>
            {data.courses.length === 0 ? (
              <p className="flex-1 px-5 py-10 text-center text-sm text-gray-500">{t("studentDashboard.noCourses")}</p>
            ) : (
              <ul className="space-y-3 p-4">
                {data.courses.slice(0, 3).map((course) => (
                  <li key={course.enrollmentId} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-[#0D1B2A]">{course.subjectName}</span>
                      <span className="text-sm font-bold text-[#D4AF37]">{course.progressPercent}%</span>
                    </div>
                    {course.teacherName && <p className="mb-2 text-xs text-gray-400">{course.teacherName}</p>}
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5A623]" style={{ width: `${course.progressPercent}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </OverviewPanel>

          <OverviewPanel title={t("studentDashboard.tasks")} icon={ListChecks} href="/dashboard/student/quizzes" linkLabel={t("studentDashboard.allTasks")} noPadding>
            {data.tasks.length === 0 ? (
              <p className="flex-1 px-5 py-10 text-center text-sm text-gray-500">{t("studentDashboard.noTasks")}</p>
            ) : (
              <ul className="space-y-1 p-3">
                {data.tasks.slice(0, 4).map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition hover:bg-gray-50">
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
          </OverviewPanel>
        </section>

        {/* Notifications + Quick access */}
        <section className="grid gap-5 lg:grid-cols-2">
          <OverviewPanel
            title={t("studentDashboard.nav.notifications")}
            icon={Bell}
            href="/dashboard/notifications"
            linkLabel={t("studentDashboard.showAll", { defaultValue: "Show all" })}
            noPadding
          >
            {data.notifications.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-gray-500">{t("studentDashboard.noMessages")}</p>
            ) : (
              <ul className="space-y-1 p-3">
                {data.notifications.map((n) => (
                  <li key={n.id}>
                    <Link
                      href="/dashboard/notifications"
                      className={cn(
                        "flex gap-3 rounded-xl px-3 py-3 transition hover:bg-gray-50",
                        !n.is_read && "bg-[#FFF9E6]/50"
                      )}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10">
                        <Bell className="h-4 w-4 text-[#D4AF37]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm", !n.is_read && "font-semibold text-[#0D1B2A]")}>{n.title}</p>
                        {n.message && <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{n.message}</p>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </OverviewPanel>

          <OverviewPanel title={t("studentDashboard.quickAccess")} icon={Zap} noPadding>
            <ul className="divide-y divide-gray-50">
              {[
                { href: "/dashboard/chat", icon: Sparkles, label: t("studentDashboard.openAi") },
                { href: "/dashboard/student/appointments", icon: Video, label: t("studentDashboard.joinZoom") },
                { href: "/help", icon: HelpCircle, label: t("studentDashboard.helpCenter") },
                { href: "/contact", icon: MessageCircle, label: t("studentDashboard.contactSupport") },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-5 py-4 text-sm font-medium text-[#0D1B2A] transition hover:bg-gray-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/10">
                      <item.icon className="h-4 w-4 text-[#D4AF37]" />
                    </span>
                    {item.label}
                    <ArrowRight className="ml-auto h-4 w-4 text-gray-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </OverviewPanel>
        </section>

        {/* Motivation quote */}
        <section className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#FFF9E6] via-white to-[#FFF9E6] p-6 shadow-sm sm:p-8">
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
