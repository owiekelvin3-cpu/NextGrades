import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";
import type { AttemptAnswer } from "@/lib/quiz/types";

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;
    const supabase = await createClient();
    const { user, profile, error } = await getAuthProfile(supabase);
    if (!user || !profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["student"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { answers, timeSpentSeconds } = await request.json() as {
      answers: { question_id: string; answer: string }[];
      timeSpentSeconds?: number;
    };

    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .select("*, generated_quizzes(id)")
      .eq("id", attemptId)
      .eq("student_id", user.id)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.completed_at) {
      return NextResponse.json({ error: "Attempt already submitted" }, { status: 400 });
    }

    const { data: questions, error: qError } = await supabase
      .from("quiz_questions")
      .select("id, correct_answer, points")
      .eq("quiz_id", attempt.quiz_id);

    if (qError || !questions?.length) {
      return NextResponse.json({ error: "Quiz questions not found" }, { status: 404 });
    }

    const answerMap = new Map(answers.map((a) => [a.question_id, a.answer]));
    let correct = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const graded: AttemptAnswer[] = questions.map((q: { id: string; correct_answer: string; points: number | null }) => {
      const studentAnswer = answerMap.get(q.id) || "";
      const isCorrect = normalizeAnswer(studentAnswer) === normalizeAnswer(q.correct_answer);
      totalPoints += q.points || 1;
      if (isCorrect) {
        correct += 1;
        earnedPoints += q.points || 1;
      }
      return {
        question_id: q.id,
        answer: studentAnswer,
        is_correct: isCorrect,
      };
    });

    const scorePercent = totalPoints ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    const { data: updated, error: updateError } = await supabase
      .from("quiz_attempts")
      .update({
        completed_at: new Date().toISOString(),
        answers: graded,
        correct_count: correct,
        total_count: questions.length,
        score_percent: scorePercent,
        time_spent_seconds: timeSpentSeconds ?? null,
      })
      .eq("id", attemptId)
      .select("*, generated_quizzes(title)")
      .single();

    if (updateError) throw updateError;

    const quizTitle =
      (updated as { generated_quizzes?: { title?: string } })?.generated_quizzes?.title ?? "Quiz";
    const { notifyQuizSubmitted, notifyGradeReleased } = await import("@/lib/notifications/triggers");
    void notifyQuizSubmitted({
      studentId: attempt.student_id,
      quizTitle,
      attemptId,
    });
    void notifyGradeReleased({
      studentId: attempt.student_id,
      title: quizTitle,
      score: `${scorePercent}%`,
    });

    const { data: fullQuestions } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", attempt.quiz_id)
      .order("sort_order");

    return NextResponse.json({
      attempt: updated,
      questions: fullQuestions,
      graded,
      scorePercent,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Submit failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
