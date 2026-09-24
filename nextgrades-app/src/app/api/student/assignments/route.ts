import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";
import { quizDataClient } from "@/lib/quiz/db";
import { isQuizGrantActive } from "@/lib/quiz/access";

export type StudentAssignmentStatus =
  | "open"
  | "in_progress"
  | "submitted"
  | "graded"
  | "completed";

function resolveAssignmentStatus(
  attempt: {
    completed_at: string | null;
    score_percent: number | null;
    teacher_feedback?: string | null;
    teacher_score_percent?: number | null;
  } | null
): StudentAssignmentStatus {
  if (!attempt) return "open";
  if (!attempt.completed_at) return "in_progress";
  const score = attempt.teacher_score_percent ?? attempt.score_percent;
  if (score != null) {
    return score >= 60 ? "completed" : "graded";
  }
  if (attempt.teacher_feedback) return "graded";
  return "submitted";
}

/** Unified assignments list for the student portal (quizzes granted to this student). */
export async function GET() {
  try {
    const supabase = await createClient();
    const { profile, error } = await getAuthProfile(supabase);
    if (!profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["student"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = quizDataClient(supabase);
    const studentId = profile.id;

    const { data: grants, error: grantsError } = await db
      .from("quiz_grants")
      .select("quiz_id, due_date, expires_at")
      .eq("student_id", studentId)
      .eq("status", "active");

    if (grantsError) throw grantsError;

    const activeGrants = (grants ?? []).filter((g) =>
      isQuizGrantActive((g as { expires_at?: string | null }).expires_at)
    );
    const quizIds = activeGrants.map((g) => g.quiz_id as string).filter(Boolean);
    if (!quizIds.length) return NextResponse.json({ assignments: [] });

    const grantByQuiz = new Map(
      activeGrants.map((g) => [
        g.quiz_id as string,
        { dueDate: (g as { due_date?: string | null }).due_date ?? null },
      ])
    );

    const { data: quizzes, error: quizError } = await db
      .from("generated_quizzes")
      .select("id, title, topic, difficulty, time_limit_minutes, subject_id, subjects(name)")
      .eq("is_published", true)
      .in("id", quizIds)
      .order("created_at", { ascending: false });

    if (quizError) throw quizError;

    const { data: attempts, error: attemptsError } = await db
      .from("quiz_attempts")
      .select(
        "id, quiz_id, score_percent, teacher_score_percent, completed_at, created_at, feedback, teacher_feedback"
      )
      .eq("student_id", studentId)
      .in("quiz_id", quizIds)
      .order("created_at", { ascending: false });

    if (attemptsError) throw attemptsError;

    const latestAttemptByQuiz = new Map<string, (typeof attempts)[number]>();
    for (const attempt of attempts ?? []) {
      const qid = attempt.quiz_id as string;
      if (!latestAttemptByQuiz.has(qid)) {
        latestAttemptByQuiz.set(qid, attempt);
      }
    }

    const assignments = (quizzes ?? []).map((q) => {
      const row = q as {
        id: string;
        title: string;
        topic: string | null;
        difficulty: string;
        time_limit_minutes: number | null;
        subject_id: string | null;
        subjects: { name: string } | { name: string }[] | null;
      };
      const subjectEmbed = row.subjects;
      const subjectName = Array.isArray(subjectEmbed)
        ? subjectEmbed[0]?.name
        : subjectEmbed?.name ?? row.topic ?? null;
      const attempt = latestAttemptByQuiz.get(row.id) ?? null;
      const status = resolveAssignmentStatus(attempt);
      const score =
        attempt?.teacher_score_percent ?? attempt?.score_percent ?? null;
      const feedback = attempt?.teacher_feedback ?? attempt?.feedback ?? null;
      const grant = grantByQuiz.get(row.id);

      return {
        id: row.id,
        quizId: row.id,
        title: row.title,
        subjectName,
        dueDate: grant?.dueDate ?? null,
        status,
        score,
        feedback,
        allowRetry: status !== "open" && status !== "in_progress",
        difficulty: row.difficulty,
        timeLimitMinutes: row.time_limit_minutes,
        attemptId: attempt?.id ?? null,
      };
    });

    return NextResponse.json({ assignments });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load assignments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
