"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  Euro,
  Rocket,
  Users,
  Video,
  ChevronRight,
  BookOpen,
  Upload,
  ListChecks,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import type { TeacherOverviewData } from "@/lib/dashboard/teacher-overview";
import {
  TEACHER_AVATAR_COLORS,
  formatTeacherEuro,
  studentInitials,
  tt,
} from "./teacher-ui";
import { ZoomMeetingButton } from "@/components/zoom/ZoomMeetingButton";
import { lessonHasMeetingLink } from "@/lib/meetings/link";
import { ZoomSetupStrip } from "@/components/zoom/ZoomSetupStrip";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { TEACHER_PUBLISHING_ENABLED } from "@/lib/resources/teacher-publishing";

function CircularProgress({
  value,
  size = 56,
  stroke = 5,
}: {
  value: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-[var(--brand-gold)]/25"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="text-[#D4AF37] transition-all duration-500"
      />
    </svg>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="text-xs font-semibold text-[#D4AF37] hover:opacity-90">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function WaveDecor() {
  return (
    <>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-8 right-4 h-20 w-20 rounded-full bg-white/5" />
    </>
  );
}

function StatTile({
  href,
  icon: Icon,
  label,
  value,
  gradient,
}: {
  href: string;
  icon: typeof Calendar;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex min-h-[118px] flex-col justify-between overflow-hidden rounded-2xl p-4 text-white shadow-md transition active:scale-[0.98] touch-manipulation",
        gradient
      )}
    >
      <WaveDecor />
      <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="relative z-10">
        <p className="text-[11px] font-medium uppercase tracking-wide text-white/80">{label}</p>
        <p className="mt-0.5 text-sm font-bold leading-tight">{value}</p>
      </div>
    </Link>
  );
}

function formatTimeRange(start: string, durationMin: number, locale: string) {
  const s = new Date(start);
  const e = new Date(s.getTime() + durationMin * 60 * 1000);
  const fmt = (d: Date) => d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return `${fmt(s)} – ${fmt(e)}`;
}

type Props = {
  data: TeacherOverviewData;
};

export function TeacherMobileDashboard({ data }: Props) {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);

  const monthLabel = new Date().toLocaleDateString(locale, { month: "long", year: "numeric" });
  const nextLesson = data.upcomingLessons[0];
  const todayTotal = data.stats.todayUpcoming + data.stats.todayCompleted;
  const todayProgress =
    todayTotal > 0 ? Math.round((data.stats.todayCompleted / todayTotal) * 100) : 0;

  const quickLinks = [
    {
      href: "/dashboard/teacher/content",
      icon: BookOpen,
      label: t("teacherDashboard.nav.myMaterials", { defaultValue: "My materials" }),
      gradient: "from-[#D4AF37] to-[#B8960C]",
    },
    {
      href: "/dashboard/teacher/schedule",
      icon: Video,
      label: t("teacherDashboard.createLiveClass", { defaultValue: "Live class" }),
      gradient: "from-[#1e3a5f] to-[#0D1B2A]",
    },
    ...(TEACHER_PUBLISHING_ENABLED
      ? [
          {
            href: "/dashboard/teacher/upload",
            icon: Upload,
            label: t("teacherDashboard.uploadResource", { defaultValue: "Upload" }),
            gradient: "from-[#047857] to-[#065f46]",
          },
        ]
      : []),
    {
      href: "/dashboard/teacher/ai-generator",
      icon: ListChecks,
      label: t("teacherDashboard.nav.aiGenerator", { defaultValue: "AI quiz" }),
      gradient: "from-[#7c3aed] to-[#5b21b6]",
    },
    {
      href: "/dashboard/teacher/students",
      icon: Users,
      label: t("teacherDashboard.nav.students", { defaultValue: "Students" }),
      gradient: "from-[#2563eb] to-[#1d4ed8]",
    },
  ];

  return (
    <div className="bg-surface-dashboard md:hidden">
      <div className={tt.mobileFeaturedOverlap}>
        <SectionHeader
          title={t("teacherDashboard.mobileTodayOverview", { defaultValue: "Today's teaching" })}
          href="/dashboard/teacher/schedule"
          linkLabel={t("teacherDashboard.viewDetails", { defaultValue: "View details" })}
        />
        <Link
          href="/dashboard/teacher/schedule"
          className={cn(
            "flex items-center gap-4 rounded-3xl border border-border-default bg-surface-elevated p-4 shadow-[var(--card-shadow)] transition active:scale-[0.99] touch-manipulation"
          )}
        >
          {nextLesson ? (
            <>
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
                style={{
                  backgroundColor:
                    TEACHER_AVATAR_COLORS[
                      (nextLesson.student_name?.charCodeAt(0) ?? 0) % TEACHER_AVATAR_COLORS.length
                    ],
                }}
              >
                {studentInitials(nextLesson.student_name || "?")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {nextLesson.student_name || "-"}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-muted">
                  {nextLesson.subject_name || "-"} · {monthLabel}
                </p>
                <p className="mt-1 text-xs font-medium text-[#D4AF37]">
                  {formatTimeRange(nextLesson.start_time, nextLesson.duration, locale)}
                </p>
              </div>
            </>
          ) : (
            <div className="min-w-0 flex-1 py-1">
              <p className="font-semibold text-foreground">{t("teacherDashboard.noAppointments")}</p>
              <p className="mt-1 text-xs text-text-muted">{t("teacherDashboard.planWithStudents")}</p>
            </div>
          )}
          <div className="relative flex shrink-0 flex-col items-center">
            <CircularProgress value={todayProgress} />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
              {todayProgress}%
            </span>
          </div>
        </Link>
      </div>

      <div className={tt.mobileSection}>
        <section>
          <SectionHeader
            title={t("teacherDashboard.mobileQuickStats", { defaultValue: "Teaching status" })}
            href="/dashboard/teacher/analytics"
            linkLabel={t("teacherDashboard.viewAll", { defaultValue: "See all" })}
          />
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              href="/dashboard/teacher/schedule"
              icon={Clock}
              label={t("teacherDashboard.todayLabel")}
              value={t("teacherDashboard.hoursToday", { count: data.stats.hoursToday })}
              gradient="bg-gradient-to-br from-[#D4AF37] to-[#a88b2a]"
            />
            <StatTile
              href="/dashboard/teacher/schedule"
              icon={Calendar}
              label={t("teacherDashboard.thisWeek")}
              value={t("teacherDashboard.plannedHours", { count: data.stats.weekHours })}
              gradient="bg-gradient-to-br from-[#0D1B2A] to-[#1a3354]"
            />
            <StatTile
              href="/dashboard/teacher/payments"
              icon={Euro}
              label={t("teacherDashboard.earningsMonth")}
              value={formatTeacherEuro(data.stats.earningsMonth)}
              gradient="bg-gradient-to-br from-[#059669] to-[#047857]"
            />
            <StatTile
              href="/dashboard/teacher/earnings"
              icon={Rocket}
              label={t("teacherDashboard.nextJumpBonus")}
              value={formatTeacherEuro(data.stats.bonusCurrent)}
              gradient="bg-gradient-to-br from-[#2563eb] to-[#1d4ed8]"
            />
          </div>
        </section>

        <section>
          <SectionHeader
            title={t("teacherDashboard.quickLinksTitle", { defaultValue: "Quick access" })}
          />
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(({ href, icon: Icon, label, gradient }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex min-h-[88px] flex-col justify-between overflow-hidden rounded-2xl p-3.5 text-white shadow-sm active:scale-[0.98] touch-manipulation",
                  "bg-gradient-to-br",
                  gradient
                )}
              >
                <WaveDecor />
                <Icon className="relative z-10 h-5 w-5" />
                <span className="relative z-10 text-xs font-bold leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        <Suspense fallback={null}>
          <ZoomSetupStrip returnPath="/dashboard/teacher" />
        </Suspense>

        <section>
          <SectionHeader
            title={t("teacherDashboard.upcomingLessons")}
            href="/dashboard/teacher/schedule"
            linkLabel={t("teacherDashboard.allAppointments")}
          />
          {data.upcomingLessons.length === 0 ? (
            <div className={tt.empty}>{t("teacherDashboard.noAppointments")}</div>
          ) : (
            <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar snap-x snap-mandatory">
              {data.upcomingLessons.slice(0, 6).map((lesson, i) => {
                const start = new Date(lesson.start_time);
                return (
                  <article
                    key={lesson.id}
                    className={cn(
                      "w-[72vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl border border-border-default bg-surface-elevated shadow-sm"
                    )}
                  >
                    <div
                      className="flex h-20 items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${TEACHER_AVATAR_COLORS[i % TEACHER_AVATAR_COLORS.length]}33, ${TEACHER_AVATAR_COLORS[(i + 1) % TEACHER_AVATAR_COLORS.length]}22)`,
                      }}
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                        style={{ backgroundColor: TEACHER_AVATAR_COLORS[i % TEACHER_AVATAR_COLORS.length] }}
                      >
                        {studentInitials(lesson.student_name || "?")}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="truncate font-semibold text-foreground">
                        {lesson.student_name || "-"}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {lesson.subject_name || "-"} ·{" "}
                        {start.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                      <p className="mt-2 text-xs font-medium text-[#D4AF37]">
                        {formatTimeRange(lesson.start_time, lesson.duration, locale)}
                      </p>
                      {lessonHasMeetingLink(lesson) && (
                        <div className="mt-3">
                          <ZoomMeetingButton
                            lessonId={lesson.id}
                            mode="start"
                            provider={lesson.meeting_provider}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <SectionHeader
            title={t("teacherDashboard.studentList")}
            href="/dashboard/teacher/students"
            linkLabel={t("teacherDashboard.allStudents")}
          />
          {data.students.length === 0 ? (
            <div className={tt.empty}>{t("teacherDashboard.noStudents")}</div>
          ) : (
            <ul className={cn("divide-y divide-border-default overflow-hidden rounded-2xl border border-border-default bg-surface-elevated")}>
              {data.students.slice(0, 4).map((student, i) => (
                <li key={student.id}>
                  <Link
                    href="/dashboard/teacher/students"
                    className="flex items-center gap-3 px-4 py-3.5 transition active:bg-[var(--table-row-hover)]"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
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
                    <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
