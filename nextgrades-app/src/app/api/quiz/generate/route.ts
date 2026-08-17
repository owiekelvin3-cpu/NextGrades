import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";
import type { Difficulty, QuestionType } from "@/lib/quiz/types";
import { quizDataClient } from "@/lib/quiz/db";
import {
  buildGenerationCacheKey,
  generateFlashcardSet,
  generateQuizQuestions,
  hashSourceText,
  logGeneration,
  persistFlashcardSet,
  persistGeneratedQuiz,
} from "@/lib/quiz/generation-service";

export const runtime = "nodejs";
export const maxDuration = 30;

type GenerateBody = {
  materialId: string;
  mode?: "quiz" | "flashcards";
  topic?: string;
  difficulty?: Difficulty;
  questionTypes?: QuestionType[];
  questionCount?: number;
  flashcardCount?: number;
  title?: string;
  forceRefresh?: boolean;
};

async function updateJob(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobId: string,
  patch: Record<string, unknown>
) {
  await supabase.from("quiz_generation_jobs").update(patch).eq("id", jobId);
}

export async function POST(request: Request) {
  let jobId: string | null = null;
  const supabase = await createClient();
  const db = quizDataClient(supabase);

  try {
    const { user, profile, error } = await getAuthProfile(supabase);
    if (!user || !profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["teacher", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as GenerateBody;
    const {
      materialId,
      mode = "quiz",
      topic,
      difficulty = "medium",
      questionTypes = ["mcq"],
      questionCount = 10,
      flashcardCount = 15,
      title,
      forceRefresh = false,
    } = body;

    if (!materialId) {
      return NextResponse.json({ error: "materialId is required" }, { status: 400 });
    }

    const { data: material, error: matError } = await db
      .from("uploaded_materials")
      .select("*")
      .eq("id", materialId)
      .single();

    if (matError || !material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    if (profile.role === "teacher" && material.uploaded_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (material.extraction_status !== "ready" || !material.extracted_text?.trim()) {
      return NextResponse.json({ error: "Material text is not ready for generation" }, { status: 400 });
    }

    const textHash = hashSourceText(material.extracted_text);
    const seed = forceRefresh ? Date.now() % 100000 : 0;
    const cacheKey = buildGenerationCacheKey({
      engine: "rule-based-v1",
      mode,
      materialId,
      textHash,
      difficulty,
      questionCount,
      flashcardCount,
      types: questionTypes.join(","),
      seed: forceRefresh ? seed : undefined,
    });

    const { data: job, error: jobError } = await db
      .from("quiz_generation_jobs")
      .insert({
        user_id: user.id,
        material_id: materialId,
        mode,
        status: "processing",
        params: { difficulty, questionTypes, questionCount, flashcardCount, forceRefresh },
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError || !job?.id) throw jobError ?? new Error("Failed to create generation job");
    const activeJobId = job.id;
    jobId = activeJobId;

    if (mode === "flashcards") {
      const { data: cachedSet } = await db
        .from("flashcard_sets")
        .select("*, flashcards(*)")
        .eq("generation_cache_key", cacheKey)
        .maybeSingle();

      if (cachedSet && !forceRefresh) {
        await updateJob(db, activeJobId, {
          status: "completed",
          result_flashcard_set_id: cachedSet.id,
          completed_at: new Date().toISOString(),
        });
        return NextResponse.json({ cached: true, jobId: activeJobId, flashcardSet: cachedSet });
      }

      const cards = generateFlashcardSet({
        sourceText: material.extracted_text,
        count: Math.min(Math.max(flashcardCount, 5), 30),
      });

      if (!cards.length) {
        throw new Error("Could not generate flashcards from this material. Add more content.");
      }

      const setId = await persistFlashcardSet(db, {
        materialId,
        userId: user.id,
        title: title || `Flashcards: ${material.title}`,
        subjectId: material.subject_id,
        classId: material.class_id,
        difficulty,
        cacheKey,
        cards,
      });

      await logGeneration(db, {
        userId: user.id,
        materialId,
        action: "generate_flashcards",
        metadata: { count: cards.length, jobId: activeJobId },
      });

      const { data: full } = await db
        .from("flashcard_sets")
        .select("*, flashcards(*)")
        .eq("id", setId)
        .single();

      await updateJob(db, activeJobId, {
        status: "completed",
        result_flashcard_set_id: setId,
        completed_at: new Date().toISOString(),
      });

      return NextResponse.json({ cached: false, jobId: activeJobId, flashcardSet: full });
    }

    const { data: cachedQuiz } = await db
      .from("generated_quizzes")
      .select("*, quiz_questions(*)")
      .eq("generation_cache_key", cacheKey)
      .maybeSingle();

    if (cachedQuiz && !forceRefresh) {
      await updateJob(db, activeJobId, {
        status: "completed",
        result_quiz_id: cachedQuiz.id,
        completed_at: new Date().toISOString(),
      });
      return NextResponse.json({ cached: true, jobId: activeJobId, quiz: cachedQuiz });
    }

    const { questions, quality } = generateQuizQuestions({
      sourceText: material.extracted_text,
      questionTypes,
      questionCount: Math.min(Math.max(questionCount, 3), 25),
      seed,
    });

    if (!questions.length) {
      throw new Error("Could not generate questions from this material. Try different types or add more text.");
    }

    if (quality < 40) {
      throw new Error("Generated quiz quality too low. Upload richer lesson content and try again.");
    }

    const quizId = await persistGeneratedQuiz(db, {
      materialId,
      userId: user.id,
      title: title || `Quiz: ${material.title}`,
      topic: topic || material.topic,
      subjectId: material.subject_id,
      classId: material.class_id,
      semester: material.semester,
      difficulty,
      questionTypes,
      cacheKey,
      questions,
    });

    await logGeneration(db, {
      userId: user.id,
      materialId,
      quizId,
      action: "generate_quiz",
      metadata: { quality, count: questions.length, jobId: activeJobId },
    });

    const { data: fullQuiz } = await db
      .from("generated_quizzes")
      .select("*, quiz_questions(*)")
      .eq("id", quizId)
      .single();

    await updateJob(db, activeJobId, {
      status: "completed",
      result_quiz_id: quizId,
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({ cached: false, jobId: activeJobId, quiz: fullQuiz, quality });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    if (jobId) {
      await updateJob(db, jobId, {
        status: "failed",
        error_message: message,
        completed_at: new Date().toISOString(),
      });
    }
    return NextResponse.json({ error: message, jobId }, { status: 500 });
  }
}
