"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  Users,
  Euro,
  Rocket,
  ChevronRight,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import {
  fetchTeacherOverviewData,
  type TeacherOverviewData,
} from "@/lib/dashboard/teacher-overview";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import {
  TEACHER_AVATAR_COLORS,
  formatTeacherEuro,
  studentInitials,
  teacherPanel,
} from "./teacher-ui";

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

function PanelHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
      <h2 className="text-sm font-semibold text-[#0D1B2A]">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="inline-flex items-center gap-0.5 text-xs font-medium text-[#D4AF37] hover:underline">
          {linkLabel}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export function TeacherOverviewDashboard() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeacherOverviewData | null>(null);

  const monthLabel = new Date().toLocaleDateString(locale, { month: "long", year: "numeric" });

  useEffect(() => {
    fetchTeacherOverviewData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const createAppointmentBtn = (
    <Button variant="gold" size="md" href="/dashboard/teacher/schedule">
      <Plus className="mr-2 h-4 w-4" />
      {t("teacherDashboard.createNewAppointment")}
    </Button>
  );

  if (loading) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.dashboard")}>
        <LoadingBlock />
      </TeacherDashboardLayout>
    );
  }

  if (!data) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.dashboard")}>
        <div className={`${teacherPanel()} p-10 text-center`}>
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
      title={t("teacherDashboard.nav.dashboard")}
      topRightAction={createAppointmentBtn}
      headerAction={<div className="sm:hidden">{createAppointmentBtn}</div>}
    >
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Top stat cards — mockup row */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className={teacherPanel("p-5")}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {t("teacherDashboard.todayLabel")}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#0D1B2A]">
                  {t("teacherDashboard.hoursToday", { count: data.stats.hoursToday })}
                </p>
              </div>
              <span className="rounded-xl bg-blue-50 p-2.5">
                <Clock className="h-5 w-5 text-blue-500" />
              </span>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span>
                <strong className="text-[#0D1B2A]">{data.stats.todayUpcoming}</strong>{" "}
                {t("teacherDashboard.upcomingShort")}
              </span>
              <span>
                <strong className="text-[#0D1B2A]">{data.stats.todayCompleted}</strong>{" "}
                {t("teacherDashboard.completedShort")}
              </span>
            </div>
            <Link
              href="/dashboard/teacher/schedule"
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] hover:underline"
            >
              {t("teacherDashboard.goToCalendar")}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className={teacherPanel("p-5")}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {t("teacherDashboard.thisWeek")}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#0D1B2A]">
                  {t("teacherDashboard.plannedHours", { count: data.stats.weekHours })}
                </p>
              </div>
              <span className="rounded-xl bg-purple-50 p-2.5">
                <Calendar className="h-5 w-5 text-purple-500" />
              </span>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span>
                <strong className="text-[#0D1B2A]">{data.stats.weekCompleted}</strong>{" "}
                {t("teacherDashboard.completedShort")}
              </span>
              <span>
                <strong className="text-[#0D1B2A]">{data.stats.weekPending}</strong>{" "}
                {t("teacherDashboard.pendingShort")}
              </span>
            </div>
            <Link
              href="/dashboard/teacher/schedule"
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] hover:underline"
            >
              {t("teacherDashboard.myAppointments")}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className={teacherPanel("p-5")}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {t("teacherDashboard.earningsMonth")} ({monthLabel})
                </p>
                <p className="mt-2 text-2xl font-bold text-[#0D1B2A]">
                  {formatTeacherEuro(data.stats.earningsMonth)}
                </p>
                <p className="text-xs text-gray-400">{t("teacherDashboard.netLabel")}</p>
              </div>
              <span className="rounded-xl bg-green-50 p-2.5">
                <Euro className="h-5 w-5 text-green-600" />
              </span>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span>
                {t("teacherDashboard.gross")}:{" "}
                <strong className="text-[#0D1B2A]">{formatTeacherEuro(data.stats.earningsGross)}</strong>
              </span>
              <span>
                {t("teacherDashboard.pending")}:{" "}
                <strong className="text-[#0D1B2A]">{formatTeacherEuro(data.stats.earningsPending)}</strong>
              </span>
            </div>
            <Link
              href="/dashboard/teacher/payments"
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] hover:underline"
            >
              {t("teacherDashboard.viewPayments")}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className={teacherPanel("p-5")}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {t("teacherDashboard.nextJumpBonus")}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#0D1B2A]">
                  {formatTeacherEuro(data.stats.bonusCurrent)}
                </p>
                <p className="text-xs text-gray-400">{t("teacherDashboard.currentBonus")}</p>
              </div>
              <span className="rounded-xl bg-orange-50 p-2.5">
                <Rocket className="h-5 w-5 text-orange-500" />
              </span>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>{data.stats.bonusProgress}%</span>
                <span>
                  {t("teacherDashboard.nextGoal")}: {formatTeacherEuro(data.stats.bonusNextGoal)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${data.stats.bonusProgress}%` }}
                />
              </div>
            </div>
            <Link
              href="/dashboard/teacher/earnings"
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] hover:underline"
            >
              {t("teacherDashboard.learnMore")}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Middle: lessons table + student list */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className={`${teacherPanel()} xl:col-span-2`}>
            <PanelHeader
              title={t("teacherDashboard.upcomingLessons")}
              href="/dashboard/teacher/schedule"
              linkLabel={t("teacherDashboard.allAppointments")}
            />
            {data.upcomingLessons.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Calendar className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">{t("teacherDashboard.noAppointments")}</p>
                <Button variant="outline" size="sm" href="/dashboard/teacher/schedule" className="mt-4">
                  {t("teacherDashboard.goToCalendar")}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      <th className="px-5 py-3">{t("teacherDashboard.colDate")}</th>
                      <th className="px-3 py-3">{t("teacherDashboard.colTime")}</th>
                      <th className="px-3 py-3">{t("teacherDashboard.colStudent")}</th>
                      <th className="px-3 py-3">{t("teacherDashboard.colSubject")}</th>
                      <th className="px-3 py-3">{t("teacherDashboard.colDuration")}</th>
                      <th className="px-3 py-3">{t("teacherDashboard.colStatus")}</th>
                      <th className="px-5 py-3 text-right">{t("teacherDashboard.colAction")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingLessons.slice(0, 6).map((lesson) => (
                      <tr key={lesson.id} className="border-b border-gray-50 last:border-0">
                        <td className="whitespace-nowrap px-5 py-3.5 text-[#0D1B2A]">
                          {new Date(lesson.start_time).toLocaleDateString(locale, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-gray-600">
                          {formatTimeRange(lesson.start_time, lesson.duration, locale)}
                        </td>
                        <td className="px-3 py-3.5 font-medium text-[#0D1B2A]">{lesson.student_name || "—"}</td>
                        <td className="px-3 py-3.5 text-gray-600">{lesson.subject_name || "—"}</td>
                        <td className="px-3 py-3.5 text-gray-600">{lesson.duration} min</td>
                        <td className="px-3 py-3.5">
                          <Badge variant="success">{t("teacherDashboard.statusBooked")}</Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {lesson.zoom_link ? (
                              <a
                                href={lesson.zoom_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2D8CFF] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1a7ae8]"
                              >
                                <Video className="h-3.5 w-3.5" />
                                {t("teacherDashboard.startLesson")}
                              </a>
                            ) : null}
                            <button
                              type="button"
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                              aria-label="More options"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={teacherPanel()}>
            <PanelHeader
              title={t("teacherDashboard.studentList")}
              href="/dashboard/teacher/students"
              linkLabel={t("teacherDashboard.allStudents")}
            />
            {data.students.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">{t("teacherDashboard.noStudents")}</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.students.slice(0, 6).map((student, i) => (
                  <li key={student.id} className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: TEACHER_AVATAR_COLORS[i % TEACHER_AVATAR_COLORS.length] }}
                      >
                        {studentInitials(student.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#0D1B2A]">{student.name}</p>
                        <p className="truncate text-xs text-gray-500">
                          {student.subject} · {student.totalHours}h
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/teacher/schedule?student=${student.id}`}
                      className="mt-2 block w-full rounded-lg border border-gray-200 py-1.5 text-center text-xs font-medium text-gray-600 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
                    >
                      {t("teacherDashboard.createForStudent")}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-gray-100 px-5 py-4">
              <Link
                href="/dashboard/teacher/students"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("teacherDashboard.addNewStudent")}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom: payments + messages */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className={teacherPanel()}>
            <PanelHeader
              title={t("teacherDashboard.recentPayments")}
              href="/dashboard/teacher/payments"
              linkLabel={t("teacherDashboard.viewAll")}
            />
            {data.recentPayments.length === 0 ? (
              <p className="px-6 py-10 text-sm text-gray-500">{t("teacherDashboard.noPayments")}</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.recentPayments.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#0D1B2A]">{p.studentName}</p>
                      <p className="text-xs text-gray-500">
                        {p.method} · {new Date(p.date).toLocaleDateString(locale)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold text-[#0D1B2A]">{formatTeacherEuro(p.amount)}</span>
                      <Badge variant="success">{t("teacherDashboard.paid")}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={teacherPanel()}>
            <PanelHeader
              title={t("teacherDashboard.messagesTitle")}
              href="/dashboard/chat"
              linkLabel={t("teacherDashboard.viewAll")}
            />
            {data.notifications.length === 0 ? (
              <p className="px-6 py-10 text-sm text-gray-500">{t("teacherDashboard.noMessages")}</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.notifications.slice(0, 5).map((n, i) => (
                  <li key={n.id} className="flex gap-3 px-5 py-3.5">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: TEACHER_AVATAR_COLORS[i % TEACHER_AVATAR_COLORS.length] }}
                    >
                      {(n.title || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`truncate text-sm ${n.is_read ? "text-gray-600" : "font-medium text-[#0D1B2A]"}`}>
                          {n.title}
                        </p>
                        {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{n.message || n.title}</p>
                      <p className="mt-0.5 text-[11px] text-gray-400">{formatRelativeTime(n.created_at, locale)}</p>
                    </div>
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
