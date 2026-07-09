/**
 * Lightweight text analysis for rule-based quiz generation.
 * Server-side only - no heavy processing on the client.
 */

export interface ParsedContent {
  text: string;
  wordCount: number;
  metadata: {
    title?: string;
    headings: string[];
    paragraphs: string[];
    sentences: string[];
  };
}

const STOP_WORDS = new Set([
  "that", "this", "with", "from", "have", "been", "were", "they", "their", "which",
  "when", "where", "what", "will", "would", "could", "should", "about", "into",
  "also", "than", "then", "there", "these", "those", "other", "some", "such",
  "only", "very", "just", "more", "most", "much", "many", "each", "every",
  "und", "der", "die", "das", "ein", "eine", "einer", "eines", "sich", "nicht",
  "sind", "wird", "werden", "kann", "können", "haben", "nach", "über", "unter",
]);

/** Parse extracted plain text into structured content for generation. */
export function parseTextFile(content: string): ParsedContent {
  const text = cleanText(content);
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const headings = lines.filter((line) => {
    if (line.startsWith("#")) return true;
    if (line.length < 80 && line === line.toUpperCase() && /[A-Z]/.test(line)) return true;
    if (line.length < 60 && /^[\d.]+\s+/.test(line)) return true;
    return false;
  });

  const paragraphs = lines.filter((line) => line.length >= 50);
  const sentences = splitSentences(text);

  return {
    text,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    metadata: {
      title: headings[0]?.replace(/^#+\s*/, "") || lines[0]?.slice(0, 120),
      headings,
      paragraphs,
      sentences,
    },
  };
}

export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitSentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]+/g) || [])
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 4);
}

/** Frequency-based keyword extraction - O(n) single pass. */
export function extractKeywords(text: string, limit = 20): string[] {
  const words = text.toLowerCase().match(/\b[\p{L}]{4,}\b/gu) || [];
  const frequency: Record<string, number> = {};

  for (const word of words) {
    if (STOP_WORDS.has(word)) continue;
    frequency[word] = (frequency[word] || 0) + 1;
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

export function extractQuestionSentences(
  sentences: string[],
  minWords = 5,
  maxWords = 35
): string[] {
  return sentences.filter((s) => {
    const n = s.split(/\s+/).length;
    return n >= minWords && n <= maxWords;
  });
}

export function isDefinitionSentence(sentence: string): boolean {
  return [
    /\bis\s+(?:defined\s+as|called|known\s+as|referred\s+to)\s+/i,
    /\bmeans?\s+/i,
    /\brefers\s+to\s+/i,
    /\b(?:can\s+be\s+)?defined\s+as\s+/i,
    /\bbeschreibt\s+/i,
    /\bbezeichnet\s+/i,
    /\bist\s+(?:definiert\s+als|ein|eine)\s+/i,
  ].some((p) => p.test(sentence));
}

export function isFactSentence(sentence: string): boolean {
  return (
    /\d+/.test(sentence) ||
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)\b/i.test(
      sentence
    )
  );
}

export function isExerciseSentence(sentence: string): boolean {
  return (
    /\d+/.test(sentence) &&
    /\b(calculate|compute|solve|find|determine|berechnen|lösen|bestimmen)\b/i.test(sentence)
  );
}

/** Build true/false pairs - half true statements, half plausible false variants. */
export function extractTrueFalseQuestions(
  sentences: string[]
): Array<{ statement: string; isTrue: boolean }> {
  const candidates = extractQuestionSentences(sentences, 6, 30).filter(
    (s) => isFactSentence(s) || isDefinitionSentence(s)
  );

  const results: Array<{ statement: string; isTrue: boolean }> = [];

  for (const sentence of candidates) {
    results.push({ statement: sentence.trim(), isTrue: true });
    const falseVariant = createFalseVariant(sentence);
    if (falseVariant && falseVariant !== sentence.trim()) {
      results.push({ statement: falseVariant, isTrue: false });
    }
  }

  return results;
}

function createFalseVariant(sentence: string): string | null {
  const trimmed = sentence.trim();

  const numberMatch = trimmed.match(/\b(\d+)\b/);
  if (numberMatch) {
    const n = parseInt(numberMatch[1], 10);
    const altered = n + (n % 2 === 0 ? 1 : 2);
    return trimmed.replace(numberMatch[0], String(altered));
  }

  if (/\b(is|are|was|were|ist|sind|war|waren)\b/i.test(trimmed)) {
    return trimmed.replace(/\b(is|are|was|were|ist|sind|war|waren)\b/i, (m) => `${m} not`);
  }

  if (/\b(always|never|all|none|jeder|nie|immer|alle|kein)\b/i.test(trimmed)) {
    const swaps: Record<string, string> = {
      always: "never",
      never: "always",
      all: "none",
      none: "all",
      immer: "nie",
      nie: "immer",
      jeder: "kein",
      kein: "jeder",
    };
    for (const [from, to] of Object.entries(swaps)) {
      const re = new RegExp(`\\b${from}\\b`, "i");
      if (re.test(trimmed)) return trimmed.replace(re, to);
    }
  }

  const words = trimmed.split(/\s+/);
  if (words.length >= 8) {
    const mid = Math.floor(words.length / 2);
    [words[mid], words[mid + 1]] = [words[mid + 1], words[mid]];
    return words.join(" ");
  }

  return null;
}

export function extractFillInBlankQuestions(
  sentences: string[],
  keywords: string[]
): Array<{ question: string; answer: string }> {
  const questions: Array<{ question: string; answer: string }> = [];
  const used = new Set<string>();

  for (const sentence of extractQuestionSentences(sentences, 8, 30)) {
    for (const keyword of keywords) {
      if (keyword.length < 4) continue;
      const re = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i");
      if (!re.test(sentence)) continue;

      const key = `${sentence.slice(0, 40)}:${keyword}`;
      if (used.has(key)) continue;
      used.add(key);

      questions.push({
        question: sentence.replace(re, "_____"),
        answer: keyword,
      });
      break;
    }
  }

  return questions;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
