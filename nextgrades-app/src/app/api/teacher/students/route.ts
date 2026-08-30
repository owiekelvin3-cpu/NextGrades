import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { listTeacherAssignments } from "@/lib/teachers/assignments";

type StudentPortalRow = {
  assignmentId: string;
  studentId: string;
  name: string;
  subject: { id: string; name: string } | null;
  class: { id: string; name: string; level: number | null } | null;
  learningGoal: string | null;
  nextLesson: {
    id: string;
    startTime: string;
    title: string | null;
    status: string;
  } | null;
  completedLessons: number;
  remainingCredits: number;
  openAssignments: number;
  progressPercent: number;
  notesPreview: string | null;
};

/** Assigned students for the teacher portal (never includes unassigned students). */
export async function GET() {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;

  try {
    const assignments = await listTeacherAssignments(db, teacherId, { status: "active" });
    if (!assignments.length) {
      return NextResponse.json({ students: [] as StudentPortalRow[] });
    }

    const studentIds = [...new Set(assignments.map((a) => a.student_id))];
    const nowIso = new Date().toISOString();

    const [lessonsRes, unitsRes, notesRes, grantsRes, attemptsRes] = await Promise.all([
      db
        .from("lessons")
        .select("id, student_id, start_time, status, meeting_title")
        .eq("teacher_id", teacherId)
        .in("student_id", studentIds)
        .neq("status", "cancelled")
        .order("start_time", { ascending: true }),
      db
        .from("user_units")
        .select("student_id, remaining_units")
        .in("student_id", studentIds),
      db
        .from("teacher_student_notes")
        .select("student_id, body, pinned, created_at")
        .eq("teacher_id", teacherId)
        .in("student_id", studentIds)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false }),
      db
        .from("quiz_grants")
        .select("student_id, quiz_id, expires_at, status")
        .in("student_id", studentIds)
        .eq("status", "active"),
      db
        .from("quiz_attempts")
        .select("student_id, quiz_id, completed_at")
        .in("student_id", studentIds),
    ]);

    const lessons = lessonsRes.data ?? [];
    const unitByStudent = new Map<string, number>();
    for (const row of unitsRes.data ?? []) {
      unitByStudent.set(row.student_id as string, Number(row.remaining_units ?? 0));
    }

    const notePreviewByStudent = new Map<string, string>();
    for (const row of notesRes.data ?? []) {
      const sid = row.student_id as string;
      if (notePreviewByStudent.has(sid)) continue;
      const body = String(row.body ?? "").trim();
      if (!body) continue;
      notePreviewByStudent.set(sid, body.length > 160 ? `${body.slice(0, 157)}…` : body);
    }

    const grantedQuizByStudent = new Map<string, Set<string>>();
    for (const row of grantsRes.data ?? []) {
      const expires = (row as { expires_at?: string | null }).expires_at;
      if (expires && new Date(expires).getTime() <= Date.now()) continue;
      const sid = row.student_id as string;
      const set = grantedQuizByStudent.get(sid) ?? new Set<string>();
      set.add(row.quiz_id as string);
      grantedQuizByStudent.set(sid, set);
    }

    const completedQuizByStudent = new Map<string, Set<string>>();
    for (const row of attemptsRes.data ?? []) {
      if (!row.completed_at) continue;
      const sid = row.student_id as string;
      const set = completedQuizByStudent.get(sid) ?? new Set<string>();
      set.add(row.quiz_id as string);
      completedQuizByStudent.set(sid, set);
    }

    const nextByStudent = new Map<string, (typeof lessons)[number]>();
    const completedByStudent = new Map<string, number>();
    const openLessonByStudent = new Map<string, number>();
    const totalLessonByStudent = new Map<string, number>();

    for (const lesson of lessons) {
      const sid = lesson.student_id as string;
      totalLessonByStudent.set(sid, (totalLessonByStudent.get(sid) ?? 0) + 1);

      if (lesson.status === "completed" || lesson.status === "no_show") {
        completedByStudent.set(sid, (completedByStudent.get(sid) ?? 0) + 1);
        continue;
      }

      if (lesson.status === "scheduled") {
        openLessonByStudent.set(sid, (openLessonByStudent.get(sid) ?? 0) + 1);
        if (
          lesson.start_time >= nowIso &&
          !nextByStudent.has(sid)
        ) {
          nextByStudent.set(sid, lesson);
        }
      }
    }

    const students: StudentPortalRow[] = assignments.map((a) => {
      const sid = a.student_id;
      const next = nextByStudent.get(sid);
      const completed = completedByStudent.get(sid) ?? 0;
      const total = totalLessonByStudent.get(sid) ?? 0;
      const openLessons = openLessonByStudent.get(sid) ?? 0;
      const grantedQuizzes = grantedQuizByStudent.get(sid)?.size ?? 0;
      const completedQuizzes = [...(grantedQuizByStudent.get(sid) ?? [])].filter((qid) =>
        completedQuizByStudent.get(sid)?.has(qid)
      ).length;
      const openQuizzes = Math.max(0, grantedQuizzes - completedQuizzes);
      const progressPercent =
        total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        assignmentId: a.id,
        studentId: sid,
        name: a.student?.full_name?.trim() || "Student",
        subject: a.subject,
        class: a.class,
        learningGoal: a.student?.learning_goal?.trim() || null,
        nextLesson: next
          ? {
              id: next.id as string,
              startTime: next.start_time as string,
              title: (next.meeting_title as string | null) ?? null,
              status: next.status as string,
            }
          : null,
        completedLessons: completed,
        remainingCredits: unitByStudent.get(sid) ?? 0,
        openAssignments: openLessons + openQuizzes,
        progressPercent,
        notesPreview: notePreviewByStudent.get(sid) ?? (a.notes?.trim() || null),
      };
    });

    return NextResponse.json({ students });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load students";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
