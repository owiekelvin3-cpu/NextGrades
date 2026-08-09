"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  Users,
  Euro,
  Rocket,
  Plus,
  Sparkles,
  TrendingUp,
  Bell,
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
import { TeacherMobileDashboard } from "./TeacherMobileDashboard";
import { TEACHER_AVATAR_COLORS, formatTeacherEuro, studentInitials } from "./teacher-ui";
import { SwipeableCardRow, SwipeableCard } from "@/components/mobile/SwipeableCardRow";
import { ZoomSetupStrip } from "@/components/zoom/ZoomSetupStrip";
import { ZoomMeetingButton } from "@/components/zoom/ZoomMeetingButton";
import { lessonHasMeetingLink } from "@/lib/meetings/link";
import {
  OverviewHero,
  OverviewStatCard,
  OverviewPanel,
  OverviewEmptyState,
} from "@/components/dashboard/overview/OverviewPrimitives";
import { cn } from "@/lib/utils";

function formatTimeRange(start: string, durationMin: number, locale: string) {
  const s = new Date(start);
  const e = new Date(s.getTime() + durationMin * 60 * 1000);
  const fmt = (d: Date) => d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return `${fmt(s)} – ${fmt(e)}`;
}

function StatMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="text-xs text-text-muted">
      <strong className="font-semibold text-foreground">{value}</strong> {label}
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
        <OverviewEmptyState
          icon={Users}
          title={t("teacherDashboard.signInRequired")}
          actionHref="/login"
          actionLabel={t("common.login")}
        />
      </TeacherDashboardLayout>
    );
  }

  const firstName = getTeacherFirstName(data.profile.fullName);

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.dashboard")}
      topRightAction={createAppointmentBtn}
      suppressMobileTitle
    >
      <TeacherMobileDashboard data={data} />

      <div className="hidden md:block content-ready mx-auto flex max-w-6xl flex-col gap-6">
        <OverviewHero
          eyebrow={todayLabel}
          title={t("teacherDashboard.welcomeBack", { name: firstName || t("teacherDashboard.sidebarGuest") })}
          subtitle={t("teacherDashboard.overviewSubtitle", {
            defaultValue: "Your teaching hub - schedule lessons, track earnings, and connect with students.",
          })}
          actions={[
            { href: "/dashboard/chat", label: t("teacherDashboard.openAi"), icon: Sparkles },
            { href: "/dashboard/teacher/payments", label: t("teacherDashboard.viewPayments"), icon: Euro },
            { href: "/dashboard/notifications", label: t("teacherDashboard.notifications"), icon: Bell },
            { href: "/dashboard/teacher/schedule", label: t("teacherDashboard.goToCalendar"), icon: Calendar },
          ]}
        />

        <SwipeableCardRow desktopCols={4}>
          <SwipeableCard>
            <OverviewStatCard
              label={t("teacherDashboard.todayLabel")}
              value={t("teacherDashboard.hoursToday", { count: data.stats.hoursToday })}
              href="/dashboard/teacher/schedule"
              icon={Clock}
              iconClassName="text-blue-600 bg-blue-50 ring-blue-100"
              footer={
                <div className="flex gap-3">
                  <StatMetric label={t("teacherDashboard.upcomingShort")} value={data.stats.todayUpcoming} />
                  <StatMetric label={t("teacherDashboard.completedShort")} value={data.stats.todayCompleted} />
                </div>
              }
            />
          </SwipeableCard>

          <SwipeableCard>
            <OverviewStatCard
              label={t("teacherDashboard.thisWeek")}
              value={t("teacherDashboard.plannedHours", { count: data.stats.weekHours })}
              href="/dashboard/teacher/schedule"
              icon={Calendar}
              iconClassName="text-violet-600 bg-violet-50 ring-violet-100"
              footer={
                <div className="flex gap-3">
                  <StatMetric label={t("teacherDashboard.completedShort")} value={data.stats.weekCompleted} />
                  <StatMetric label={t("teacherDashboard.pendingShort")} value={data.stats.weekPending} />
                </div>
              }
            />
          </SwipeableCard>

          <SwipeableCard>
            <OverviewStatCard
              label={t("teacherDashboard.earningsMonth")}
              value={formatTeacherEuro(data.stats.earningsMonth)}
              href="/dashboard/teacher/payments"
              icon={Euro}
              iconClassName="text-emerald-600 bg-emerald-50 ring-emerald-100"
              footer={
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                  <span>
                    {t("teacherDashboard.gross")}:{" "}
                    <strong className="text-foreground">{formatTeacherEuro(data.stats.earningsGross)}</strong>
                  </span>
                  <span>
                    {t("teacherDashboard.pending")}:{" "}
                    <strong className="text-foreground">{formatTeacherEuro(data.stats.earningsPending)}</strong>
                  </span>
                </div>
              }
            />
          </SwipeableCard>

          <SwipeableCard>
            <OverviewStatCard
              label={t("teacherDashboard.nextJumpBonus")}
              value={formatTeacherEuro(data.stats.bonusCurrent)}
              href="/dashboard/teacher/earnings"
              icon={Rocket}
              iconClassName="text-orange-600 bg-orange-50 ring-orange-100"
              footer={
                <>
                  <div className="mb-1.5 flex justify-between text-[11px] text-text-muted">
                    <span>{data.stats.bonusProgress}%</span>
                    <span className="truncate pl-2">
                      {t("teacherDashboard.nextGoal")}: {formatTeacherEuro(data.stats.bonusNextGoal)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-subtle">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#22C55E] transition-all"
                      style={{ width: `${data.stats.bonusProgress}%` }}
                    />
                  </div>
                </>
              }
            />
          </SwipeableCard>
        </SwipeableCardRow>

        <Suspense fallback={null}>
          <ZoomSetupStrip returnPath="/dashboard/teacher" />
        </Suspense>

        <div className="grid gap-5 lg:grid-cols-5">
          <OverviewPanel
            className="lg:col-span-3"
            title={t("teacherDashboard.upcomingLessons")}
            icon={Video}
            href="/dashboard/teacher/schedule"
            linkLabel={t("teacherDashboard.allAppointments")}
            noPadding
          >
            {data.upcomingLessons.length === 0 ? (
              <OverviewEmptyState
                icon={Calendar}
                title={t("teacherDashboard.noAppointments")}
                description={t("teacherDashboard.planWithStudents")}
                actionHref="/dashboard/teacher/schedule"
                actionLabel={t("teacherDashboard.goToCalendar")}
              />
            ) : (
              <ul className="space-y-2 p-3">
                {data.upcomingLessons.slice(0, 4).map((lesson) => {
                  const start = new Date(lesson.start_time);
                  const isToday = start.toDateString() === new Date().toDateString();
                  return (
                    <li
                      key={lesson.id}
                      className={cn(
                        "flex flex-col gap-3 rounded-xl border p-4 transition hover:border-[#D4AF37]/25 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between",
                        isToday
                          ? "border-[var(--brand-gold)]/30 bg-[var(--brand-gold-muted)]"
                          : "border-border-default bg-surface-subtle/50"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={cn(
                            "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border text-center",
                            isToday
                              ? "border-[var(--brand-gold)]/40 bg-[var(--brand-gold-muted)]"
                              : "border-border-default bg-surface-elevated"
                          )}
                        >
                          <span className="text-[10px] font-bold uppercase leading-none text-text-muted">
                            {start.toLocaleDateString(locale, { weekday: "short" })}
                          </span>
                          <span className="text-lg font-bold leading-tight text-foreground">{start.getDate()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{lesson.student_name || "-"}</p>
                          <p className="mt-0.5 truncate text-sm text-text-muted">
                            {lesson.subject_name || "-"} · {lesson.duration} min
                          </p>
                          <p className="mt-1 text-xs text-text-muted">
                            {formatTimeRange(lesson.start_time, lesson.duration, locale)}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 pl-[4.5rem] sm:pl-0">
                        <Badge variant="success">{t("teacherDashboard.statusBooked")}</Badge>
                        {lessonHasMeetingLink(lesson) ? (
                          <ZoomMeetingButton
                            lessonId={lesson.id}
                            mode="start"
                            provider={lesson.meeting_provider}
                            size="sm"
                          />
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </OverviewPanel>

          <OverviewPanel
            className="lg:col-span-2"
            title={t("teacherDashboard.studentList")}
            icon={Users}
            href="/dashboard/teacher/students"
            linkLabel={t("teacherDashboard.allStudents")}
            noPadding
          >
            {data.students.length === 0 ? (
              <OverviewEmptyState icon={Users} title={t("teacherDashboard.noStudents")} />
            ) : (
              <>
                <ul className="space-y-1 p-3">
                  {data.students.slice(0, 5).map((student, i) => (
                    <li key={student.id}>
                      <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-surface-subtle">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                          style={{ backgroundColor: TEACHER_AVATAR_COLORS[i % TEACHER_AVATAR_COLORS.length] }}
                        >
                          {studentInitials(student.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{student.name}</p>
                          <p className="truncate text-xs text-text-muted">
                            {student.subject} · {student.totalHours}h
                          </p>
                        </div>
                        <Link
                          href={`/dashboard/teacher/schedule?student=${student.id}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border-default text-text-muted transition hover:border-[var(--brand-gold)]/40 hover:bg-[var(--brand-gold-muted)] hover:text-[#D4AF37]"
                          title={t("teacherDashboard.createForStudent")}
                        >
                          <Plus className="h-4 w-4" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border-default px-4 py-3">
                  <Link
                    href="/dashboard/teacher/students"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:underline"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    {t("teacherDashboard.addNewStudent")}
                  </Link>
                </div>
              </>
            )}
          </OverviewPanel>
        </div>
      </div>
    </TeacherDashboardLayout>
  );
}
