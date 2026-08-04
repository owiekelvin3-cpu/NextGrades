"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  Crown,
  ListChecks,
  Star,
  Video,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { StudentOverviewData } from "@/lib/dashboard/student-overview";
import {
  formatTimeRange,
  lessonDateParts,
  st,
  subjectColor,
  subjectIcon,
  subjectInitials,
} from "./student-ui";
import { StudentMobileHeader } from "./StudentMobileHeader";
import { StudentHeroBand } from "./StudentHeroBand";
import { StudentKpiCard, StudentKpiStrip } from "./StudentKpiCard";
import { ZoomMeetingButton } from "@/components/zoom/ZoomMeetingButton";
import { cn } from "@/lib/utils";

type Props = {
  data: StudentOverviewData;
  firstName: string;
  dateLocale: string;
};

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
    <div className="mb-3 flex items-center justify-between gap-2 px-5">
      <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className={st.mobileSectionLink}>
          {linkLabel}
        </Link>
      )}
    </div>
  );
}


export function StudentMobileDashboard({ data, firstName, dateLocale }: Props) {
  const { t } = useTranslation();
  const todayLabel = t("dashboardCommon.today", { defaultValue: "Today" });

  const subjects = useMemo(() => {
    const names = [...new Set(data.courses.map((c) => c.subjectName).filter(Boolean))];
    if (names.length === 0 && data.enrollments.length) {
      return data.enrollments.map((e) => e.subject_name).filter(Boolean) as string[];
    }
    return names;
  }, [data.courses, data.enrollments]);

  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const selectedSubject = activeSubject ?? subjects[0] ?? null;

  const filteredCourses = useMemo(() => {
    if (!selectedSubject) return data.courses;
    return data.courses.filter((c) => c.subjectName === selectedSubject);
  }, [data.courses, selectedSubject]);

  const displayCourses = filteredCourses.length > 0 ? filteredCourses : data.courses;

  const instructors = useMemo(() => {
    const map = new Map<string, { name: string; subject: string; courseCount: number }>();
    for (const course of data.courses) {
      if (!course.teacherName) continue;
      const key = course.teacherName;
      const existing = map.get(key);
      if (existing) {
        existing.courseCount += 1;
      } else {
        map.set(key, {
          name: course.teacherName,
          subject: course.subjectName,
          courseCount: 1,
        });
      }
    }
    return [...map.values()].slice(0, 4);
  }, [data.courses]);

  const upcoming = data.lessons.filter(
    (l) => new Date(l.start_time).getTime() >= Date.now()
  );

  const pageTitle = t("studentDashboard.overviewTitle", { defaultValue: "Overview" });

  const nextLessonCta = data.nextLesson
    ? new Date(data.nextLesson.start_time).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "short",
      })
    : undefined;

  return (
    <div className="bg-surface-dashboard pb-6 md:hidden">
      <StudentMobileHeader title={pageTitle} />

      <div className="space-y-6 pt-4">
        <div className="px-5">
          <StudentHeroBand
            firstName={firstName}
            learningGoal={data.learningGoal}
            dateLocale={dateLocale}
            overallProgress={data.overallProgress}
            nextLessonLabel={nextLessonCta}
            compact
          />
        </div>

        <div className="px-5">
          <StudentKpiStrip>
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
            />
            <StudentKpiCard
              label={t("studentDashboard.openTasks")}
              value={data.openTaskCount}
              href="/dashboard/student/quizzes"
              icon={ListChecks}
              accent="violet"
            />
          </StudentKpiStrip>
        </div>

        {/* Subjects - horizontal chips */}
        {subjects.length > 0 && (
          <section>
            <SectionHeader
              title={t("studentDashboard.mobileSubjects", { defaultValue: "Subjects" })}
              href="/dashboard/student/courses"
              linkLabel={t("studentDashboard.showAll", { defaultValue: "See All" })}
            />
            <div className="-mx-0 flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar snap-x snap-mandatory">
              {subjects.map((name) => {
                const Icon = subjectIcon(name);
                const active = name === selectedSubject;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setActiveSubject(name)}
                    className={cn(
                      "flex w-[5.5rem] shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border p-3.5 transition active:scale-[0.97] touch-manipulation",
                      active ? st.mobileSubjectActive : st.mobileSubjectIdle
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6",
                        active ? "text-inherit" : "text-text-muted"
                      )}
                      strokeWidth={1.75}
                    />
                    <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight">
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Top courses - horizontal cards */}
        <section>
          <SectionHeader
            title={t("studentDashboard.mobileTopCourses", {
              defaultValue: "Top rated courses",
            })}
            href="/dashboard/student/courses"
            linkLabel={t("studentDashboard.showAll", { defaultValue: "See All" })}
          />
          {displayCourses.length === 0 ? (
            <div className="mx-5 rounded-3xl border border-border-default bg-surface-elevated p-8 text-center text-sm text-text-muted">
              {t("studentDashboard.noCourses")}
              <Link href="/programs" className="mt-3 block font-semibold text-[var(--brand-gold)]">
                {t("home.explorePrograms", { defaultValue: "Explore programs" })}
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto px-5 pb-1 no-scrollbar snap-x snap-mandatory">
              {displayCourses.map((course) => {
                const color = subjectColor(course.subjectName);
                return (
                  <article key={course.enrollmentId} className={st.mobileCourseCard}>
                    <div
                      className="relative flex h-36 items-end p-4"
                      style={{
                        background: `linear-gradient(145deg, ${color}ee 0%, ${color}99 45%, var(--brand-navy) 100%)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="relative text-3xl font-black text-white/90">
                        {subjectInitials(course.subjectName)}
                      </span>
                    </div>
                    <div className="space-y-2 p-4">
                      {course.teacherName && (
                        <p className="text-xs text-text-muted">{course.teacherName}</p>
                      )}
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
                        {course.subjectName}
                      </h3>
                      <div className="flex items-center justify-between gap-2 text-xs text-text-muted">
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {t("studentDashboard.mobileLessonCount", {
                            count: course.lessonCount || 0,
                            defaultValue: "{{count}} lessons",
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[var(--brand-gold)]">
                          <Crown className="h-3.5 w-3.5" />
                          {course.progressPercent}%
                        </span>
                      </div>
                      <Link
                        href="/dashboard/student/courses"
                        className="flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--brand-navy)] text-sm font-semibold text-white transition active:scale-[0.98] dark:bg-[var(--brand-gold)] dark:text-[var(--brand-navy)]"
                      >
                        {t("studentDashboard.mobileEnrolled", { defaultValue: "Enrolled Now" })}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Popular instructors */}
        {instructors.length > 0 && (
          <section>
            <SectionHeader
              title={t("studentDashboard.mobileInstructors", {
                defaultValue: "Popular Instructors",
              })}
              href="/dashboard/chat"
              linkLabel={t("studentDashboard.showAll", { defaultValue: "See All" })}
            />
            <div className="grid grid-cols-2 gap-3 px-5">
              {instructors.map((inst) => (
                <Link
                  key={inst.name}
                  href="/dashboard/chat"
                  className={cn(st.mobileInstructorCard, "active:scale-[0.98]")}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: subjectColor(inst.subject) }}
                  >
                    {inst.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{inst.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                      <Star className="h-3 w-3 fill-[var(--brand-gold)] text-[var(--brand-gold)]" />
                      4.9
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {t("studentDashboard.mobileInstructorCourses", {
                        count: inst.courseCount,
                        defaultValue: "{{count}} courses",
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming - topic list */}
        <section>
          <SectionHeader
            title={t("studentDashboard.upcomingAppointments")}
            href="/dashboard/student/appointments"
            linkLabel={t("studentDashboard.showAll", { defaultValue: "See All" })}
          />
          {upcoming.length === 0 ? (
            <div className="mx-5 rounded-3xl border border-dashed border-border-default bg-surface-elevated p-8 text-center text-sm text-text-muted">
              {t("studentDashboard.noAppointments")}
            </div>
          ) : (
            <div className="space-y-3 px-5">
              {upcoming.slice(0, 4).map((lesson) => {
                const parts = lessonDateParts(lesson.start_time, dateLocale, todayLabel);
                return (
                  <div
                    key={lesson.id}
                    className={cn(
                      "rounded-2xl border border-border-default bg-surface-elevated p-4 shadow-sm",
                      parts.isToday && "border-[var(--brand-gold)]/30 bg-[var(--brand-gold-muted)]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(st.dateBadge, parts.isToday && st.dateBadgeToday, "h-12 w-12")}>
                        <span className="text-lg font-bold leading-none text-foreground">{parts.day}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">{lesson.subject_name}</p>
                        <p className="text-xs text-text-muted">{parts.weekday}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-text-muted">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeRange(lesson.start_time, lesson.duration, dateLocale)}
                          </span>
                          {parts.isToday && (
                            <span className={st.goldChip}>{todayLabel}</span>
                          )}
                        </div>
                      </div>
                      {(lesson.zoom_meeting_id || lesson.zoom_link) && (
                        <ZoomMeetingButton lessonId={lesson.id} mode="join" size="sm" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick stats row */}
        <section className="px-5">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/student/appointments"
              className="rounded-2xl border border-border-default bg-surface-elevated p-4 active:scale-[0.98]"
            >
              <Calendar className="mb-2 h-5 w-5 text-[var(--brand-gold)]" />
              <p className="text-xs text-text-muted">{t("studentDashboard.nextAppointment")}</p>
              <p className="mt-1 text-sm font-bold text-foreground">
                {data.nextLesson
                  ? new Date(data.nextLesson.start_time).toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "short",
                    })
                  : "-"}
              </p>
            </Link>
            <Link
              href="/dashboard/student/live-classes"
              className="rounded-2xl border border-border-default bg-surface-elevated p-4 active:scale-[0.98]"
            >
              <Video className="mb-2 h-5 w-5 text-[var(--brand-gold)]" />
              <p className="text-xs text-text-muted">{t("studentDashboard.liveClasses", { defaultValue: "Live classes" })}</p>
              <p className="mt-1 text-sm font-bold text-foreground">
                {t("studentDashboard.mobileJoin", { defaultValue: "Join" })}
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
