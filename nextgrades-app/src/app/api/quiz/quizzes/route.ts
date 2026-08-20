import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";
import { quizDataClient } from "@/lib/quiz/db";
import { persistManualQuiz } from "@/lib/quiz/generation-service";
import type { AiGeneratedQuestion, Difficulty, QuestionType } from "@/lib/quiz/types";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { profile, error } = await getAuthProfile(supabase);
    if (!profile) return NextResponse.json({ error }, { status: 401 });
    const db = quizDataClient(supabase);

    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";

    if (profile.role === "student") {
      const { data, error: dbError } = await db
        .from("generated_quizzes")
        .select("id, title, description, difficulty, time_limit_minutes, topic, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;
      return NextResponse.json(data || []);
    }

    let query = db
      .from("generated_quizzes")
      .select("*, quiz_questions(count), uploaded_materials(title)")
      .order("created_at", { ascending: false });

    if (profile.role === "teacher") {
      query = query.eq("created_by", profile.id);
    }
    if (publishedOnly) {
      query = query.eq("is_published", true);
    }

    const { data, error: dbError } = await query;
    if (dbError) throw dbError;

    return NextResponse.json(data || []);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load quizzes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type CreateQuestion = {
  question_type?: QuestionType;
  question_text?: string;
  options?: string[] | null;
  correct_answer?: string;
  explanation?: string | null;
  points?: number;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, profile, error } = await getAuthProfile(supabase);
    if (!user || !profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      topic?: string;
      subjectId?: string;
      difficulty?: Difficulty;
      timeLimitMinutes?: number | null;
      publish?: boolean;
      questions?: CreateQuestion[];
    };

    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ error: "Titel ist erforderlich." }, { status: 400 });
    }

    const questions: AiGeneratedQuestion[] = (body.questions ?? [])
      .map((q) => {
        const options = (q.options ?? []).map((o) => o.trim()).filter(Boolean);
        const questionText = q.question_text?.trim() ?? "";
        const correct = q.correct_answer?.trim() ?? "";
        return {
          question_type: (q.question_type || "mcq") as QuestionType,
          question_text: questionText,
          options: options.length ? options : undefined,
          correct_answer: correct,
          explanation: q.explanation?.trim() || undefined,
          points: q.points ?? 1,
        };
      })
      .filter((q) => q.question_text && q.correct_answer);

    if (!questions.length) {
      return NextResponse.json(
        { error: "Mindestens eine Frage mit richtiger Antwort ist erforderlich." },
        { status: 400 }
      );
    }

    const db = quizDataClient(supabase);
    const quizId = await persistManualQuiz(db, {
      userId: user.id,
      title,
      description: body.description?.trim() || null,
      topic: body.topic?.trim() || null,
      subjectId: body.subjectId || null,
      difficulty: body.difficulty ?? "medium",
      timeLimitMinutes: body.timeLimitMinutes ?? null,
      publish: body.publish !== false,
      questions,
    });

    const { data: full } = await db
      .from("generated_quizzes")
      .select("*, quiz_questions(*)")
      .eq("id", quizId)
      .single();

    return NextResponse.json({ quiz: full }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Quiz konnte nicht gespeichert werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
