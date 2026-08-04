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
import { StudentHeroBand } from "./StudentHeroBand";
import { studentStaggerContainer, studentStaggerItem } from "./student-motion";
import {
  fetchStudentOverviewData,
  getFirstName,
  type StudentOverviewData,
} from "@/lib/dashboard/student-overview";
import {
  fetchCompletedLessonsCount,
  fetchMaterials,
  fetchStudentEnrollments,
  getSessionUserId,
  computeEnrollmentProgress,
} from "@/lib/dashboard/data";
import { getDateLocale } from "@/lib/i18n/locales";
import { st, subjectColor, subjectInitials } from "./student-ui";
import { cn } from "@/lib/utils";

function ProgressRing({ percent, size = 72 }: { percent: number; size?: number }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-surface-subtle"
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
        className="text-[var(--brand-gold)] transition-all duration-700"
      />
    </svg>
  );
}

export function StudentProgressExperience() {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.language);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentOverviewData | null>(null);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [materialCount, setMaterialCount] = useState(0);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);

  useEffect(() => {
    (async () => {
      const overview = await fetchStudentOverviewData();
      setData(overview);

      const uid = await getSessionUserId();
      if (uid) {
        const [enrollments, done, materials] = await Promise.all([
          fetchStudentEnrollments(uid),
          fetchCompletedLessonsCount(uid),
          fetchMaterials({ limit: 100 }),
        ]);
        setEnrollmentProgress(computeEnrollmentProgress(enrollments));
        setCompletedLessons(done);
        setMaterialCount(materials.length);
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

  const firstName = getFirstName(data.profile.fullName);
  const progress = data.overallProgress || enrollmentProgress;

  return (
    <StudentDashboardLayout title={title} description={description}>
      <motion.div
        className="mx-auto flex max-w-6xl flex-col gap-6 md:gap-8"
        variants={studentStaggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={studentStaggerItem}>
          <StudentHeroBand
            firstName={firstName}
            learningGoal={data.learningGoal}
            dateLocale={dateLocale}
            overallProgress={progress}
            compact
          />
        </motion.div>

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
              label={t("dashboardPages.student.appointments.title", { defaultValue: "Lessons completed" })}
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
