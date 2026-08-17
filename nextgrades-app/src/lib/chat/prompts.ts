import type { ChatContext, ChatRole } from "./types";
import type { ChatResponseLanguage } from "./languages";

const ROLE_GUIDANCE: Record<ChatRole, string> = {
  student: `You help students learn effectively. You can:
- Explain topics clearly and simply
- Summarize lessons and create revision notes
- Answer homework-style questions with guidance (not just giving answers without explanation)
- Provide study tips and memory techniques
- Break down difficult concepts step by step`,

  teacher: `You help teachers with their work. You can:
- Generate lesson ideas and class activities
- Create assignment prompts and rubric suggestions
- Draft explanations for students at different levels
- Suggest differentiation strategies
- Help structure lesson plans`,

  admin: `You assist platform administrators with operational and educational support tasks, analytics interpretation, and content strategy.`,
};

export function buildSystemPrompt(
  ctx: ChatContext,
  settingsOverride?: string | null,
  responseLanguage: ChatResponseLanguage = "de"
): string {
  if (settingsOverride?.trim()) {
    return settingsOverride.trim();
  }

  const languageRule =
    responseLanguage === "de"
      ? "Always write your replies in German (Deutsch). Use clear, natural German suitable for students and teachers in Austria and Germany. Do not reply in English unless the user writes in English and asks for English."
      : "Always write your replies in English. Use clear, natural English suitable for students and teachers.";

  const parts = [
    `You are NextGrades KI - a smart, friendly educational assistant integrated into the NextGrades learning platform.`,
    `Be conversational, concise, and helpful like a great tutor. Use markdown for structure when helpful.`,
    `When the user attaches files (PDF, Word, text), use the extracted content in their message to answer accurately.`,
    languageRule,
    `If the user explicitly asks you to switch language, follow their request for that message.`,
    ``,
    ROLE_GUIDANCE[ctx.role],
  ];

  if (ctx.userName) parts.push(`\nUser: ${ctx.userName}`);
  if (ctx.subject) parts.push(`Subject: ${ctx.subject}`);
  if (ctx.classLevel) parts.push(`Class/Level: ${ctx.classLevel}`);
  if (ctx.semester) parts.push(`Semester: ${ctx.semester}`);
  if (ctx.topic) parts.push(`Topic: ${ctx.topic}`);

  if (ctx.materialExcerpt) {
    parts.push(
      `\n--- RELEVANT LEARNING MATERIAL ---\nUse this context to answer accurately. If the answer isn't in the material, say so and use general knowledge.\n\n${ctx.materialExcerpt}\n--- END MATERIAL ---`
    );
  }

  parts.push(
    `\nRules: Never invent grades or personal data. For medical/legal advice, recommend consulting a professional. Keep responses focused and educational.`
  );

  return parts.join("\n");
}

export const QUICK_PROMPTS: Record<ChatRole, Record<ChatResponseLanguage, string[]>> = {
  student: {
    de: [
      "Erkläre dieses Thema einfach",
      "Erstelle eine Lernzusammenfassung",
      "Gib mir Lerntipps für dieses Fach",
      "Hilf mir Schritt für Schritt",
      "Quiz mich zu wichtigen Konzepten",
    ],
    en: [
      "Explain this topic in simple terms",
      "Create a revision summary",
      "Give me study tips for this subject",
      "Help me understand this step by step",
      "Quiz me on key concepts",
    ],
  },
  teacher: {
    de: [
      "Erstelle eine Unterrichtsidee",
      "Plane eine Klassenaktivität",
      "Entwirf eine Aufgabe mit Bewertung",
      "Erkläre das für Anfänger",
      "Schlage Differenzierungsstrategien vor",
    ],
    en: [
      "Generate a lesson plan idea",
      "Create a class activity",
      "Draft an assignment with rubric",
      "Explain this for beginners",
      "Suggest differentiation strategies",
    ],
  },
  admin: {
    de: [
      "Fasse Plattform-Trends zusammen",
      "Schlage Content-Verbesserungen vor",
      "Entwirf eine Ankündigung für Nutzer",
      "Erkläre Best Practices für Online-Nachhilfe",
    ],
    en: [
      "Summarize platform usage trends",
      "Suggest content improvements",
      "Draft an announcement for users",
      "Explain best practices for online tutoring",
    ],
  },
};
