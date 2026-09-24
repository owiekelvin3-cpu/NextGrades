"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Users,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import { teacherPanel } from "./teacher-ui";

type GroupDetail = {
  group: {
    id: string;
    name: string;
    scheduleNotes: string | null;
    meetingUrl: string | null;
    subject: { id: string; name: string } | null;
    class: { id: string; name: string; level: number | null } | null;
    members: Array<{ id: string; studentId: string; name: string; email: string | null }>;
  };
  nextLesson: {
    id: string;
    startTime: string;
    duration: number;
    title: string;
    zoomLink: string | null;
  } | null;
  schedule: Array<{
    id: string;
    studentId: string;
    startTime: string;
    duration: number;
    title: string;
    zoomLink: string | null;
    status: string;
  }>;
  sessions: Array<{
    startTime: string;
    duration: number;
    title: string;
    zoomLink: string | null;
    lessons: Array<{ lessonId: string; studentId: string; attendance: string | null; status: string }>;
  }>;
  materials: Array<{ id: string; title: string; contentType: string | null; assignedAt: string }>;
  recentAttendance: Array<{
    lessonId: string;
    studentId: string;
    startTime: string;
    attendance: string;
    status: string;
  }>;
};

type AttendanceStatus = "attended" | "excused" | "no_show";

function attendanceBadge(status: string, t: (k: string, o?: Record<string, unknown>) => string) {
  if (status === "attended") return { variant: "success" as const, label: t("teacherDashboard.attendanceAttended", { defaultValue: "Anwesend" }) };
  if (status === "excused") return { variant: "default" as const, label: t("teacherDashboard.attendanceExcused", { defaultValue: "Entschuldigt" }) };
  if (status === "no_show") return { variant: "warning" as const, label: t("teacherDashboard.attendanceNoShow", { defaultValue: "Nicht erschienen" }) };
  return { variant: "default" as const, label: status };
}

