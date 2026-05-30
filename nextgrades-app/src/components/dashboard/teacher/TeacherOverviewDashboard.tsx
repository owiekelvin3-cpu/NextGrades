"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Video,
  MoreVertical,
  Plus,
  Users,
  Euro,
  Trophy,
  ArrowRight,
  Sparkles,
  Bell,
  ListChecks,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import {
  fetchTeacherOverviewData,
  getTeacherFirstName,
  type TeacherOverviewData,
} from "@/lib/dashboard/teacher-overview";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";

function card(extra = "") {
  return `rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${extra}`;
}

function formatEuro(amount: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
}

function formatLessonDate(iso: string, locale: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString(locale, { day: "numeric" }),
    month: d.toLocaleDateString(locale, { month: "short" }).toUpperCase(),
    weekday: d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }),
  };
}

function formatTimeRange(start: string, durationMin: number, locale: string) {
  const s = new Date(start);
  const e = new Date(s.getTime() + durationMin * 60 * 1000);
  const fmt = (d: Date) => d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return `${fmt(s)} – ${fmt(e)}`;
}

function formatRelativeTime(iso: string, locale: string) {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return locale.startsWith("de") ? "Gestern" : "Yesterday";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

const AVATAR_COLORS = ["#D4AF37", "#4DA3FF", "#22C55E", "#A855F7", "#F97316"];

export function TeacherOverviewDashboard() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeacherOverviewData | null>(null);

  useEffect(() => {
    fetchTeacherOverviewData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const displayName = data ? getTeacherFirstName(data.profile.fullName) : "";
  const todayLabel = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.overviewTitle")}>
        <LoadingBlock />
      </TeacherDashboardLayout>
    );
  }

  if (!data) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.overviewTitle")}>
        <div className={card() + " text-center"}>
          <p className="text-gray-600">{t("teacherDashboard.signInRequired")}</p>
          <Button variant="gold" href="/login" className="mt-4">
            {t("common.login")}
          </Button>
        </div>
      </TeacherDashboardLayout>
    );
  }

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.overviewTitle")}
      headerAction={
        <Button variant="gold" size="md" href="/dashboard/teacher/schedule">
          <Plus className="mr-2 h-4 w-4" />
          {t("teacherDashboard.createAppointment")}
        </Button>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1B2A] via-[#112240] to-[#0D1B2A] p-6 text-white shadow-lg sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-[#D4AF37]">{todayLabel}</p>
              <h2 className="text-2xl font-bold sm:text-3xl">
                {t("teacherDashboard.welcomeBack", { name: displayName, defaultValue: `Welcome back, ${displayName}!` })}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-gray-300 sm:text-base">
                {t("teacherDashboard.welcomeSubtitle", { defaultValue: "Manage lessons, students, and earnings from one place." })}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/teacher/schedule"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#0D1B2A] transition hover:bg-[#F5A623]"
                >
                  <Plus className="h-4 w-4" />
                  {t("teacherDashboard.createAppointment", { defaultValue: "New appointment" })}
                </Link>
                <Link
                  href="/dashboard/teacher/ai-generator"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <ListChecks className="h-4 w-4" />
                  {t("teacherDashboard.aiGenerator", { defaultValue: "AI generator" })}
                </Link>
                <Link
                  href="/dashboard/chat"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <Sparkles className="h-4 w-4" />
                  {t("teacherDashboard.openAi", { defaultValue: "NextGrades AI" })}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 lg:w-72">
              {[
                { label: t("teacherDashboard.lessonsToday", { defaultValue: "Today" }), value: String(data.stats.hoursToday), sub: "h" },
                { label: t("teacherDashboard.assignedStudents", { defaultValue: "Students" }), value: String(data.stats.totalStudents), sub: "" },
                { label: t("teacherDashboard.hoursThisWeek", { defaultValue: "This week" }), value: String(data.stats.weekPlanned), sub: "h" },
                { label: t("teacherDashboard.earningsMonth", { defaultValue: "Earnings" }), value: formatEuro(data.stats.earningsMonth), sub: "" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{stat.label}</p>
                  <p className="mt-0.5 text-lg font-bold text-white">
                    {stat.value}
                    {stat.sub && <span className="text-sm font-normal text-gray-400">{stat.sub}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={card()}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#D4AF37]">
              {t("teacherDashboard.todayLabel")}, {todayLabel.split(",").slice(1).join(",").trim() || todayLabel}
            </p>
            <p className="mb-2 text-2xl font-bold text-[#0D1B2A]">
              {t("teacherDashboard.hoursToday", { count: data.stats.hoursToday })}
            </p>
            <div className="mb-4 flex gap-4 text-sm text-gray-600">
              <span>{data.stats.todayUpcoming} {t("teacherDashboard.upcomingShort")}</span>
              <span>{data.stats.todayCompleted} {t("teacherDashboard.completedShort")}</span>
            </div>
            <Link href="/dashboard/teacher/schedule" className="text-sm font-medium text-[#D4AF37] hover:underline">
              {t("teacherDashboard.goToCalendar")} →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={card()}
          >
            <p className="mb-1 text-sm font-semibold text-[#0D1B2A]">{t("teacherDashboard.thisWeek")}</p>
            <p className="mb-2 text-2xl font-bold text-[#0D1B2A]">
              {t("teacherDashboard.plannedHours", { count: data.stats.weekPlanned })}
            </p>
            <div className="mb-4 flex gap-4 text-sm text-gray-600">
              <span>{data.stats.weekCompleted} {t("teacherDashboard.completedShort")}</span>
              <span>{data.stats.weekPending} {t("teacherDashboard.pendingShort")}</span>
            </div>
            <Link href="/dashboard/teacher/schedule" className="text-sm font-medium text-[#D4AF37] hover:underline">
              {t("teacherDashboard.myAppointments")} →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={card()}
          >
            <p className="mb-1 text-sm font-semibold text-[#0D1B2A]">{t("teacherDashboard.earningsMonth")}</p>
            <p className="mb-2 text-2xl font-bold text-[#0D1B2A]">{formatEuro(data.stats.earningsMonth)}</p>
            <p className="mb-1 text-xs text-gray-500">
              {t("teacherDashboard.gross")}: {formatEuro(data.stats.earningsGross)}
            </p>
            <p className="mb-4 text-xs text-gray-500">
              {t("teacherDashboard.pending")}: {formatEuro(data.stats.earningsPending)}
            </p>
            <Link href="/dashboard/teacher/earnings" className="text-sm font-medium text-[#D4AF37] hover:underline">
              {t("teacherDashboard.viewPayments")} →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={card()}
          >
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#0D1B2A]">
              <Trophy className="h-4 w-4 text-[#D4AF37]" />
              {t("teacherDashboard.nextJumpBonus")}
            </p>
            <p className="mb-2 text-2xl font-bold text-[#0D1B2A]">
              {formatEuro(data.stats.bonusCurrent)} {t("teacherDashboard.currentBonus")}
            </p>
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#22C55E] transition-all"
                style={{ width: `${data.stats.bonusProgress}%` }}
              />
            </div>
            <p className="mb-4 text-xs text-gray-500">
              {formatEuro(data.stats.bonusNextGoal)} {t("teacherDashboard.nextGoal")}
            </p>
            <Link href="/dashboard/teacher/earnings" className="text-sm font-medium text-[#D4AF37] hover:underline">
              {t("teacherDashboard.learnMore")} →
            </Link>
          </motion.div>
        </div>

        {/* Upcoming lessons + students */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className={card()}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0D1B2A]">{t("teacherDashboard.upcomingLessons")}</h3>
              <Link href="/dashboard/teacher/schedule" className="text-sm font-medium text-[#D4AF37] hover:underline">
                {t("teacherDashboard.allAppointments")} →
              </Link>
            </div>

            {data.upcomingLessons.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">{t("teacherDashboard.noAppointments")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                      <th className="pb-3 pr-4">{t("teacherDashboard.colDate")}</th>
                      <th className="pb-3 pr-4">{t("teacherDashboard.colSubject")}</th>
                      <th className="pb-3 pr-4">{t("teacherDashboard.colStudent")}</th>
                      <th className="pb-3 pr-4">{t("teacherDashboard.colTime")}</th>
                      <th className="pb-3 pr-4">{t("teacherDashboard.colStatus")}</th>
                      <th className="pb-3">{t("teacherDashboard.colAction")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingLessons.map((lesson) => {
                      const { day, month } = formatLessonDate(lesson.start_time, locale);
                      return (
                        <tr key={lesson.id} className="border-b border-gray-50">
                          <td className="py-4 pr-4">
                            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-[#0D1B2A] text-white">
                              <span className="text-sm font-bold leading-none">{day}</span>
                              <span className="text-[10px] uppercase opacity-80">{month}</span>
                            </div>
                          </td>
                          <td className="py-4 pr-4 font-medium text-[#0D1B2A]">
                            {lesson.subject_name}
                            {lesson.notes ? ` – ${lesson.notes}` : ""}
                          </td>
                          <td className="py-4 pr-4 text-gray-600">{lesson.student_name || "—"}</td>
                          <td className="py-4 pr-4 text-gray-600">
                            <p>{formatTimeRange(lesson.start_time, lesson.duration, locale)}</p>
                            <p className="text-xs text-gray-400">
                              {lesson.duration} {t("dashboardCommon.minutes")}
                            </p>
                          </td>
                          <td className="py-4 pr-4">
                            <Badge variant="success">{t("teacherDashboard.statusBooked")}</Badge>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {lesson.zoom_link ? (
                                <a
                                  href={lesson.zoom_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2D8CFF] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1a7ae8]"
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  {t("teacherDashboard.startLesson")}
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400">{t("teacherDashboard.noZoom")}</span>
                              )}
                              <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-100" aria-label="More">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 border-t border-gray-100 pt-4">
              <Link
                href="/dashboard/teacher/schedule"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0D1B2A]"
              >
                <Calendar className="h-4 w-4" />
                {t("teacherDashboard.syncCalendar")}
              </Link>
            </div>
          </div>

          {/* Student list */}
          <div className={card("flex flex-col")}>
            <h3 className="mb-4 text-lg font-bold text-[#0D1B2A]">{t("teacherDashboard.studentList")}</h3>
            {data.students.length === 0 ? (
              <p className="flex-1 text-sm text-gray-500">{t("teacherDashboard.noStudents")}</p>
            ) : (
              <ul className="mb-6 flex-1 space-y-4">
                {data.students.slice(0, 6).map((student, i) => (
                  <li key={student.id} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                      >
                        {student.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#0D1B2A]">{student.name}</p>
                        <p className="truncate text-xs text-gray-500">
                          {student.subject} · {student.totalHours}h ({student.lessonCount}{" "}
                          {t("teacherDashboard.units")})
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard/teacher/schedule"
                      className="shrink-0 text-xs font-medium text-[#D4AF37] hover:underline"
                    >
                      {t("teacherDashboard.createForStudent")}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/dashboard/teacher/students"
              className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[#D4AF37] hover:underline"
            >
              <Plus className="h-4 w-4" />
              {t("teacherDashboard.addStudent")}
            </Link>
          </div>
        </div>

        {/* Payments + messages */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={card()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0D1B2A]">{t("teacherDashboard.recentPayments")}</h3>
              <Link href="/dashboard/teacher/earnings" className="text-sm text-[#D4AF37] hover:underline">
                {t("teacherDashboard.viewAll")} →
              </Link>
            </div>
            {data.recentPayments.length === 0 ? (
              <p className="text-sm text-gray-500">{t("teacherDashboard.noPayments")}</p>
            ) : (
              <ul className="space-y-3">
                {data.recentPayments.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-50 bg-[#FAFAFA] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[#0D1B2A]">{p.studentName}</p>
                      <p className="text-xs text-gray-500">
                        {p.method} · {new Date(p.date).toLocaleDateString(locale)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#0D1B2A]">{formatEuro(p.amount)}</span>
                      <Badge variant="success">{t("teacherDashboard.paid")}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div id="nachrichten" className={card()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0D1B2A]">{t("teacherDashboard.notifications", { defaultValue: "Notifications" })}</h3>
              {data.unreadNotifications > 0 && <Badge variant="warning">{data.unreadNotifications}</Badge>}
            </div>
            {data.notifications.length === 0 ? (
              <p className="text-sm text-gray-500">{t("teacherDashboard.noMessages", { defaultValue: "No new notifications." })}</p>
            ) : (
              <ul className="space-y-3">
                {data.notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`flex gap-3 rounded-xl p-3 ${n.is_read ? "" : "bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]/20"}`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0D1B2A]/5">
                      <Bell className="h-3.5 w-3.5 text-[#0D1B2A]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.is_read ? "text-gray-600" : "font-semibold text-[#0D1B2A]"}`}>
                        {n.title}
                      </p>
                      {n.message && <p className="text-xs text-gray-500">{n.message}</p>}
                      <p className="mt-0.5 text-xs text-gray-400">{formatRelativeTime(n.created_at, locale)}</p>
                    </div>
                    {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#2D8CFF]" />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </TeacherDashboardLayout>
  );
}
