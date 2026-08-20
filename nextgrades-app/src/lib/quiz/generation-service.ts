import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AiGeneratedFlashcard, AiGeneratedQuestion, Difficulty, QuestionType } from "./types";
import { parseTextFile, calculateDifficulty, validateQuizQuality } from "./generation-utils";
import { generateFlashcards, generateQuestionsByTypes } from "./quizGenerator";
import { generateFlashcardsWithAi, generateQuizQuestionsWithAi } from "./ai-generate";

export const GENERATION_MODEL = "groq-ai";

export function buildGenerationCacheKey(parts: Record<string, string | number | undefined>): string {
  return Object.entries(parts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v ?? ""}`)
    .join("|");
}

export function hashSourceText(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

export async function generateQuizQuestions(params: {
  sourceText: string;
  questionTypes: QuestionType[];
  questionCount: number;
  difficulty?: Difficulty;
  topic?: string;
  title?: string;
  seed?: number;
}): Promise<{
  questions: AiGeneratedQuestion[];
  quality: number;
  detectedDifficulty: Difficulty;
  engine: string;
}> {
  const count = Math.min(Math.max(params.questionCount, 3), 25);
  const ai = await generateQuizQuestionsWithAi({
    sourceText: params.sourceText,
    questionTypes: params.questionTypes,
    questionCount: count,
    difficulty: params.difficulty ?? "medium",
    topic: params.topic,
    title: params.title,
  });
  if (ai?.questions.length) {
    return {
      questions: ai.questions,
      quality: validateQuizQuality(ai.questions),
      detectedDifficulty: params.difficulty ?? "medium",
      engine: ai.model,
    };
  }

  const content = parseTextFile(params.sourceText);
  const questions = generateQuestionsByTypes(content, params.questionTypes, count, params.seed ?? 0);
  return {
    questions,
    quality: validateQuizQuality(questions),
    detectedDifficulty: calculateDifficulty(content),
    engine: "rule-based-v1",
  };
}

export async function generateFlashcardSet(params: {
  sourceText: string;
  count: number;
  topic?: string;
  title?: string;
}): Promise<{ cards: AiGeneratedFlashcard[]; engine: string }> {
  const ai = await generateFlashcardsWithAi(params);
  if (ai?.cards.length) return { cards: ai.cards, engine: ai.model };
  return {
    cards: generateFlashcards(parseTextFile(params.sourceText), Math.min(Math.max(params.count, 5), 30)),
    engine: "rule-based-v1",
  };
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
    aiModel?: string;
  }
) {
  const engine = opts.aiModel || GENERATION_MODEL;
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
      ai_model: engine,
      raw_generation: { engine, count: opts.questions.length },
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

export async function persistManualQuiz(
  supabase: SupabaseClient,
  opts: {
    userId: string;
    title: string;
    description?: string | null;
    topic?: string | null;
    subjectId?: string | null;
    difficulty: Difficulty;
    timeLimitMinutes?: number | null;
    publish: boolean;
    questions: AiGeneratedQuestion[];
  }
) {
  const published = opts.publish;
  const { data: quiz, error: quizError } = await supabase
    .from("generated_quizzes")
    .insert({
      material_id: null,
      created_by: opts.userId,
      title: opts.title,
      description: opts.description || null,
      subject_id: opts.subjectId || null,
      topic: opts.topic || null,
      difficulty: opts.difficulty,
      question_types: [...new Set(opts.questions.map((q) => q.question_type))],
      status: published ? "published" : "draft",
      is_published: published,
      published_at: published ? new Date().toISOString() : null,
      time_limit_minutes: opts.timeLimitMinutes ?? null,
      ai_model: "manual",
      raw_generation: { engine: "manual", count: opts.questions.length },
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
  opts: {
    userId: string;
    materialId: string;
    action: string;
    quizId?: string;
    metadata?: Record<string, unknown>;
    model?: string;
  }
) {
  await supabase.from("ai_generation_logs").insert({
    user_id: opts.userId,
    material_id: opts.materialId,
    quiz_id: opts.quizId ?? null,
    action: opts.action,
    tokens_used: 0,
    model: opts.model ?? GENERATION_MODEL,
    metadata: opts.metadata ?? null,
  });
}
