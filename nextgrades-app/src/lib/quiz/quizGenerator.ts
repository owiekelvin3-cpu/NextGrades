/**
 * Rule-Based Quiz Generator - no external AI APIs.
 */

import type { QuestionType, AiGeneratedQuestion, AiGeneratedFlashcard } from "./types";
import {
  type ParsedContent,
  extractKeywords,
  extractQuestionSentences,
  isDefinitionSentence,
  isFactSentence,
  isExerciseSentence,
  extractTrueFalseQuestions,
  extractFillInBlankQuestions,
} from "./fileParser";

function shuffleArray<T>(arr: T[], seed = 0): T[] {
  const copy = [...arr];
  let s = seed || 1;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickDistractors(correct: string, pool: string[], count: number, seed: number): string[] {
  const norm = correct.toLowerCase();
  const candidates = pool.filter((w) => w.toLowerCase() !== norm && w.length >= 3);
  const unique = [...new Set(candidates)];
  const picked = shuffleArray(unique, seed).slice(0, count);
  while (picked.length < count) picked.push(`Alternative ${picked.length + 1}`);
  return picked;
}

function buildMcqOptions(correct: string, keywordPool: string[], seed: number): string[] {
  return shuffleArray([correct, ...pickDistractors(correct, keywordPool, 3, seed + 1)], seed);
}

export function generateMCQQuestions(content: ParsedContent, count: number, seed = 0): AiGeneratedQuestion[] {
  const questions: AiGeneratedQuestion[] = [];
  const keywords = extractKeywords(content.text, 40);
  const sentences = extractQuestionSentences(content.metadata.sentences, 6, 30);

  for (const sentence of sentences.filter(isDefinitionSentence)) {
    if (questions.length >= count) break;
    const keyword = keywords.find((k) => sentence.toLowerCase().includes(k.toLowerCase()));
    if (!keyword) continue;
    questions.push({
      question_type: "mcq",
      question_text: `Which term is defined by: "${sentence.trim()}"?`,
      options: buildMcqOptions(keyword, keywords, seed + questions.length),
      correct_answer: keyword,
      explanation: `The definition refers to "${keyword}".`,
      points: 1,
    });
  }

  for (const sentence of sentences.filter(isFactSentence)) {
    if (questions.length >= count) break;
    const words = sentence.split(/\s+/).filter((w) => w.length > 4);
    const keyWord = words.find((w) => keywords.includes(w.toLowerCase())) || words[Math.floor(words.length / 3)];
    if (!keyWord) continue;
    questions.push({
      question_type: "mcq",
      question_text: sentence.replace(new RegExp(`\\b${keyWord}\\b`, "i"), "_____"),
      options: buildMcqOptions(keyWord, keywords, seed + questions.length + 10),
      correct_answer: keyWord,
      explanation: "Based on the lesson material.",
      points: 1,
    });
  }

  for (let i = questions.length; i < count && i < keywords.length; i++) {
    const keyword = keywords[i];
    const ctx =
      sentences.find((s) => s.toLowerCase().includes(keyword)) ||
      content.metadata.paragraphs[i % Math.max(content.metadata.paragraphs.length, 1)] ||
      content.text.slice(0, 120);
    questions.push({
      question_type: "mcq",
      question_text: `Which keyword best fits this context? "${ctx.trim().slice(0, 160)}"`,
      options: buildMcqOptions(keyword, keywords, seed + i + 20),
      correct_answer: keyword,
      explanation: `"${keyword}" appears frequently in this material.`,
      points: 1,
    });
  }

  return questions.slice(0, count);
}

export function generateTrueFalseQuestions(content: ParsedContent, count: number): AiGeneratedQuestion[] {
  return shuffleArray(extractTrueFalseQuestions(content.metadata.sentences), count)
    .slice(0, count)
    .map((item) => ({
      question_type: "true_false" as const,
      question_text: item.statement,
      correct_answer: item.isTrue ? "true" : "false",
      explanation: item.isTrue ? "This matches the source material." : "This is a modified (false) statement.",
      points: 1,
    }));
}

export function generateFillInBlankQuestions(content: ParsedContent, count: number): AiGeneratedQuestion[] {
  const keywords = extractKeywords(content.text, 30);
  return extractFillInBlankQuestions(content.metadata.sentences, keywords)
    .slice(0, count)
    .map((b) => ({
      question_type: "fill_blank" as const,
      question_text: b.question,
      correct_answer: b.answer,
      explanation: `The missing term is "${b.answer}".`,
      points: 1,
    }));
}

export function generateShortAnswerQuestions(content: ParsedContent, count: number): AiGeneratedQuestion[] {
  const sentences = extractQuestionSentences(content.metadata.sentences, 8, 25);
  const headings = content.metadata.headings;
  return sentences.slice(0, count).map((sentence, i) => ({
    question_type: "short_answer" as const,
    question_text: `Briefly explain: ${sentence.replace(/\.$/, "")}?`,
    correct_answer: sentence.trim(),
    explanation: `Refer to: ${(headings[i % Math.max(headings.length, 1)] || "the material").replace(/^#+\s*/, "")}.`,
    points: 2,
  }));
}

export function generateExerciseQuestions(content: ParsedContent, count: number): AiGeneratedQuestion[] {
  const sentences = [
    ...content.metadata.sentences.filter(isExerciseSentence),
    ...extractQuestionSentences(content.metadata.sentences, 8, 30).filter((s) => /\d+/.test(s)),
  ];
  return sentences.slice(0, count).map((sentence) => ({
    question_type: "exercise" as const,
    question_text: `Work through this problem: ${sentence.trim()}`,
    correct_answer: sentence.trim(),
    explanation: "Compare your solution with the lesson content.",
    points: 2,
  }));
}

export function generateRevisionQuestions(content: ParsedContent, count: number): AiGeneratedQuestion[] {
  const headings = content.metadata.headings.length
    ? content.metadata.headings
    : extractQuestionSentences(content.metadata.sentences, 6, 20).slice(0, count);
  return headings.slice(0, count).map((heading) => ({
    question_type: "revision" as const,
    question_text: `Review and summarize: ${heading.replace(/^#+\s*/, "").replace(/^\d+\.\s*/, "")}`,
    correct_answer: heading.replace(/^#+\s*/, ""),
    explanation: "Revision reinforces key concepts.",
    points: 1,
  }));
}

export function generateFlashcards(content: ParsedContent, count: number): AiGeneratedFlashcard[] {
  const keywords = extractKeywords(content.text, count);
  const sentences = extractQuestionSentences(content.metadata.sentences, 6, 30);
  return keywords.slice(0, count).map((keyword) => ({
    front_text: keyword,
    back_text:
      sentences.find((s) => s.toLowerCase().includes(keyword.toLowerCase()))?.trim() ||
      `Key concept: ${keyword}`,
  }));
}

const GENERATORS: Record<
  QuestionType,
  (content: ParsedContent, count: number, seed?: number) => AiGeneratedQuestion[]
> = {
  mcq: generateMCQQuestions,
  true_false: generateTrueFalseQuestions,
  fill_blank: generateFillInBlankQuestions,
  short_answer: generateShortAnswerQuestions,
  exercise: generateExerciseQuestions,
  revision: generateRevisionQuestions,
};

export function generateQuestionsByTypes(
  content: ParsedContent,
  types: QuestionType[],
  totalCount: number,
  seed = 0
): AiGeneratedQuestion[] {
  const activeTypes = types.length ? types : (["mcq"] as QuestionType[]);
  const perType = Math.max(1, Math.floor(totalCount / activeTypes.length));
  const all: AiGeneratedQuestion[] = [];

  for (let i = 0; i < activeTypes.length; i++) {
    const remaining = totalCount - all.length;
    const count = i === activeTypes.length - 1 ? remaining : Math.min(perType, remaining);
    if (count <= 0) break;
    all.push(...GENERATORS[activeTypes[i]](content, count, seed + i * 100));
  }

  return shuffleArray(all, seed).slice(0, totalCount);
}
