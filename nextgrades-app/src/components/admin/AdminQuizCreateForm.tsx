"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { themeInputClass, themeSelectClass } from "@/lib/theme/form-fields";
import { cn } from "@/lib/utils";

type DraftQuestion = {
  question_text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

const emptyQuestion = (): DraftQuestion => ({
  question_text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
});

type Props = {
  onCreated: () => void;
};

export function AdminQuizCreateForm({ onCreated }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [publish, setPublish] = useState(true);
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [generating, setGenerating] = useState(false);

  const canSave = useMemo(
    () => title.trim().length > 0 && questions.some((q) => q.question_text.trim() && q.options[0].trim()),
    [title, questions]
  );

  const updateQuestion = (index: number, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const generateFromText = async (mode: "quiz" | "exercises" = "quiz") => {
    const notes = sourceText.trim();
    if (!notes && !title.trim() && !topic.trim()) {
      toast.error(
        t("adminQuiz.pasteNotesFirst", {
          defaultValue: "Thema, Titel oder Lehrtext angeben, damit die KI Fragen erzeugen kann.",
        })
      );
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText: notes || undefined,
          title: title.trim() || undefined,
          topic: topic.trim() || undefined,
          difficulty,
          questionCount: 10,
          mode,
          forceRefresh: true,
        }),
      });
      const data = (await res.json()) as { error?: string; quiz?: { title?: string } };
      if (!res.ok) throw new Error(data.error || "Generierung fehlgeschlagen");
      toast.success(
        t("adminQuiz.generated", {
          defaultValue: "Quiz erzeugt und veröffentlicht. SchülerInnen sehen es unter Aufgaben.",
        })
      );
      setTitle("");
      setTopic("");
      setDescription("");
      setSourceText("");
      setQuestions([emptyQuestion()]);
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("misc.errorGeneric", { defaultValue: "Etwas ist schiefgelaufen" }));
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    const payloadQuestions = questions
      .map((q) => {
        const options = q.options.map((o) => o.trim()).filter(Boolean);
        return {
          question_type: "mcq" as const,
          question_text: q.question_text.trim(),
          options,
          correct_answer: (q.options[q.correctIndex] || options[0] || "").trim(),
          explanation: q.explanation.trim() || undefined,
        };
      })
      .filter((q) => q.question_text && q.correct_answer && q.options.length >= 2);

    if (!title.trim() || !payloadQuestions.length) {
      toast.error(
        t("adminQuiz.needTitleAndQuestions", {
          defaultValue: "Titel und mindestens eine Multiple-Choice-Frage mit zwei Antworten sind nötig.",
        })
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/quiz/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          topic: topic.trim() || undefined,
          description: description.trim() || undefined,
          difficulty,
          publish,
          questions: payloadQuestions,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Speichern fehlgeschlagen");
      toast.success(
        publish
          ? t("adminQuiz.published", {
              defaultValue: "Quiz veröffentlicht. SchülerInnen sehen es unter Aufgaben.",
            })
          : t("adminQuiz.draftSaved", { defaultValue: "Entwurf gespeichert." })
      );
      setTitle("");
      setTopic("");
      setDescription("");
      setQuestions([emptyQuestion()]);
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("misc.errorGeneric", { defaultValue: "Etwas ist schiefgelaufen" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card hoverable={false} className="overflow-hidden p-0">
      <div className="border-b border-[var(--table-border)] px-5 py-4">
        <h3 className="font-bold text-foreground">
          {t("adminQuiz.createTitle", { defaultValue: "Neues Quiz anlegen" })}
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          {t("adminQuiz.createHint", {
            defaultValue: "Veröffentlichte Quizzes erscheinen bei SchülerInnen unter Aufgaben.",
          })}
        </p>
      </div>
      <div className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("adminQuiz.title", { defaultValue: "Titel" })}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={themeInputClass}
              placeholder="z. B. Englisch: Past Tense"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("adminQuiz.topic", { defaultValue: "Thema" })}
            </label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} className={themeInputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("adminQuiz.difficulty", { defaultValue: "Schwierigkeit" })}
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
              className={themeSelectClass(difficulty)}
            >
              <option value="easy">{t("adminQuiz.easy", { defaultValue: "Leicht" })}</option>
              <option value="medium">{t("adminQuiz.medium", { defaultValue: "Mittel" })}</option>
              <option value="hard">{t("adminQuiz.hard", { defaultValue: "Schwer" })}</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("adminQuiz.description", { defaultValue: "Beschreibung" })}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(themeInputClass, "resize-none")}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
          {t("adminQuiz.publishNow", { defaultValue: "Sofort für SchülerInnen veröffentlichen" })}
        </label>

        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={qi} className="rounded-xl border border-border-default bg-surface-subtle p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {t("adminQuiz.questionN", { defaultValue: "Frage {{n}}", n: qi + 1 })}
                </p>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qi))}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    aria-label={t("adminQuiz.removeQuestion", { defaultValue: "Frage entfernen" })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <input
                value={q.question_text}
                onChange={(e) => updateQuestion(qi, { question_text: e.target.value })}
                className={cn(themeInputClass, "mb-3")}
                placeholder={t("adminQuiz.questionPlaceholder", { defaultValue: "Fragetext" })}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correctIndex === oi}
                      onChange={() => updateQuestion(qi, { correctIndex: oi as 0 | 1 | 2 | 3 })}
                    />
                    <input
                      value={opt}
                      onChange={(e) => {
                        const next = [...q.options] as DraftQuestion["options"];
                        next[oi] = e.target.value;
                        updateQuestion(qi, { options: next });
                      }}
                      className={themeInputClass}
                      placeholder={t("adminQuiz.optionN", { defaultValue: "Antwort {{n}}", n: oi + 1 })}
                    />
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-text-muted">
                {t("adminQuiz.correctHint", { defaultValue: "Die ausgewählte Antwort ist die richtige Lösung." })}
              </p>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
        >
          <Plus className="h-4 w-4" />
          {t("adminQuiz.addQuestion", { defaultValue: "Frage hinzufügen" })}
        </Button>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
            {t("adminQuiz.orGenerate", { defaultValue: "Oder aus Text erzeugen" })}
          </label>
          <textarea
            rows={4}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className={cn(themeInputClass, "resize-y")}
            placeholder={t("adminQuiz.pasteNotes", {
              defaultValue: "Lehrtext einfügen – NextGrades erzeugt Multiple-Choice-Fragen.",
            })}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="gold" disabled={saving || !canSave} className="gap-2" onClick={() => void save()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {t("adminQuiz.saveQuiz", { defaultValue: "Quiz speichern" })}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={generating || (!sourceText.trim() && !title.trim() && !topic.trim())}
            className="gap-2"
            onClick={() => void generateFromText("quiz")}
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("adminQuiz.generateFromText", { defaultValue: "KI-Quiz erzeugen" })}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={generating || (!sourceText.trim() && !title.trim() && !topic.trim())}
            className="gap-2"
            onClick={() => void generateFromText("exercises")}
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("adminQuiz.generateExercises", { defaultValue: "KI-Übungen erzeugen" })}
          </Button>
        </div>
      </div>
    </Card>
  );
}
