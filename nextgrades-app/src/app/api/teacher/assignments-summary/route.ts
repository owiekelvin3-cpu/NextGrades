import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";

/** Open assignments and pending submissions for teacher dashboard. */
export async function GET() {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
  const now = new Date().toISOString();

  try {
    const { data: assignments } = await db
      .from("teacher_student_assignments")
      .select("student_id")
      .eq("teacher_id", teacherId)
      .eq("status", "active");
    const studentIds = [...new Set((assignments ?? []).map((a) => a.student_id as string))];

    const { data: ownQuizzes } = await db
      .from("generated_quizzes")
      .select("id, title, is_published, created_at")
      .eq("created_by", teacherId)
      .order("created_at", { ascending: false });

    const quizIds = (ownQuizzes ?? []).map((q) => q.id as string);

    let openGrants = 0;
    let pendingSubmissions = 0;
    const recentSubmissions: Array<{
      attemptId: string;
      quizTitle: string;
      studentName: string;
      scorePercent: number | null;
      completedAt: string | null;
      createdAt: string;
    }> = [];

    if (quizIds.length && studentIds.length) {
      const { data: grants } = await db
        .from("quiz_grants")
        .select("id, student_id, quiz_id, due_date, expires_at, status")
        .in("quiz_id", quizIds)
        .in("student_id", studentIds)
        .eq("status", "active");

      openGrants = (grants ?? []).filter((g) => {
        const due = (g as { due_date?: string | null; expires_at?: string | null }).due_date
          ?? (g as { expires_at?: string | null }).expires_at;
        return !due || due >= now;
      }).length;

      const { data: attempts } = await db
        .from("quiz_attempts")
        .select(
          `id, quiz_id, student_id, score_percent, completed_at, created_at, teacher_feedback,
           generated_quizzes(title),
           student:profiles!quiz_attempts_student_id_fkey(full_name)`
        )
        .in("quiz_id", quizIds)
        .in("student_id", studentIds)
        .order("created_at", { ascending: false })
        .limit(50);

      pendingSubmissions = (attempts ?? []).filter((a) => a.completed_at && !a.teacher_feedback).length;

      for (const a of attempts ?? []) {
        const row = a as Record<string, unknown>;
        const quiz = row.generated_quizzes as { title?: string } | { title?: string }[] | null;
        const quizTitle = Array.isArray(quiz) ? quiz[0]?.title : quiz?.title;
        const student = row.student as { full_name?: string } | { full_name?: string }[] | null;
        const studentName = Array.isArray(student) ? student[0]?.full_name : student?.full_name;
        recentSubmissions.push({
          attemptId: row.id as string,
          quizTitle: quizTitle ?? "Quiz",
          studentName: studentName?.trim() || "Student",
          scorePercent: row.score_percent as number | null,
          completedAt: row.completed_at as string | null,
          createdAt: row.created_at as string,
        });
      }
    }

    return NextResponse.json({
      openAssignments: openGrants,
      pendingSubmissions,
      quizCount: quizIds.length,
      recentSubmissions: recentSubmissions.slice(0, 8),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load assignments summary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
