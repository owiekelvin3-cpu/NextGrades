import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";
import { quizDataClient } from "@/lib/quiz/db";
import { isStudentAssignedToTeacher } from "@/lib/teachers/assignments";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;
    const supabase = await createClient();
    const { user, profile, error } = await getAuthProfile(supabase);
    if (!user || !profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["teacher", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as {
      teacherFeedback?: string;
      teacherScorePercent?: number | null;
    };

    const db = quizDataClient(supabase);

    const { data: attempt, error: fetchError } = await db
      .from("quiz_attempts")
      .select("id, student_id, quiz_id, completed_at, generated_quizzes(created_by)")
      .eq("id", attemptId)
      .single();

    if (fetchError || !attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const quiz = attempt.generated_quizzes as { created_by?: string } | null;
    const ownsQuiz = quiz?.created_by === profile.id;

    if (profile.role === "teacher") {
      if (!ownsQuiz) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const assigned = await isStudentAssignedToTeacher(db, profile.id, attempt.student_id as string);
      if (!assigned) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updates: Record<string, unknown> = {
      teacher_feedback: body.teacherFeedback?.trim() || null,
      teacher_feedback_at: body.teacherFeedback?.trim() ? new Date().toISOString() : null,
      graded_by: user.id,
    };

    if (body.teacherScorePercent != null) {
      const score = Math.min(100, Math.max(0, Math.round(body.teacherScorePercent)));
      updates.teacher_score_percent = score;
      updates.score_percent = score;
    }

    const { data: updated, error: updateError } = await db
      .from("quiz_attempts")
      .update(updates)
      .eq("id", attemptId)
      .select("*, generated_quizzes(id, title)")
      .single();

    if (updateError) throw updateError;
    return NextResponse.json({ attempt: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to grade attempt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
