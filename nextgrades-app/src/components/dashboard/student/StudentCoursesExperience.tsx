"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronRight,
  MoreHorizontal,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Trophy,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Button } from "@/components/ui/Button";
import {
  fetchStudentCoursesPageData,
  type StudentCoursesPageData,
  type StudentCourseDetail,
} from "@/lib/dashboard/student-overview";
import { StudentDashboardLayout } from "./StudentDashboardLayout";
import { studentPanel, subjectInitials, subjectColor, formatTimeRange, st } from "./student-ui";
import { StudentTabBar } from "./StudentTabBar";
import { mobile } from "@/lib/mobile/tokens";
import { OverviewEmptyState } from "@/components/dashboard/overview/OverviewPrimitives";
import { cn } from "@/lib/utils";

type Tab = "all" | "active" | "completed";

function DonutChart({ percent, size = 120 }: { percent: number; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className={st.donutTrack}
        stroke="currentColor"
        strokeWidth="10"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className={st.donutFill}
        stroke="currentColor"
        strokeWidth="10"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

function CourseCard({ course, locale }: { course: StudentCourseDetail; locale: string }) {
  const { t } = useTranslation();
  const color = subjectColor(course.subjectName);
  const initials = subjectInitials(course.subjectName);

  return (
    <div className={studentPanel("p-5")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-foreground">
              {[course.subjectName, course.className, course.semester != null ? `${course.semester}. Semester` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {course.teacherName && <p className="text-sm text-text-muted">{course.teacherName}</p>}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted/80">
                  {t("studentDashboard.progressLabel", { defaultValue: "Fortschritt" })}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold text-[#D4AF37]">{course.progressPercent}%</span>
                  <div className={st.progressTrackMd}>
                    <div className={st.progressBar} style={{ width: `${course.progressPercent}%` }} />
                  </div>
                </div>
                {course.lessonCount > 0 && (
                  <p className="mt-1 text-xs text-text-muted/80">
                    {t("studentDashboard.modulesCompleted", {
                      completed: course.completedLessons,
                      total: course.lessonCount,
                      defaultValue: `${course.completedLessons} von ${course.lessonCount} Modulen`,
                    })}
                  </p>
                )}
              </div>
              {course.nextLesson && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted/80">
                    {t("studentDashboard.nextAppointment")}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-text-muted/80" />
                    {new Date(course.nextLesson.start_time).toLocaleDateString(locale, {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="h-3 w-3" />
                    {formatTimeRange(course.nextLesson.start_time, course.nextLesson.duration, locale)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 border-t border-border-default pt-4 sm:flex-row sm:flex-wrap sm:items-center lg:border-0 lg:pt-0">
          <Button variant="outline" size="sm" href="/dashboard/student/courses" className="w-full sm:w-auto">
            {t("studentDashboard.openCourse", { defaultValue: "Open course" })}
          </Button>
          <Link
            href="/dashboard/student/courses"
            className="flex w-full items-center justify-center gap-1 text-sm font-medium text-[var(--brand-gold)] hover:underline sm:w-auto sm:justify-start"
          >
            {t("studentDashboard.courseDetails", { defaultValue: "Course details" })}
            <ChevronRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            className={cn(st.iconBtn, "self-end sm:ml-auto lg:self-center")}
            aria-label="More"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function StudentCoursesExperience() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentCoursesPageData | null>(null);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    fetchStudentCoursesPageData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const title = t("studentDashboard.nav.courses");
  const description = t("studentDashboard.coursesDesc", {
    defaultValue: "Find all your courses, learning progress, and important information here.",
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (tab === "active") return data.courses.filter((c) => c.status === "active");
    if (tab === "completed") return data.courses.filter((c) => c.status === "completed");
    return data.courses;
  }, [data, tab]);

  if (loading) {
    return (
      <StudentDashboardLayout title={title} description={description}>
        <LoadingBlock />
      </StudentDashboardLayout>
    );
  }

  if (!data) {
    return (
      <StudentDashboardLayout title={title} description={description}>
        <p className="text-center text-text-muted">{t("studentDashboard.signInRequired")}</p>
      </StudentDashboardLayout>
    );
  }

  const headerAction = (
    <Button variant="outline" size="sm" href="/dashboard/student/appointments" className="w-full gap-2 sm:w-auto">
      <Calendar className="h-4 w-4" />
      {t("studentDashboard.goToAppointments", { defaultValue: "Go to my appointments" })}
    </Button>
  );

  const { progressBreakdown, overallProgress } = data;
  const continueCourse =
    filtered.find((c) => c.progressPercent > 0 && c.progressPercent < 100) ?? filtered[0];

  return (
    <StudentDashboardLayout title={title} description={description} headerAction={headerAction}>
      <div className={cn(st.pageGrid, "pb-24 md:pb-0")}>
        <div className={cn(st.mainColumn, "space-y-6")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <StudentTabBar
              tabs={[
                { id: "all", label: t("studentDashboard.tabAllCourses", { defaultValue: "All courses" }), shortLabel: t("studentDashboard.tabAllShort", { defaultValue: "All" }) },
                { id: "active", label: t("studentDashboard.tabActiveCourses", { defaultValue: "Active courses" }), shortLabel: t("studentDashboard.tabActiveShort", { defaultValue: "Active" }) },
                { id: "completed", label: t("studentDashboard.tabCompletedCourses", { defaultValue: "Completed courses" }), shortLabel: t("studentDashboard.tabDoneShort", { defaultValue: "Done" }) },
              ]}
              active={tab}
              onChange={(id) => setTab(id as Tab)}
              className="flex-1"
            />
            <p className="hidden shrink-0 text-xs text-text-muted md:block">
              {t("studentDashboard.sortBy", { defaultValue: "Sort by: Course name (A–Z)" })}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className={studentPanel("p-4")}>
              <OverviewEmptyState
                icon={BookOpen}
                title={t("studentDashboard.noCoursesUnlocked", {
                  defaultValue: "Noch keine Kurse freigeschaltet.",
                })}
                description={t("studentDashboard.noCoursesUnlockedDesc", {
                  defaultValue: "Entdecke unsere Programme und schalte passende Kurse frei.",
                })}
                actionHref="/programs"
                actionLabel={t("studentDashboard.explorePrograms", { defaultValue: "Programme entdecken" })}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((course) => (
                <CourseCard key={course.enrollmentId} course={course} locale={locale} />
              ))}
            </div>
          )}

          <div className={st.motivationBanner}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Trophy className="h-5 w-5 shrink-0 text-blue-500" />
              <p className="text-sm font-medium text-foreground">
                {t("studentDashboard.keepGoingBanner", {
                  defaultValue: "Keep going! You're making great progress. Stay on track! 💪",
                })}
              </p>
            </div>
          </div>
        </div>

        <aside className={st.asideWidgets}>
          <div className={studentPanel("p-5")}>
            <h3 className="text-sm font-semibold text-foreground">
              {t("studentDashboard.yourLearningProgress", { defaultValue: "Your learning progress" })}
            </h3>
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <div className="relative flex items-center justify-center">
                <DonutChart percent={overallProgress} />
                <span className="absolute text-lg font-bold text-foreground">{overallProgress}%</span>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {t("studentDashboard.legendCompleted", { defaultValue: "Completed" })} ({progressBreakdown.completed})
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                  {t("studentDashboard.legendInProgress", { defaultValue: "In progress" })} ({progressBreakdown.inProgress})
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-surface-subtle ring-1 ring-border-default" />
                  {t("studentDashboard.legendPlanned", { defaultValue: "Planned" })} ({progressBreakdown.planned})
                </li>
              </ul>
            </div>
            <Link href="/dashboard/student/progress" className="mt-4 inline-flex text-xs font-medium text-[#D4AF37] hover:underline">
              {t("studentDashboard.detailedAnalysis", { defaultValue: "Detailed analysis" })}
              <ChevronRight className="ml-0.5 inline h-3.5 w-3.5" />
            </Link>
          </div>

          <div className={studentPanel("p-5")}>
            <h3 className="text-sm font-semibold text-foreground">
              {t("studentDashboard.coursesOverview", { defaultValue: "Courses overview" })}
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-text-muted">{t("studentDashboard.activeCoursesCount", { defaultValue: "Active courses" })}</span>
                <span className="font-semibold text-foreground">{data.activeCount}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-text-muted">{t("studentDashboard.remainingUnits")}</span>
                <span className="font-semibold text-foreground">{data.remainingUnits}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-text-muted">{t("studentDashboard.learnedHours", { defaultValue: "Hours learned" })}</span>
                <span className="font-semibold text-foreground">{data.learnedHours}h</span>
              </li>
            </ul>
          </div>

          <div className={studentPanel("p-5")}>
            <h3 className="text-sm font-semibold text-foreground">
              {t("studentDashboard.helpSupport", { defaultValue: "Help & support" })}
            </h3>
            <ul className="mt-3 divide-y divide-border-default">
              {[
                { href: "/help", icon: HelpCircle, label: t("studentDashboard.helpCenter") },
                { href: "/contact", icon: MessageCircle, label: t("studentDashboard.contactSupport") },
                { href: "/contact", icon: MessageCircle, label: t("studentDashboard.giveFeedback") },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="flex items-center gap-3 py-3 text-sm text-foreground hover:text-[#D4AF37]">
                    <item.icon className="h-4 w-4 text-text-muted/80" />
                    {item.label}
                    <ChevronRight className="ml-auto h-4 w-4 text-text-muted/60" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {continueCourse && (
        <div className={cn(mobile.stickyAction, "md:hidden")}>
          <Button variant="gold" href="/dashboard/student/progress" className="w-full">
            {t("studentDashboard.continueLearning", {
              subject: continueCourse.subjectName,
              defaultValue: `Continue ${continueCourse.subjectName}`,
            })}
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </StudentDashboardLayout>
  );
}
