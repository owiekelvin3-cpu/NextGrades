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
  Plus,
  Sparkles,
  TrendingUp,
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
import {
  ABOUT_IMAGES,
  ABOUT_TEAM_IMAGES,
} from "@/lib/marketing-images";
import {
  TEACHER_AVATAR_COLORS,
  formatTeacherEuro,
  studentInitials,
  teacherPanel,
  teacherStatCard,
} from "./teacher-ui";
import { SwipeableCardRow, SwipeableCard } from "@/components/mobile/SwipeableCardRow";
import { TeacherMobileQuickActions } from "@/components/mobile/MobileQuickActions";
import { cn } from "@/lib/utils";

function formatTimeRange(start: string, durationMin: number, locale: string) {
  const s = new Date(start);
  const e = new Date(s.getTime() + durationMin * 60 * 1000);
  const fmt = (d: Date) => d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return `${fmt(s)} – ${fmt(e)}`;
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
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 shrink-0">
      <h2 className="text-sm font-semibold text-[#0D1B2A]">{title}</h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 text-xs font-medium text-[#D4AF37] hover:underline"
        >
          {linkLabel}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function StatMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="text-xs text-gray-500">
      <strong className="font-semibold text-[#0D1B2A]">{value}</strong> {label}
    </span>
  );
}

