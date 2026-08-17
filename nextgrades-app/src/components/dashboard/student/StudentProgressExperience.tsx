"use client";

import { useEffect, useState } from "react";
import { BookOpen, CalendarDays, FileText, TrendingUp, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Button } from "@/components/ui/Button";
import { StudentDashboardLayout } from "./StudentDashboardLayout";
import { StudentKpiCard, StudentKpiStrip } from "./StudentKpiCard";
import { StudentPanel } from "./StudentPanel";
import { studentStaggerContainer, studentStaggerItem } from "./student-motion";
import {
  fetchStudentOverviewData,
  type StudentOverviewData,
} from "@/lib/dashboard/student-overview";
import { fetchCompletedLessonsCount, getSessionUserId } from "@/lib/dashboard/data";
import { st, subjectColor, subjectInitials } from "./student-ui";
import { cn } from "@/lib/utils";

function ProgressRing({
  percent,
  size = 72,
  stroke = 6,
  trackClassName = "text-surface-subtle",
  barClassName = "text-[var(--brand-gold)]",
}: {
  percent: number;
  size?: number;
  stroke?: number;
  trackClassName?: string;
  barClassName?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className={trackClassName}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={cn("transition-all duration-700", barClassName)}
      />
    </svg>
  );
}

export function StudentProgressExperience() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentOverviewData | null>(null);
  const [completedLessons, setCompletedLessons] = useState(0);

  useEffect(() => {
    (async () => {
      const overview = await fetchStudentOverviewData();
      setData(overview);

      const uid = await getSessionUserId();
      if (uid) {
        setCompletedLessons(await fetchCompletedLessonsCount(uid));
      }
      setLoading(false);
    })();
  }, []);

  const title = t("dashboardPages.student.progress.title", { defaultValue: "Progress" });
  const description = t("dashboardPages.student.progress.description", {
    defaultValue: "Track your learning journey across courses and lessons.",
  });

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
        <div className={`${st.panel} mx-auto max-w-md p-10 text-center`}>
          <p className={st.textMuted}>{t("studentDashboard.signInRequired")}</p>
          <Button variant="gold" size="md" href="/login" className="mt-6">
            {t("common.login")}
          </Button>
        </div>
      </StudentDashboardLayout>
    );
  }

  const progress = data.overallProgress;
  const materialCount = data.materials.length;

  return (
    <StudentDashboardLayout title={title} description={description}>
      <motion.div
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8"
        variants={studentStaggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.section variants={studentStaggerItem} className="student-hero p-6 sm:p-8">
          <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <p className="student-eyebrow">{t("studentDashboard.nav.progress")}</p>
              <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
                {t("studentDashboard.progressHeroTitle", { defaultValue: "Your learning progress" })}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
                {t("studentDashboard.progressHeroDesc", {
                  defaultValue: "See how far you have come in your courses, lessons, and quizzes.",
                })}
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button variant="gold" size="md" href="/dashboard/student/courses" className="justify-center">
                  <BookOpen className="mr-1.5 h-4 w-4" />
                  {t("studentDashboard.continueLearning", { subject: "", defaultValue: "Continue learning" })}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  href="/dashboard/student/quizzes"
                  className="justify-center border-white/20 bg-white/10 text-white hover:bg-white/15"
                >
                  {t("studentDashboard.goToTasks")}
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="flex items-center gap-5 rounded-2xl border border-white/12 bg-white/8 px-6 py-5 backdrop-blur-sm">
                <div className="relative flex h-[8.5rem] w-[8.5rem] items-center justify-center">
                  <ProgressRing
                    percent={progress}
                    size={136}
                    stroke={10}
                    trackClassName="text-white/15"
                    barClassName="text-[var(--brand-gold)]"
                  />
                  <div className="absolute text-center">
                    <p className="text-3xl font-bold text-white">{progress}%</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                      {t("studentDashboard.totalProgress")}
                    </p>
                  </div>
                </div>
                <div className="hidden min-w-[9rem] space-y-3 sm:block">
                  <div>
                    <p className="text-2xl font-bold text-white">{completedLessons}</p>
                    <p className="text-xs text-white/65">{t("studentDashboard.progressLessonsDone")}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{data.courses.length}</p>
                    <p className="text-xs text-white/65">{t("studentDashboard.myCourses")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.div variants={studentStaggerItem}>
          <StudentKpiStrip>
            <StudentKpiCard
              label={t("studentDashboard.totalProgress")}
              value={`${progress}%`}
              icon={TrendingUp}
              href="/dashboard/student/courses"
              footer={
                <div className={st.progressTrack}>
                  <div className={st.progressBar} style={{ width: `${progress}%` }} />
                </div>
              }
            />
            <StudentKpiCard
              label={t("studentDashboard.progressLessonsDone")}
              value={completedLessons}
              icon={CalendarDays}
              accent="emerald"
              href="/dashboard/student/appointments"
            />
            <StudentKpiCard
              label={t("studentDashboard.myCourses")}
              value={data.courses.length}
              icon={BookOpen}
              accent="navy"
              href="/dashboard/student/courses"
            />
            <StudentKpiCard
              label={t("studentDashboard.newMaterials")}
              value={materialCount}
              icon={FileText}
              accent="violet"
              href="/dashboard/student/resources"
            />
          </StudentKpiStrip>
        </motion.div>

        <motion.div variants={studentStaggerItem} className="grid gap-5 lg:grid-cols-5">
          <StudentPanel
            className="lg:col-span-3"
            title={t("studentDashboard.myCourses")}
            icon={BookOpen}
            href="/dashboard/student/courses"
            linkLabel={t("studentDashboard.toMyCourses")}
            noPadding
          >
            {data.courses.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className={st.empty}>{t("studentDashboard.noCourses")}</p>
                <Button variant="gold" size="sm" href="/programs" className="mt-4">
                  {t("home.explorePrograms", { defaultValue: "Explore programs" })}
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border-default">
                {data.courses.map((course) => {
                  const color = subjectColor(course.subjectName);
                  return (
                    <li key={course.enrollmentId} className="flex items-center gap-4 px-5 py-4">
                      <div className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center">
                        <ProgressRing percent={course.progressPercent} size={72} />
                        <span className="absolute text-sm font-bold text-foreground">{course.progressPercent}%</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">{course.subjectName}</p>
                            {course.teacherName ? (
                              <p className={cn("text-xs", st.textMuted)}>{course.teacherName}</p>
                            ) : null}
                          </div>
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                            style={{ backgroundColor: color }}
                          >
                            {subjectInitials(course.subjectName)}
                          </span>
                        </div>
                        <div className={cn("mt-2", st.progressTrackMd)}>
                          <div className={st.progressBar} style={{ width: `${course.progressPercent}%` }} />
                        </div>
                        <p className={cn("mt-1.5 text-xs", st.textSubtle)}>
                          {t("studentDashboard.lessonUnits", { count: course.lessonCount })}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </StudentPanel>

          <StudentPanel
            className="lg:col-span-2"
            title={t("studentDashboard.yourGoal")}
            icon={Target}
            href="/dashboard/student/settings"
            linkLabel={t("studentDashboard.editGoal")}
          >
            <div className="p-5">
              <p className="text-sm leading-relaxed text-foreground">
                {data.learningGoal || t("studentDashboard.noGoalSet")}
              </p>
              <div className={cn("mt-5 rounded-xl p-4", st.motivationBanner)}>
                <p className="text-sm font-medium text-foreground">{t("studentDashboard.progressKeepGoing")}</p>
                <p className={cn("mt-1 text-xs", st.textMuted)}>{t("studentDashboard.progressHint")}</p>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button variant="gold" size="sm" href="/dashboard/student/quizzes">
                  {t("studentDashboard.goToTasks")}
                </Button>
                <Button variant="secondary" size="sm" href="/dashboard/student/resources">
                  {t("studentDashboard.allMaterials")}
                </Button>
              </div>
            </div>
          </StudentPanel>
        </motion.div>
      </motion.div>
    </StudentDashboardLayout>
  );
}
