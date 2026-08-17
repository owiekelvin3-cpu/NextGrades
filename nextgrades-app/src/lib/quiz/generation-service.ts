import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AiGeneratedFlashcard, AiGeneratedQuestion, Difficulty, QuestionType } from "./types";
import { parseTextFile, calculateDifficulty, validateQuizQuality } from "./generation-utils";
import { generateFlashcards, generateQuestionsByTypes } from "./quizGenerator";

export const GENERATION_MODEL = "rule-based-v1";

export function buildGenerationCacheKey(parts: Record<string, string | number | undefined>): string {
  return Object.entries(parts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v ?? ""}`)
    .join("|");
}

export function hashSourceText(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

export function generateQuizQuestions(params: {
  sourceText: string;
  questionTypes: QuestionType[];
  questionCount: number;
  seed?: number;
}): { questions: AiGeneratedQuestion[]; quality: number; detectedDifficulty: Difficulty } {
  const content = parseTextFile(params.sourceText);
  const count = Math.min(Math.max(params.questionCount, 3), 25);
  const questions = generateQuestionsByTypes(content, params.questionTypes, count, params.seed ?? 0);

  return {
    questions,
    quality: validateQuizQuality(questions),
    detectedDifficulty: calculateDifficulty(content),
  };
}

export function generateFlashcardSet(params: { sourceText: string; count: number }): AiGeneratedFlashcard[] {
  return generateFlashcards(parseTextFile(params.sourceText), Math.min(Math.max(params.count, 5), 30));
}

export async function persistGeneratedQuiz(
  supabase: SupabaseClient,
  opts: {
    materialId: string;
    userId: string;
    title: string;
    topic?: string | null;
    subjectId?: string | null;
    classId?: string | null;
    semester?: number | null;
    difficulty: Difficulty;
    questionTypes: QuestionType[];
    cacheKey: string;
    questions: AiGeneratedQuestion[];
  }
) {
  const { data: quiz, error: quizError } = await supabase
    .from("generated_quizzes")
    .insert({
      material_id: opts.materialId,
      created_by: opts.userId,
      title: opts.title,
      subject_id: opts.subjectId,
      class_id: opts.classId,
      semester: opts.semester,
      topic: opts.topic,
      difficulty: opts.difficulty,
      question_types: opts.questionTypes,
      status: "published",
      is_published: true,
      published_at: new Date().toISOString(),
      generation_cache_key: opts.cacheKey,
      ai_model: GENERATION_MODEL,
      raw_generation: { engine: GENERATION_MODEL, count: opts.questions.length },
    })
    .select()
    .single();

  if (quizError) throw quizError;

  const { error: qError } = await supabase.from("quiz_questions").insert(
    opts.questions.map((q, i) => ({
      quiz_id: quiz.id,
      question_type: q.question_type,
      question_text: q.question_text,
      options: q.options || null,
      correct_answer: q.correct_answer,
      explanation: q.explanation || null,
      points: q.points ?? 1,
      sort_order: i + 1,
    }))
  );
  if (qError) throw qError;
  return quiz.id as string;
}

export async function persistFlashcardSet(
  supabase: SupabaseClient,
  opts: {
    materialId: string;
    userId: string;
    title: string;
    subjectId?: string | null;
    classId?: string | null;
    difficulty: Difficulty;
    cacheKey: string;
    cards: AiGeneratedFlashcard[];
  }
) {
  const { data: set, error: setError } = await supabase
    .from("flashcard_sets")
    .insert({
      material_id: opts.materialId,
      created_by: opts.userId,
      title: opts.title,
      subject_id: opts.subjectId,
      class_id: opts.classId,
      difficulty: opts.difficulty,
      generation_cache_key: opts.cacheKey,
    })
    .select()
    .single();

  if (setError) throw setError;

  const { error: cardsError } = await supabase.from("flashcards").insert(
    opts.cards.map((c, i) => ({
      set_id: set.id,
      front_text: c.front_text,
      back_text: c.back_text,
      sort_order: i + 1,
    }))
  );
  if (cardsError) throw cardsError;
  return set.id as string;
}

export async function logGeneration(
  supabase: SupabaseClient,
  opts: { userId: string; materialId: string; action: string; quizId?: string; metadata?: Record<string, unknown> }
) {
  await supabase.from("ai_generation_logs").insert({
    user_id: opts.userId,
    material_id: opts.materialId,
    quiz_id: opts.quizId ?? null,
    action: opts.action,
    tokens_used: 0,
    model: GENERATION_MODEL,
    metadata: opts.metadata ?? null,
  });
}