export function TeacherOverviewDashboard() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeacherOverviewData | null>(null);

  const todayLabel = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

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

  const firstName = getTeacherFirstName(data.profile.fullName);

  return (
    <TeacherDashboardLayout title={t("teacherDashboard.nav.dashboard")} topRightAction={createAppointmentBtn}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <TeacherMobileQuickActions />

        {/* Welcome */}
        <div className="overflow-hidden rounded-xl border border-[#0D1B2A]/10 bg-gradient-to-r from-[#0D1B2A] via-[#132942] to-[#1a3555] px-5 py-4 text-white shadow-sm sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#D4AF37]">
              {t("teacherDashboard.welcomeBack", { name: firstName || t("teacherDashboard.sidebarGuest") })}
              <span className="hidden text-gray-400 sm:inline"> · </span>
              <span className="hidden capitalize text-gray-300 sm:inline">{todayLabel}</span>
            </p>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-0">
            <Link href="/dashboard/chat" className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-medium transition hover:bg-white/15">
              <Sparkles className="h-3 w-3 text-[#D4AF37]" />
              {t("teacherDashboard.openAi")}
            </Link>
            <Link href="/dashboard/teacher/payments" className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-medium transition hover:bg-white/15">
              <Euro className="h-3 w-3" />
              {t("teacherDashboard.viewPayments")}
            </Link>
            <Link href="/dashboard/notifications" className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-medium transition hover:bg-white/15">
              {t("teacherDashboard.notifications")}
            </Link>
          </div>
        </div>

        {/* KPI row — swipeable on mobile */}
        <SwipeableCardRow desktopCols={4}>
          <SwipeableCard>
          <Link href="/dashboard/teacher/schedule" className={cn(teacherStatCard(), "block h-full")}>
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {t("teacherDashboard.todayLabel")}
              </p>
              <span className="rounded-lg bg-blue-50 p-2">
                <Clock className="h-4 w-4 text-blue-500" />
              </span>
            </div>
            <p className="mt-2 text-xl font-bold tracking-tight text-[#0D1B2A]">
              {t("teacherDashboard.hoursToday", { count: data.stats.hoursToday })}
            </p>
            <div className="mt-auto flex gap-3 border-t border-gray-50 pt-3">
              <StatMetric label={t("teacherDashboard.upcomingShort")} value={data.stats.todayUpcoming} />
              <StatMetric label={t("teacherDashboard.completedShort")} value={data.stats.todayCompleted} />
            </div>
          </Link>
          </SwipeableCard>

          <SwipeableCard>
          <Link href="/dashboard/teacher/schedule" className={cn(teacherStatCard(), "block h-full")}>
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {t("teacherDashboard.thisWeek")}
              </p>
              <span className="rounded-lg bg-violet-50 p-2">
                <Calendar className="h-4 w-4 text-violet-500" />
              </span>
            </div>
            <p className="mt-2 text-xl font-bold tracking-tight text-[#0D1B2A]">
              {t("teacherDashboard.plannedHours", { count: data.stats.weekHours })}
            </p>
            <div className="mt-auto flex gap-3 border-t border-gray-50 pt-3">
              <StatMetric label={t("teacherDashboard.completedShort")} value={data.stats.weekCompleted} />
              <StatMetric label={t("teacherDashboard.pendingShort")} value={data.stats.weekPending} />
            </div>
          </Link>
          </SwipeableCard>

          <SwipeableCard>
          <Link href="/dashboard/teacher/payments" className={cn(teacherStatCard(), "block h-full")}>
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {t("teacherDashboard.earningsMonth")}
              </p>
              <span className="rounded-lg bg-emerald-50 p-2">
                <Euro className="h-4 w-4 text-emerald-600" />
              </span>
            </div>
            <p className="mt-2 text-xl font-bold tracking-tight text-[#0D1B2A]">
              {formatTeacherEuro(data.stats.earningsMonth)}
            </p>
            <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-50 pt-4 text-xs text-gray-500">
              <span>
                {t("teacherDashboard.gross")}:{" "}
                <strong className="text-[#0D1B2A]">{formatTeacherEuro(data.stats.earningsGross)}</strong>
              </span>
              <span>
                {t("teacherDashboard.pending")}:{" "}
                <strong className="text-[#0D1B2A]">{formatTeacherEuro(data.stats.earningsPending)}</strong>
              </span>
            </div>
          </Link>
          </SwipeableCard>

          <SwipeableCard>
          <Link href="/dashboard/teacher/earnings" className={cn(teacherStatCard(), "block h-full")}>
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {t("teacherDashboard.nextJumpBonus")}
              </p>
              <span className="rounded-lg bg-orange-50 p-2">
                <Rocket className="h-4 w-4 text-orange-500" />
              </span>
            </div>
            <p className="mt-2 text-xl font-bold tracking-tight text-[#0D1B2A]">
              {formatTeacherEuro(data.stats.bonusCurrent)}
            </p>
            <div className="mt-auto border-t border-gray-50 pt-3">
              <div className="mb-1.5 flex justify-between text-[11px] text-gray-500">
                <span>{data.stats.bonusProgress}%</span>
                <span className="truncate pl-2">
                  {t("teacherDashboard.nextGoal")}: {formatTeacherEuro(data.stats.bonusNextGoal)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#22C55E] transition-all"
                  style={{ width: `${data.stats.bonusProgress}%` }}
                />
              </div>
            </div>
          </Link>
          </SwipeableCard>
        </SwipeableCardRow>

        {/* Main content */}
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Upcoming lessons */}
          <div className={cn(teacherPanel(), "lg:col-span-3")}>
            <PanelHeader
              title={t("teacherDashboard.upcomingLessons")}
              href="/dashboard/teacher/schedule"
              linkLabel={t("teacherDashboard.allAppointments")}
            />
            {data.upcomingLessons.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                  <Calendar className="h-7 w-7 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-[#0D1B2A]">{t("teacherDashboard.noAppointments")}</p>
                <p className="mt-1 max-w-sm text-xs text-gray-500">{t("teacherDashboard.planWithStudents")}</p>
                <Button variant="gold" size="sm" href="/dashboard/teacher/schedule" className="mt-5">
                  {t("teacherDashboard.goToCalendar")}
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.upcomingLessons.slice(0, 4).map((lesson) => {
                  const start = new Date(lesson.start_time);
                  return (
                    <li
                      key={lesson.id}
                      className="flex flex-col gap-2 px-4 py-3 transition hover:bg-gray-50/80 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-[#F0F2F5]">
                          <span className="text-[10px] font-bold uppercase leading-none text-gray-400">
                            {start.toLocaleDateString(locale, { weekday: "short" })}
                          </span>
                          <span className="text-base font-bold leading-tight text-[#0D1B2A]">
                            {start.getDate()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#0D1B2A]">
                            {lesson.student_name || "—"}
                          </p>
                          <p className="mt-0.5 truncate text-sm text-gray-500">
                            {lesson.subject_name || "—"} · {lesson.duration} min ·{" "}
                            {formatTimeRange(lesson.start_time, lesson.duration, locale)}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 pl-16 sm:pl-0">
                        <Badge variant="success">{t("teacherDashboard.statusBooked")}</Badge>
                        {lesson.zoom_link ? (
                          <a
                            href={lesson.zoom_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2D8CFF] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1a7ae8]"
                          >
                            <Video className="h-3.5 w-3.5" />
                            {t("teacherDashboard.startLesson")}
                          </a>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Students */}
          <div className={cn(teacherPanel(), "lg:col-span-2")}>
            <PanelHeader
              title={t("teacherDashboard.studentList")}
              href="/dashboard/teacher/students"
              linkLabel={t("teacherDashboard.allStudents")}
            />
            {data.students.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <Users className="mb-3 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">{t("teacherDashboard.noStudents")}</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {data.students.slice(0, 4).map((student, i) => (
                  <li key={student.id} className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
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
                      <Link
                        href={`/dashboard/teacher/schedule?student=${student.id}`}
                        className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-[#D4AF37]"
                        title={t("teacherDashboard.createForStudent")}
                      >
                        <Plus className="h-4 w-4" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="shrink-0 border-t border-gray-100 px-4 py-2">
              <Link
                href="/dashboard/teacher/students"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] hover:underline"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {t("teacherDashboard.addNewStudent")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </TeacherDashboardLayout>
  );
}
