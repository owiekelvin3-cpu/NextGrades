import OpenAI from "openai";
import { groqRuntimeModel } from "@/lib/chat/models";
import type { AiGeneratedFlashcard, AiGeneratedQuestion, Difficulty, QuestionType } from "./types";

const ALLOWED_TYPES = new Set<QuestionType>([
  "mcq",
  "true_false",
  "fill_blank",
  "short_answer",
  "exercise",
  "revision",
]);

function groqClient() {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return null;
  return new OpenAI({ apiKey: key, baseURL: "https://api.groq.com/openai/v1" });
}

function messageText(completion: OpenAI.Chat.Completions.ChatCompletion): string {
  const msg = completion.choices[0]?.message as
    | { content?: string | null; reasoning?: string | null }
    | undefined;
  const content = msg?.content?.trim() || "";
  if (content) return content;
  return String(msg?.reasoning || "").trim();
}

async function groqJsonChat(prompt: string, preferredModel: string): Promise<{ text: string; model: string } | null> {
  const client = groqClient();
  if (!client) return null;
  const models = [...new Set([preferredModel, groqRuntimeModel("openai/gpt-oss-20b"), "openai/gpt-oss-20b"])];

  for (const model of models) {
    try {
      const completion = await client.chat.completions.create({
        model,
        temperature: 0.3,
        max_completion_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Du lieferst nur gültiges JSON ohne Markdown." },
          { role: "user", content: prompt },
        ],
      });
      const text = messageText(completion);
      if (text) return { text, model };
    } catch (err) {
      console.warn("[quiz-ai] groq call failed", model, err instanceof Error ? err.message : err);
    }
  }
  return null;
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const text = fenced?.[1]?.trim() ?? trimmed;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("KI-Antwort war kein JSON");
  return JSON.parse(text.slice(start, end + 1)) as unknown;
}

function normalizeQuestion(raw: unknown): AiGeneratedQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as Record<string, unknown>;
  const type = String(q.question_type || "mcq") as QuestionType;
  if (!ALLOWED_TYPES.has(type)) return null;
  const questionText = String(q.question_text || "").trim();
  let correct = String(q.correct_answer || "").trim();
  if (!questionText || !correct) return null;

  let options = Array.isArray(q.options)
    ? q.options.map((o) => String(o).trim()).filter(Boolean)
    : undefined;

  if (type === "true_false") {
    const lower = correct.toLowerCase();
    if (["wahr", "richtig", "true", "yes", "ja"].includes(lower)) correct = "true";
    else if (["falsch", "false", "no", "nein"].includes(lower)) correct = "false";
    else correct = lower.startsWith("t") ? "true" : "false";
    options = undefined;
  }

  if (type === "mcq") {
    if (!options || options.length < 2) return null;
    if (!options.includes(correct)) {
      options = [correct, ...options.filter((o) => o !== correct)].slice(0, 4);
    }
    while (options.length < 4) options.push(`Option ${options.length + 1}`);
    options = options.slice(0, 4);
  }

  return {
    question_type: type,
    question_text: questionText,
    options,
    correct_answer: correct,
    explanation: String(q.explanation || "").trim() || undefined,
    points: typeof q.points === "number" && q.points > 0 ? q.points : 1,
  };
}

function normalizeCards(raw: unknown): AiGeneratedFlashcard[] {
  if (!raw || typeof raw !== "object") return [];
  const cards = (raw as { flashcards?: unknown }).flashcards;
  if (!Array.isArray(cards)) return [];
  return cards
    .map((c) => {
      if (!c || typeof c !== "object") return null;
      const front = String((c as { front_text?: unknown }).front_text || "").trim();
      const back = String((c as { back_text?: unknown }).back_text || "").trim();
      if (!front || !back) return null;
      return { front_text: front, back_text: back };
    })
    .filter((c): c is AiGeneratedFlashcard => Boolean(c));
}

export async function generateQuizQuestionsWithAi(params: {
  sourceText: string;
  questionTypes: QuestionType[];
  questionCount: number;
  difficulty: Difficulty;
  topic?: string;
  title?: string;
}): Promise<{ questions: AiGeneratedQuestion[]; model: string } | null> {
  const types = params.questionTypes.length ? params.questionTypes : ["mcq"];
  const count = Math.min(Math.max(params.questionCount, 3), 25);
  const excerpt = params.sourceText.slice(0, 12000);
  const preferred = groqRuntimeModel("openai/gpt-oss-20b");

  const prompt = `Du bist NextGrades KI, ein Generator für österreichische Schule (Sekundarstufe).
Erzeuge GENAU ${count} Aufgaben auf Deutsch.
Schwierigkeit: ${params.difficulty}.
Erlaubte Fragetypen: ${types.join(", ")}.
Mische die Typen sinnvoll. Jede Frage braucht eine eindeutige correct_answer.
${params.title ? `Titel: ${params.title}\n` : ""}${params.topic ? `Thema: ${params.topic}\n` : ""}
Stoff / Auftrag:
${excerpt || params.topic || params.title || "Allgemeine Schulübung"}

Regeln:
- mcq: genau 4 options, correct_answer muss eine Option sein
- true_false: correct_answer ist "true" oder "false"
- fill_blank: Lücke im Fragetext, correct_answer = das fehlende Wort
- short_answer: kurze erwartete Musterlösung
- exercise: Übungsaufgabe mit Musterlösung als correct_answer
- Erklärungen kurz und hilfreich

JSON-Form:
{"questions":[{"question_type":"mcq","question_text":"...","options":["A","B","C","D"],"correct_answer":"A","explanation":"...","points":1}]}`;

  try {
    const raw = await groqJsonChat(prompt, preferred);
    if (!raw) return null;
    const parsed = extractJson(raw.text) as { questions?: unknown };
    const questions = (Array.isArray(parsed.questions) ? parsed.questions : [])
      .map(normalizeQuestion)
      .filter((q): q is AiGeneratedQuestion => Boolean(q))
      .slice(0, count);
    if (!questions.length) return null;
    return { questions, model: raw.model };
  } catch (err) {
    console.warn("[quiz-ai] generation failed", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function generateFlashcardsWithAi(params: {
  sourceText: string;
  count: number;
  topic?: string;
  title?: string;
}): Promise<{ cards: AiGeneratedFlashcard[]; model: string } | null> {
  const count = Math.min(Math.max(params.count, 5), 30);
  const excerpt = params.sourceText.slice(0, 8000);
  const prompt = `Erzeuge ${count} Karteikarten auf Deutsch für SchülerInnen.
${params.topic ? `Thema: ${params.topic}\n` : ""}Stoff:\n${excerpt || params.title || "Schulstoff"}
JSON: {"flashcards":[{"front_text":"Frage","back_text":"Antwort"}]}`;

  try {
    const raw = await groqJsonChat(prompt, groqRuntimeModel("openai/gpt-oss-20b"));
    if (!raw) return null;
    const cards = normalizeCards(extractJson(raw.text)).slice(0, count);
    if (!cards.length) return null;
    return { cards, model: raw.model };
  } catch (err) {
    console.warn("[quiz-ai] flashcards failed", err instanceof Error ? err.message : err);
    return null;
  }
}
