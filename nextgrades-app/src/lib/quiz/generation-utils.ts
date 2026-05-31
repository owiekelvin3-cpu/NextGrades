import type { AiGeneratedQuestion } from "./types";
import type { ParsedContent } from "./fileParser";

export function calculateDifficulty(content: ParsedContent): "easy" | "medium" | "hard" {
  const sentences = content.metadata.sentences;
  if (!sentences.length) return "medium";

  const avgLen = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
  const uniqueRatio = new Set(content.text.toLowerCase().split(/\s+/)).size / Math.max(content.wordCount, 1);

  if (avgLen < 15 && uniqueRatio > 0.45) return "easy";
  if (avgLen < 25 && uniqueRatio > 0.3) return "medium";
  return "hard";
}

export function validateQuizQuality(questions: AiGeneratedQuestion[]): number {
  let score = 100;
  if (questions.length < 3) score -= 30;
  if (questions.length < 5) score -= 10;

  for (const q of questions) {
    if (q.question_text.length < 12) score -= 5;
    if (q.question_type === "mcq") {
      if (!q.options || q.options.length !== 4) score -= 8;
      if (!q.options?.includes(q.correct_answer)) score -= 10;
    }
    if (!q.correct_answer?.trim()) score -= 15;
  }

  return Math.max(0, score);
}

export { parseTextFile } from "./fileParser";