export function TeacherGroupDetailExperience() {
  const params = useParams();
  const groupId = params?.id as string;
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GroupDetail | null>(null);
  const [pendingLesson, setPendingLesson] = useState<{
    startTime: string;
    lessons: Array<{ lessonId: string; studentId: string; studentName: string }>;
  } | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/groups/${groupId}`);
      const json = (await res.json()) as GroupDetail & { error?: string };
      if (res.ok) setData(json);
      else setData(null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void load();
  }, [load]);

  const openAttendanceSession = (session: GroupDetail["sessions"][0]) => {
    const lessons = session.lessons
      .map((l) => ({
        lessonId: l.lessonId,
        studentId: l.studentId,
        studentName: memberName(l.studentId),
      }))
      .filter((l) => l.lessonId);

    if (!lessons.length) return;

    const initial: Record<string, AttendanceStatus> = {};
    for (const l of lessons) {
      const att = session.lessons.find((x) => x.lessonId === l.lessonId);
      initial[l.lessonId] = (att?.attendance as AttendanceStatus) ?? "attended";
    }
    setAttendanceMap(initial);
    setPendingLesson({ startTime: session.startTime, lessons });
  };

  const submitAttendance = async () => {
    if (!pendingLesson || !groupId) return;
    setSaving(true);
    try {
      const entries = pendingLesson.lessons.map((l) => ({
        lessonId: l.lessonId,
        attendance: attendanceMap[l.lessonId] ?? "attended",
      }));
      const res = await fetch(`/api/teacher/groups/${groupId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      if (!res.ok) throw new Error("Failed");
      setPendingLesson(null);
      await load();
    } catch {
      /* toast optional */
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.groups")}>
        <LoadingBlock />
      </TeacherDashboardLayout>
    );
  }

  if (!data) {
    return (
      <TeacherDashboardLayout title={t("teacherDashboard.nav.groups")}>
        <div className={`${teacherPanel()} p-10 text-center text-text-muted`}>
          {t("misc.errorGeneric", { defaultValue: "Something went wrong" })}
        </div>
      </TeacherDashboardLayout>
    );
  }

  const { group, nextLesson, sessions, materials } = data;
  const memberName = (id: string) => group.members.find((m) => m.studentId === id)?.name ?? "Student";
  const upcomingSessions = sessions.filter(
    (s) => s.lessons.some((l) => l.status === "scheduled") && new Date(s.startTime) >= new Date()
  );

  return (
    <TeacherDashboardLayout title={group.name}>
      <div className="mx-auto max-w-[1000px] space-y-6">
        <Link
          href="/dashboard/teacher/groups"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#D4AF37] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("teacherDashboard.backToGroups", { defaultValue: "Zurück zu Gruppen" })}
        </Link>

        <div className={teacherPanel("p-5 sm:p-6")}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">{group.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {group.subject?.name && <Badge>{group.subject.name}</Badge>}
                {group.class?.name && <Badge variant="default">{group.class.name}</Badge>}
                <Badge variant="success">
                  {group.members.length} {t("teacherDashboard.groupMembers", { defaultValue: "Mitglieder" })}
                </Badge>
              </div>
            </div>
            {(nextLesson?.zoomLink || group.meetingUrl) && (
              <a
                href={(nextLesson?.zoomLink || group.meetingUrl)!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border-default px-4 py-2 text-sm font-medium hover:border-[#2D8CFF]/40"
              >
                <Video className="h-4 w-4 text-[#2D8CFF]" />
                Zoom
              </a>
            )}
          </div>

          {group.scheduleNotes && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface-subtle px-4 py-3 text-sm text-text-muted">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{group.scheduleNotes}</span>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className={teacherPanel("p-5")}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              {t("teacherDashboard.nextLesson", { defaultValue: "Nächste Stunde" })}
            </h2>
            {nextLesson ? (
              <div className="mt-3 space-y-1">
                <p className="text-lg font-semibold">{nextLesson.title}</p>
                <p className="text-sm text-text-muted">
                  {new Date(nextLesson.startTime).toLocaleString(locale)} · {nextLesson.duration} min
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-text-muted">
                {t("teacherDashboard.noUpcomingLesson", { defaultValue: "Keine anstehende Stunde." })}
              </p>
            )}
          </div>

          <div className={teacherPanel("p-5")}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              {t("teacherDashboard.assignedMaterials", { defaultValue: "Zugewiesene Materialien" })}
            </h2>
            {materials.length === 0 ? (
              <p className="mt-3 text-sm text-text-muted">
                {t("teacherDashboard.noGroupMaterials", { defaultValue: "Noch keine Materialien zugewiesen." })}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {materials.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 text-sm">
                    <ClipboardList className="h-4 w-4 text-text-muted" />
                    <span>{m.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={teacherPanel()}>
          <div className="border-b border-border-default px-5 py-4">
            <h2 className="font-semibold">{t("teacherDashboard.groupSchedule", { defaultValue: "Stundenplan" })}</h2>
          </div>
          {upcomingSessions.length === 0 ? (
            <p className="p-5 text-sm text-text-muted">
              {t("teacherDashboard.noScheduledLessons", { defaultValue: "Keine geplanten Stunden." })}
            </p>
          ) : (
            <ul className="divide-y divide-border-default">
              {upcomingSessions.map((session) => (
                <li key={session.startTime} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
                  <div>
                    <p className="font-medium">{session.title}</p>
                    <p className="text-text-muted">
                      {new Date(session.startTime).toLocaleString(locale)} · {session.duration} min ·{" "}
                      {session.lessons.length} {t("teacherDashboard.participants", { defaultValue: "Teilnehmer" })}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openAttendanceSession(session)}>
                    {t("teacherDashboard.markAttendance", { defaultValue: "Anwesenheit" })}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={teacherPanel()}>
          <div className="border-b border-border-default px-5 py-4">
            <h2 className="font-semibold">
              {t("teacherDashboard.recentAttendance", { defaultValue: "Letzte Anwesenheit" })}
            </h2>
          </div>
          {data.recentAttendance.length === 0 ? (
            <p className="p-5 text-sm text-text-muted">
              {t("teacherDashboard.noAttendanceYet", { defaultValue: "Noch keine Anwesenheit erfasst." })}
            </p>
          ) : (
            <ul className="divide-y divide-border-default">
              {data.recentAttendance.slice(-20).reverse().map((a) => {
                const badge = attendanceBadge(a.attendance, t);
                return (
                  <li key={a.lessonId} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                    <span className="font-medium">{memberName(a.studentId)}</span>
                    <span className="text-text-muted">{new Date(a.startTime).toLocaleDateString(locale)}</span>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={teacherPanel()}>
          <div className="border-b border-border-default px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <Users className="h-4 w-4" />
              {t("teacherDashboard.groupMembers", { defaultValue: "Mitglieder" })}
            </h2>
          </div>
          <ul className="divide-y divide-border-default">
            {group.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-medium">{m.name}</span>
                {m.email && <span className="text-text-muted">{m.email}</span>}
              </li>
            ))}
          </ul>
        </div>

        {pendingLesson && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
            <div className={`${teacherPanel()} w-full max-w-lg p-5`}>
              <h3 className="text-lg font-semibold">
                {t("teacherDashboard.markAttendance", { defaultValue: "Anwesenheit erfassen" })}
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                {new Date(pendingLesson.startTime).toLocaleString(locale)}
              </p>
              <ul className="mt-4 space-y-3">
                {pendingLesson.lessons.map((l) => (
                  <li key={l.lessonId} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">{l.studentName}</span>
                    <div className="flex gap-1">
                      {(
                        [
                          ["attended", CheckCircle2, "success"],
                          ["excused", AlertCircle, "default"],
                          ["no_show", XCircle, "warning"],
                        ] as const
                      ).map(([status, Icon, _variant]) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            setAttendanceMap((m) => ({ ...m, [l.lessonId]: status as AttendanceStatus }))
                          }
                          className={`rounded-lg border px-2 py-1 text-xs ${
                            attendanceMap[l.lessonId] === status
                              ? "border-emerald-500 bg-emerald-50 font-semibold"
                              : "border-border-default"
                          }`}
                        >
                          <Icon className="mr-1 inline h-3 w-3" />
                          {attendanceBadge(status, t).label}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPendingLesson(null)}>
                  {t("common.cancel", { defaultValue: "Abbrechen" })}
                </Button>
                <Button variant="gold" disabled={saving} onClick={() => void submitAttendance()}>
                  {t("common.save", { defaultValue: "Speichern" })}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherDashboardLayout>
  );
}
