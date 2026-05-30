"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  BookOpen,
  FileText,
  Video,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
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
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function ProgressSparkline({ values }: { values: number[] }) {
  if (!values.length) {
    return (
      <svg viewBox="0 0 80 32" className="h-8 w-20 text-white/30" aria-hidden>
        <line x1="0" y1="16" x2="80" y2="16" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>
    );
  }
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => {
      const x = values.length === 1 ? 40 : (i / (values.length - 1)) * 80;
      const y = 28 - (v / max) * 24;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 80 32" className="h-8 w-20" aria-hidden>
      <polyline fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function getMaterialIcon(type: string) {
  if (type === "video") return <Video className="h-4 w-4 text-blue-500" />;
  return <FileText className="h-4 w-4 text-rose-500" />;
}

function formatLessonDate(dateString: string, locale: string, t: (key: string) => string) {
  const date = new Date(dateString);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  const dayMonth = date.toLocaleDateString(locale, { day: "numeric", month: "short" }).toUpperCase();
  const weekday = isToday
    ? t("dashboardCommon.today")
    : date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
  return { dayMonth, weekday };
}

function formatTimeRange(start: string, durationMin: number, locale: string) {
  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + durationMin * 60 * 1000);
  const fmt = (d: Date) => d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

function formatRelativeTime(iso: string, locale: string) {
  const date = new Date(iso);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return locale.startsWith("de") ? "Gestern" : "Yesterday";
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

function SectionHeader({
  icon: Icon,
  title,
  href,
  linkLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D1B2A]/5">
          <Icon className="h-4 w-4 text-[#0D1B2A]" />
        </div>
        <h3 className="text-base font-bold text-[#0D1B2A]">{title}</h3>
      </div>
      {href && linkLabel && (
        <Link href={href} className="flex items-center gap-1 text-sm font-medium text-[#D4AF37] hover:underline">
          {linkLabel} <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

const STAT_ACCENTS = {
  gold: { icon: "bg-[#D4AF37]/10 text-[#D4AF37]", blob: "bg-[#D4AF37]" },
  blue: { icon: "bg-blue-500/10 text-blue-500", blob: "bg-blue-500" },
  green: { icon: "bg-emerald-500/10 text-emerald-500", blob: "bg-emerald-500" },
  violet: { icon: "bg-violet-500/10 text-violet-500", blob: "bg-violet-500" },
} as const;

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  href,
  linkLabel,
  accent,
  delay = 0,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  sub?: string;
  href?: string;
  linkLabel?: string;
  accent: keyof typeof STAT_ACCENTS;
  delay?: number;
  children?: React.ReactNode;
}) {
  const colors = STAT_ACCENTS[accent];
  return (
    <motion.div
      {...fadeUp}
      transition={{ delay }}
      className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className={cn("absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-[0.07]", colors.blob)} />
      <div className="relative">
        <div className="mb-4 flex items-start justify-between">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", colors.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <div className="mb-1 text-xl font-bold text-[#0D1B2A]">{value}</div>
        {sub && <p className="mb-3 text-xs text-gray-500">{sub}</p>}
        {children}
        {href && linkLabel && (
          <Link href={href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#D4AF37] hover:underline">
            {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function EmptyHint({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center">
      <Icon className="mb-2 h-8 w-8 text-gray-300" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
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

  const firstName = data ? getFirstName(data.profile.fullName) : "";
  const todayLabel = new Date().toLocaleDateString(dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (loading) {
    return (
      <StudentDashboardLayout title={t("studentDashboard.overviewTitle", { defaultValue: "Overview" })}>
        <LoadingBlock />
      </StudentDashboardLayout>
    );
  }

  if (!data) {
    return (
      <StudentDashboardLayout title={t("studentDashboard.overviewTitle", { defaultValue: "Overview" })}>
        <div className="mx-auto max-w-md rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <GraduationCap className="mx-auto mb-4 h-12 w-12 text-[#D4AF37]" />
          <p className="text-gray-600">{t("studentDashboard.signInRequired", { defaultValue: "Please sign in to view your dashboard." })}</p>
          <Button variant="gold" size="md" href="/login" className="mt-6">
            {t("common.login")}
          </Button>
        </div>
      </StudentDashboardLayout>
    );
  }

  const unitsTotal = data.units?.total ?? 0;
  const unitsRemaining = data.units?.remaining ?? 0;
  const unitsUsed = Math.max(0, unitsTotal - unitsRemaining);
  const unitsPercent = unitsTotal > 0 ? Math.round((unitsUsed / unitsTotal) * 100) : 0;

  return (
    <StudentDashboardLayout
      title={t("studentDashboard.overviewTitle", { defaultValue: "Overview" })}
      headerAction={
        data.nextLesson?.zoom_link ? (
          <a
            href={data.nextLesson.zoom_link}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-xl bg-[#2D8CFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1a7ae8] sm:inline-flex"
          >
            <Video className="h-4 w-4" />
            {t("dashboardCommon.joinZoom", { defaultValue: "Join Zoom" })}
          </a>
        ) : (
          <Button variant="gold" size="sm" href="/consultation" className="hidden sm:inline-flex">
            {t("studentDashboard.bookConsultation", { defaultValue: "Book a lesson" })}
          </Button>
        )
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero */}
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1B2A] via-[#112240] to-[#0D1B2A] p-6 text-white shadow-lg sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#D4AF37]/5 blur-2xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-sm font-medium text-[#D4AF37]">{todayLabel}</p>
              <h2 className="text-2xl font-bold sm:text-3xl">
                {t("studentDashboard.welcomeBack", { name: firstName, defaultValue: `Welcome back, ${firstName}!` })}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-gray-300 sm:text-base">
                {t("studentDashboard.welcomeSubtitle", { defaultValue: "Your learning hub — track progress, join lessons, and study smarter." })}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/chat"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] transition hover:bg-[#F5A623]"
                >
                  <Sparkles className="h-4 w-4" />
                  {t("studentDashboard.openAi", { defaultValue: "Open NextGrades AI" })}
                </Link>
                <Link
                  href="/dashboard/student/quizzes"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <ListChecks className="h-4 w-4" />
                  {t("studentDashboard.startQuiz", { defaultValue: "Start AI quiz" })}
                </Link>
                <Link
                  href="/dashboard/student/appointments"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <Calendar className="h-4 w-4" />
                  {t("studentDashboard.myAppointments", { defaultValue: "My appointments" })}
                </Link>
              </div>
            </div>

            {/* Goal card inside hero */}
            <div className="w-full shrink-0 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm lg:w-72">
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-[#D4AF37]" />
                <p className="text-xs font-semibold uppercase tracking-wide text-[#D4AF37]">
                  {t("studentDashboard.yourGoal", { defaultValue: "Your goal" })}
                </p>
              </div>
              <p className="mb-3 text-sm font-medium leading-relaxed text-white">
                {data.learningGoal || t("studentDashboard.noGoalSet", { defaultValue: "Set a learning goal to stay motivated." })}
              </p>
              <Link href="/dashboard/student/settings" className="text-sm font-semibold text-[#D4AF37] hover:underline">
                {t("studentDashboard.editGoal", { defaultValue: "Edit goal" })} →
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Zap}
            label={t("studentDashboard.remainingUnits", { defaultValue: "Lesson units" })}
            value={
              data.units
                ? t("studentDashboard.unitsOf", { remaining: unitsRemaining, total: unitsTotal, defaultValue: `${unitsRemaining} of ${unitsTotal}` })
                : "—"
            }
            sub={data.units ? undefined : t("studentDashboard.noUnits", { defaultValue: "No active package" })}
            href="/pricing"
            linkLabel={t("studentDashboard.manageUnits", { defaultValue: "Manage units" })}
            accent="gold"
            delay={0.05}
          >
            {data.units && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#D4AF37] transition-all" style={{ width: `${unitsPercent}%` }} />
              </div>
            )}
          </StatCard>

          <StatCard
            icon={Calendar}
            label={t("studentDashboard.nextAppointment", { defaultValue: "Next lesson" })}
            value={
              data.nextLesson
                ? formatLessonDate(data.nextLesson.start_time, dateLocale, t).weekday.split(",")[0]
                : t("studentDashboard.noAppointments", { defaultValue: "No upcoming lessons" })
            }
            sub={
              data.nextLesson
                ? `${formatTimeRange(data.nextLesson.start_time, data.nextLesson.duration, dateLocale)} · ${data.nextLesson.subject_name}`
                : undefined
            }
            href={data.nextLesson ? "/dashboard/student/appointments" : "/consultation"}
            linkLabel={
              data.nextLesson
                ? t("studentDashboard.goToAppointment", { defaultValue: "View details" })
                : t("studentDashboard.bookConsultation", { defaultValue: "Book a lesson" })
            }
            accent="blue"
            delay={0.1}
          />

          <StatCard
            icon={TrendingUp}
            label={t("studentDashboard.totalProgress", { defaultValue: "Overall progress" })}
            value={
              <span className="flex items-end gap-3">
                {data.overallProgress}%
                <ProgressSparkline values={data.progressSparkline} />
              </span>
            }
            sub={t("studentDashboard.progressHint", { defaultValue: "Based on quizzes and completed lessons" })}
            href="/dashboard/student/progress"
            linkLabel={t("studentDashboard.viewProgress", { defaultValue: "View progress" })}
            accent="green"
            delay={0.15}
          />

          <StatCard
            icon={ListChecks}
            label={t("studentDashboard.openTasks", { defaultValue: "Open tasks" })}
            value={
              data.openTaskCount === 0
                ? t("studentDashboard.noOpenTasks", { defaultValue: "All caught up!" })
                : t("studentDashboard.tasksWaiting", { count: data.openTaskCount, defaultValue: `${data.openTaskCount} waiting` })
            }
            href="/dashboard/student/quizzes"
            linkLabel={t("studentDashboard.goToTasks", { defaultValue: "Go to quizzes" })}
            accent="violet"
            delay={0.2}
          />
        </div>

        {/* Main grid: appointments + AI */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Appointments — wider */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-3"
          >
            <SectionHeader
              icon={Calendar}
              title={t("studentDashboard.upcomingAppointments", { defaultValue: "Upcoming appointments" })}
              href="/dashboard/student/appointments"
              linkLabel={t("studentDashboard.showAllAppointments", { defaultValue: "View all" })}
            />

            {data.lessons.length === 0 ? (
              <EmptyHint
                icon={Calendar}
                text={t("studentDashboard.noAppointments", { defaultValue: "No appointments scheduled yet." })}
              />
            ) : (
              <div className="space-y-3">
                {data.lessons.slice(0, 4).map((lesson, i) => {
                  const { dayMonth, weekday } = formatLessonDate(lesson.start_time, dateLocale, t);
                  const [day, month] = dayMonth.split(" ");
                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-[#FAFBFC] p-4 transition hover:border-[#D4AF37]/30 hover:shadow-sm sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-4 sm:flex-1">
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#0D1B2A] text-white">
                          <span className="text-xl font-bold leading-none">{day}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#D4AF37]">{month}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#0D1B2A]">{lesson.subject_name}</p>
                          <p className="text-sm text-gray-500">{weekday}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeRange(lesson.start_time, lesson.duration, dateLocale)}
                            </span>
                            {lesson.teacher_name && (
                              <span>
                                {t("studentDashboard.teacherShort", { name: lesson.teacher_name.split(" ")[0], defaultValue: `with ${lesson.teacher_name.split(" ")[0]}` })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
                        {lesson.zoom_link ? (
                          <a
                            href={lesson.zoom_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition",
                              i === 0 ? "bg-[#2D8CFF] hover:bg-[#1a7ae8]" : "bg-[#0D1B2A] hover:bg-[#1a3352]"
                            )}
                          >
                            <Video className="h-4 w-4" />
                            {t("dashboardCommon.joinZoom", { defaultValue: "Join Zoom" })}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">{t("studentDashboard.noZoomLink", { defaultValue: "No Zoom link yet" })}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* AI + notifications column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* AI Assistant promo */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.15 }}
              className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#FFF9E6] to-white p-6 shadow-sm"
            >
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#D4AF37]/10" />
              <div className="relative">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4AF37]/20">
                  <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-[#0D1B2A]">
                  {t("studentDashboard.aiTitle", { defaultValue: "NextGrades AI" })}
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {t("studentDashboard.aiDesc", { defaultValue: "Ask questions, get explanations, and translate content — your personal study assistant." })}
                </p>
                <Link
                  href="/dashboard/chat"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0D1B2A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a3352]"
                >
                  {t("studentDashboard.openAi", { defaultValue: "Open NextGrades AI" })}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.2 }}
              className="flex-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <SectionHeader
                icon={Bell}
                title={t("studentDashboard.notifications", { defaultValue: "Notifications" })}
              />
              {data.notifications.length === 0 ? (
                <EmptyHint
                  icon={Bell}
                  text={t("studentDashboard.noMessages", { defaultValue: "No new notifications." })}
                />
              ) : (
                <ul className="space-y-3">
                  {data.notifications.map((n) => (
                    <li
                      key={n.id}
                      className={cn(
                        "flex gap-3 rounded-xl p-3 transition",
                        n.is_read ? "bg-transparent" : "bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]/20"
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0D1B2A]/5">
                        <Bell className="h-3.5 w-3.5 text-[#0D1B2A]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm", n.is_read ? "text-gray-600" : "font-semibold text-[#0D1B2A]")}>
                          {n.title}
                        </p>
                        {n.message && <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{n.message}</p>}
                        <p className="mt-1 text-[10px] text-gray-400">{formatRelativeTime(n.created_at, dateLocale)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        </div>

        {/* Learning content row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Materials */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={FileText}
              title={t("studentDashboard.myMaterials", { defaultValue: "My materials" })}
              href="/dashboard/student/resources"
              linkLabel={t("studentDashboard.toMaterialLibrary", { defaultValue: "Library" })}
            />
            {data.materials.length === 0 ? (
              <EmptyHint icon={FileText} text={t("studentDashboard.noMaterials", { defaultValue: "No materials yet." })} />
            ) : (
              <ul className="mb-4 flex-1 space-y-2">
                {data.materials.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 rounded-xl border border-gray-50 bg-[#FAFBFC] p-3 transition hover:border-gray-200">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      {getMaterialIcon(m.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#0D1B2A]">{m.title}</p>
                      <p className="text-[11px] text-gray-400">
                        {m.type.toUpperCase()}
                        {m.file_size ? ` · ${formatBytes(m.file_size)}` : ""}
                      </p>
                    </div>
                    {m.url && (
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg p-2 text-[#D4AF37] hover:bg-[#D4AF37]/10" aria-label="Open">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Courses */}
          <motion.div {...fadeUp} transition={{ delay: 0.15 }} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={BookOpen}
              title={t("studentDashboard.myCourses", { defaultValue: "My courses" })}
              href="/dashboard/student/courses"
              linkLabel={t("studentDashboard.toMyCourses", { defaultValue: "All courses" })}
            />
            {data.courses.length === 0 ? (
              <EmptyHint icon={BookOpen} text={t("studentDashboard.noCourses", { defaultValue: "No enrolled courses yet." })} />
            ) : (
              <ul className="mb-4 flex-1 space-y-4">
                {data.courses.slice(0, 3).map((course) => (
                  <li key={course.enrollmentId}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-[#0D1B2A]">{course.subjectName}</span>
                      <span className="shrink-0 text-sm font-bold text-[#D4AF37]">{course.progressPercent}%</span>
                    </div>
                    {course.lessonCount > 0 && (
                      <p className="mb-2 text-xs text-gray-400">
                        {t("studentDashboard.lessonUnits", { count: course.lessonCount, defaultValue: `${course.lessonCount} lessons` })}
                        {course.teacherName
                          ? ` · ${t("studentDashboard.teacherShort", { name: course.teacherName.split(" ")[0], defaultValue: course.teacherName.split(" ")[0] })}`
                          : ""}
                      </p>
                    )}
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5A623]" style={{ width: `${course.progressPercent}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Tasks */}
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <SectionHeader
              icon={ListChecks}
              title={t("studentDashboard.tasks", { defaultValue: "Tasks & quizzes" })}
              href="/dashboard/student/quizzes"
              linkLabel={t("studentDashboard.allTasks", { defaultValue: "All tasks" })}
            />
            {data.tasks.length === 0 ? (
              <EmptyHint icon={CheckCircle2} text={t("studentDashboard.noTasks", { defaultValue: "No open tasks — great job!" })} />
            ) : (
              <ul className="mb-4 flex-1 space-y-2">
                {data.tasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-50 bg-[#FAFBFC] p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#0D1B2A]">{task.title}</p>
                      {task.topic && <p className="truncate text-xs text-gray-400">{task.topic}</p>}
                    </div>
                    <Badge variant={task.status === "in_progress" ? "success" : "warning"}>
                      {task.status === "in_progress"
                        ? t("studentDashboard.taskInProgress", { defaultValue: "In progress" })
                        : t("studentDashboard.taskOpen", { defaultValue: "Open" })}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>

        {/* Quick access */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <SectionHeader icon={Zap} title={t("studentDashboard.quickAccess", { defaultValue: "Quick access" })} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: data.nextLesson?.zoom_link ?? "/dashboard/student/appointments",
                external: !!data.nextLesson?.zoom_link,
                icon: Video,
                label: t("studentDashboard.joinZoom", { defaultValue: "Join Zoom" }),
                color: "text-[#2D8CFF]",
                bg: "bg-blue-50",
              },
              {
                href: "/dashboard/chat",
                icon: Sparkles,
                label: t("studentDashboard.openAi", { defaultValue: "NextGrades AI" }),
                color: "text-[#D4AF37]",
                bg: "bg-amber-50",
              },
              {
                href: "/help",
                icon: HelpCircle,
                label: t("studentDashboard.helpCenter", { defaultValue: "Help center" }),
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                href: "/contact",
                icon: MessageCircle,
                label: t("studentDashboard.contactSupport", { defaultValue: "Contact support" }),
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
            ].map((item) => {
              const inner = (
                <>
                  <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", item.bg)}>
                    <item.icon className={cn("h-5 w-5", item.color)} />
                  </div>
                  <span className="text-sm font-semibold text-[#0D1B2A]">{item.label}</span>
                </>
              );
              const className =
                "flex flex-col rounded-xl border border-gray-100 bg-[#FAFBFC] p-4 transition hover:border-[#D4AF37]/30 hover:shadow-sm";
              return item.external ? (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                  {inner}
                </a>
              ) : (
                <Link key={item.label} href={item.href} className={className}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </StudentDashboardLayout>
  );
}
