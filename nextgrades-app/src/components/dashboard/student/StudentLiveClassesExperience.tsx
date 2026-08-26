"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { BookOpen, User, Clock, GraduationCap } from "lucide-react";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Button } from "@/components/ui/Button";
import {
  fetchAllStudentLessonsForStudent,
} from "@/lib/dashboard/student-overview";
import { fetchStudentUnits, getSessionUserId, type DashboardLesson } from "@/lib/dashboard/data";
import { StudentDashboardLayout } from "./StudentDashboardLayout";
import { studentPanel, formatTimeRange, lessonDateParts, st } from "./student-ui";
import { OverviewEmptyState } from "@/components/dashboard/overview/OverviewPrimitives";
import { cn } from "@/lib/utils";

type Arrangement = {
  key: string;
  subjectName: string;
  teacherName: string;
  totalLessons: number;
  completedLessons: number;
  upcoming: DashboardLesson[];
  nextLesson: DashboardLesson | null;
};

function buildArrangements(lessons: DashboardLesson[]): Arrangement[] {
  const map = new Map<string, DashboardLesson[]>();
  for (const lesson of lessons) {
    if (lesson.status === "cancelled") continue;
    const subject = lesson.subject_name?.trim() || "Unterricht";
    const teacher = lesson.teacher_name?.trim() || "Lehrkraft";
    const key = `${subject}::${teacher}`;
    const list = map.get(key) ?? [];
    list.push(lesson);
    map.set(key, list);
  }

  const now = Date.now();
  return [...map.entries()]
    .map(([key, rows]) => {
      const [subjectName, teacherName] = key.split("::");
      const completedLessons = rows.filter((l) => l.status === "completed").length;
      const upcoming = rows
        .filter((l) => l.status === "scheduled" && new Date(l.start_time).getTime() >= now - 30 * 60_000)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      return {
        key,
        subjectName,
        teacherName,
        totalLessons: rows.length,
        completedLessons,
        upcoming,
        nextLesson: upcoming[0] ?? null,
      };
    })
    .sort((a, b) => {
      const aTime = a.nextLesson ? new Date(a.nextLesson.start_time).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.nextLesson ? new Date(b.nextLesson.start_time).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
}

export function StudentLiveClassesExperience() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const todayLabel = t("dashboardCommon.today", { defaultValue: "Heute" });
  const [arrangements, setArrangements] = useState<Arrangement[]>([]);
  const [units, setUnits] = useState<{ purchased: number; completed: number; remaining: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    void (async () => {
      const uid = await getSessionUserId();
      if (!uid) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      const [all, packageUnits] = await Promise.all([
        fetchAllStudentLessonsForStudent(uid),
        fetchStudentUnits(uid),
      ]);
      setArrangements(buildArrangements(all));
      setUnits(
        packageUnits
          ? {
              purchased: packageUnits.purchased,
              completed: packageUnits.completed,
              remaining: packageUnits.remaining,
            }
          : null
      );
      setLoading(false);
    })();
  }, []);

  const title = t("studentDashboard.liveClasses", { defaultValue: "Mein Unterricht" });
  const description = t("studentDashboard.myTutoringDesc", {
    defaultValue: "Deine aktiven Nachhilfe-Arrangements, Lehrkräfte und verbleibende Einheiten.",
  });

  const packageSummary = useMemo(() => {
    if (!units) return null;
    return t("studentDashboard.unitsBreakdown", {
      defaultValue: "Gekauft {{purchased}} · Absolviert {{completed}} · Übrig {{remaining}}",
      purchased: units.purchased,
      completed: units.completed,
      remaining: units.remaining,
    });
  }, [t, units]);

  return (
    <StudentDashboardLayout title={title} description={description}>
      <div className="mx-auto max-w-3xl space-y-5">
        {!signedIn ? (
          <p className={cn("text-center", st.textMuted)}>{t("studentDashboard.signInRequired")}</p>
        ) : loading ? (
          <LoadingBlock />
        ) : (
          <>
            {units ? (
              <div className={studentPanel("p-5")}>
                <p className={cn("text-sm font-semibold", st.textPrimary)}>
                  {t("studentDashboard.remainingUnits")}
                </p>
                <p className="mt-1 text-3xl font-bold text-[#D4AF37]">{units.remaining}</p>
                <p className={cn("mt-1 text-sm", st.textMuted)}>{packageSummary}</p>
              </div>
            ) : (
              <OverviewEmptyState
                title={t("studentDashboard.noUnitsEmptyTitle", {
                  defaultValue: "Noch kein Unterrichtspaket aktiv.",
                })}
                description={t("studentDashboard.noUnitsEmptyDesc", {
                  defaultValue: "Entdecke unsere Programme und buche deine erste Nachhilfe.",
                })}
                actionHref="/pricing"
                actionLabel={t("studentDashboard.explorePrograms", { defaultValue: "Programme entdecken" })}
              />
            )}

            {arrangements.length === 0 ? (
              <OverviewEmptyState
                title={t("studentDashboard.noTutoringTitle", {
                  defaultValue: "Noch kein aktiver Unterricht.",
                })}
                description={t("studentDashboard.noTutoringDesc", {
                  defaultValue: "Sobald dir eine Lehrkraft zugewiesen ist und Termine geplant sind, siehst du sie hier.",
                })}
                actionHref="/consultation"
                actionLabel={t("studentDashboard.bookLessonCta", { defaultValue: "Stunde buchen" })}
              />
            ) : (
              arrangements.map((item) => {
                const nextParts = item.nextLesson
                  ? lessonDateParts(item.nextLesson.start_time, locale, todayLabel)
                  : null;
                return (
                  <div key={item.key} className={studentPanel("p-5")}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-[#D4AF37]" />
                          <h2 className={cn("text-lg font-bold", st.textPrimary)}>{item.subjectName}</h2>
                        </div>
                        <p className={cn("mt-2 flex items-center gap-1.5 text-sm", st.textMuted)}>
                          <User className="h-3.5 w-3.5" />
                          {t("studentDashboard.teacherLabel", { defaultValue: "Lehrkraft" })}: {item.teacherName}
                        </p>
                        <p className={cn("mt-1 flex items-center gap-1.5 text-sm", st.textMuted)}>
                          <BookOpen className="h-3.5 w-3.5" />
                          {t("studentDashboard.arrangementLessons", {
                            defaultValue: "{{completed}} von {{total}} Stunden abgeschlossen",
                            completed: item.completedLessons,
                            total: item.totalLessons,
                          })}
                        </p>
                        {item.nextLesson && nextParts ? (
                          <p className={cn("mt-1 flex items-center gap-1.5 text-sm", st.textMuted)}>
                            <Clock className="h-3.5 w-3.5" />
                            {t("studentDashboard.nextLessonLabel", { defaultValue: "Nächste Stunde" })}:{" "}
                            {nextParts.full} ·{" "}
                            {formatTimeRange(item.nextLesson.start_time, item.nextLesson.duration, locale)}
                          </p>
                        ) : (
                          <p className={cn("mt-1 text-sm", st.textMuted)}>
                            {t("studentDashboard.noUpcomingInArrangement", {
                              defaultValue: "Keine bevorstehende Stunde geplant.",
                            })}
                          </p>
                        )}
                      </div>
                      <Button variant="gold" size="sm" href="/dashboard/student/appointments" className="shrink-0">
                        {t("studentDashboard.viewLessons", { defaultValue: "Termine ansehen" })}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </StudentDashboardLayout>
  );
}
