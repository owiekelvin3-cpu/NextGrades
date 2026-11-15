import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { isStudentAssignedToTeacher } from "@/lib/teachers/assignments";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const { id: studentId } = await params;
  if (!studentId) {
    return NextResponse.json({ error: "Student id is required." }, { status: 400 });
  }

  const teacherId = gate.auth!.profile!.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;

  try {
    if (gate.auth!.profile!.role !== "admin") {
      const assigned = await isStudentAssignedToTeacher(db, teacherId, studentId);
      if (!assigned) {
        return NextResponse.json({ error: "Student not found." }, { status: 404 });
      }
    }

    // All attempts for this assigned student (teacher-created and admin-unlocked).
    const { data: attempts, error } = await db
      .from("quiz_attempts")
      .select(
        `id, quiz_id, score_percent, teacher_score_percent, completed_at, created_at, teacher_feedback,
         generated_quizzes(id, title, difficulty)`
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const results = (attempts ?? []).map((row) => {
      const quizRaw = row.generated_quizzes as
        | { id: string; title: string; difficulty?: string }
        | { id: string; title: string; difficulty?: string }[]
        | null;
      const quiz = Array.isArray(quizRaw) ? quizRaw[0] : quizRaw;
      const completed = Boolean(row.completed_at);
      const teacherScore =
        row.teacher_score_percent != null ? Number(row.teacher_score_percent) : null;
      const autoScore = row.score_percent != null ? Number(row.score_percent) : null;
      let status: "in_progress" | "submitted" | "graded" = "in_progress";
      if (completed) {
        status = row.teacher_feedback || teacherScore != null ? "graded" : "submitted";
      }
      return {
        id: row.id as string,
        quizId: row.quiz_id as string,
        quizTitle: quiz?.title ?? "Quiz",
        difficulty: quiz?.difficulty ?? null,
        scorePercent: teacherScore ?? autoScore,
        status,
        completedAt: (row.completed_at as string | null) ?? null,
        createdAt: row.created_at as string,
        teacherFeedback: (row.teacher_feedback as string | null) ?? null,
      };
    });

    return NextResponse.json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load quiz results";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
