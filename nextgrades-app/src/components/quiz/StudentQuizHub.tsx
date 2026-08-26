"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { useToast } from "@/context/ToastContext";
import { useTranslation } from "react-i18next";
import { Brain, History, Play, RotateCcw } from "lucide-react";
import type { QuizQuestion } from "@/lib/quiz/types";

type PublishedQuiz = {
  id: string;
  title: string;
  description?: string | null;
  difficulty: string;
  time_limit_minutes: number | null;
  topic?: string | null;
  subject_name?: string | null;
  quiz_questions?: { count: number }[];
};

type AttemptRow = {
  id: string;
  quiz_id: string;
  score_percent: number | null;
  completed_at: string | null;
  created_at: string;
  feedback?: string | null;
  teacher_feedback?: string | null;
  generated_quizzes?: { title: string; topic?: string | null };
};

type QuizDisplayStatus = "open" | "in_progress" | "submitted" | "graded" | "completed";

function questionCount(quiz: PublishedQuiz): number | null {
  const embed = quiz.quiz_questions;
  if (!Array.isArray(embed) || embed.length === 0) return null;
  const first = embed[0] as { count?: number };
  if (first && typeof first === "object" && "count" in first) {
    return Number(first.count ?? 0);
  }
  return embed.length;
}

function resolveQuizStatus(attempt: AttemptRow | undefined): QuizDisplayStatus {
  if (!attempt) return "open";
  if (!attempt.completed_at) return "in_progress";
  if (attempt.score_percent != null) return "graded";
  return "submitted";
}

function statusLabel(
  status: QuizDisplayStatus,
  t: (key: string, opts?: Record<string, string>) => string
): string {
  switch (status) {
    case "in_progress":
      return t("studentDashboard.quizStatusInProgress", { defaultValue: "In Bearbeitung" });
    case "submitted":
      return t("studentDashboard.quizStatusSubmitted", { defaultValue: "Abgegeben" });
    case "graded":
      return t("studentDashboard.quizStatusGraded", { defaultValue: "Bewertet" });
    case "completed":
      return t("studentDashboard.quizStatusCompleted", { defaultValue: "Abgeschlossen" });
    default:
      return t("studentDashboard.quizStatusOpen", { defaultValue: "Offen" });
  }
}

function difficultyLabel(
  difficulty: string,
  t: (key: string, opts?: Record<string, string>) => string
): string {
  const key = difficulty.toLowerCase();
  if (key === "easy") return t("studentDashboard.quizDifficultyEasy", { defaultValue: "Leicht" });
  if (key === "hard") return t("studentDashboard.quizDifficultyHard", { defaultValue: "Schwer" });
  return t("studentDashboard.quizDifficultyMedium", { defaultValue: "Mittel" });
}

export function StudentQuizHub() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [tab, setTab] = useState<"available" | "history">("available");
  const [quizzes, setQuizzes] = useState<PublishedQuiz[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<{
    meta: { id: string; title: string; time_limit_minutes: number | null };
    questions: QuizQuestion[];
  } | null>(null);

  const textPrimary = "text-foreground";

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [qRes, aRes] = await Promise.all([
        fetch("/api/quiz/quizzes?published=true"),
        fetch("/api/quiz/attempts"),
      ]);
      if (qRes.ok) {
        const json = await qRes.json();
        setQuizzes(Array.isArray(json) ? json : []);
      } else {
        const json = await qRes.json().catch(() => ({}));
        setLoadError(
          json.error || t("studentDashboard.quizLoadError", { defaultValue: "Quizze konnten nicht geladen werden." })
        );
        setQuizzes([]);
      }
      if (aRes.ok) {
        const json = await aRes.json();
        setAttempts(Array.isArray(json) ? json : []);
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const latestAttemptByQuiz = useMemo(() => {
    const map = new Map<string, AttemptRow>();
    for (const attempt of attempts) {
      if (!attempt.quiz_id) continue;
      const existing = map.get(attempt.quiz_id);
      if (!existing || new Date(attempt.created_at).getTime() > new Date(existing.created_at).getTime()) {
        map.set(attempt.quiz_id, attempt);
      }
    }
    return map;
  }, [attempts]);

  const startQuiz = async (quizId: string) => {
    const res = await fetch(`/api/quiz/quizzes/${quizId}`);
    const data = await res.json();
    if (!res.ok) {
      toast.error(
        data.error || t("studentDashboard.quizStartError", { defaultValue: "Dieses Quiz konnte nicht geöffnet werden." })
      );
      return;
    }
    const questions = (data.quiz_questions || []).sort(
      (a: QuizQuestion, b: QuizQuestion) => a.sort_order - b.sort_order
    ) as QuizQuestion[];
    if (!questions.length) {
      toast.error(t("studentDashboard.quizEmpty", { defaultValue: "Dieses Quiz hat noch keine Fragen." }));
      return;
    }
    setActiveQuiz({
      meta: {
        id: data.id,
        title: data.title,
        time_limit_minutes: data.time_limit_minutes,
      },
      questions,
    });
  };

  if (activeQuiz) {
    return (
      <QuizPlayer
        quiz={activeQuiz.meta}
        questions={activeQuiz.questions}
        onExit={() => {
          setActiveQuiz(null);
          void load();
        }}
      />
    );
  }

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={tab === "available" ? "gold" : "outline"}
          size="sm"
          onClick={() => setTab("available")}
        >
          <Brain className="mr-2 h-4 w-4" />
          {t("studentDashboard.availableQuizzes", { defaultValue: "Verfügbare Quizze" })}
        </Button>
        <Button
          variant={tab === "history" ? "gold" : "outline"}
          size="sm"
          onClick={() => setTab("history")}
        >
          <History className="mr-2 h-4 w-4" />
          {t("studentDashboard.quizHistory", { defaultValue: "Verlauf" })}
        </Button>
      </div>

      {tab === "available" ? (
        loadError ? (
          <EmptyState
            title={t("studentDashboard.quizLoadError", { defaultValue: "Quizze konnten nicht geladen werden." })}
            description={loadError}
          />
        ) : quizzes.length === 0 ? (
          <EmptyState
            title={t("studentDashboard.noQuizzes", { defaultValue: "Noch keine Quizze" })}
            description={t("studentDashboard.noQuizzesDesc", {
              defaultValue: "Sobald deine Lehrkraft ein Quiz veröffentlicht, erscheint es hier.",
            })}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map((q) => {
              const attempt = latestAttemptByQuiz.get(q.id);
              const status = resolveQuizStatus(attempt);
              return (
                <Card key={q.id} className="p-6">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className={`font-bold ${textPrimary}`}>{q.title}</h3>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="gold">{difficultyLabel(q.difficulty, t)}</Badge>
                      <Badge variant={status === "open" ? "warning" : "success"}>
                        {statusLabel(status, t)}
                      </Badge>
                    </div>
                  </div>
                  {(q.topic || q.subject_name) && (
                    <p className="mb-2 text-sm text-text-muted">{q.subject_name || q.topic}</p>
                  )}
                  <p className="mb-4 text-sm text-text-muted">
                    {questionCount(q) != null
                      ? `${questionCount(q)} ${t("studentDashboard.quizQuestions", { defaultValue: "Fragen" })}`
                      : t("studentDashboard.publishedQuiz", { defaultValue: "Veröffentlichtes Quiz" })}
                    {q.time_limit_minutes ? ` · ${q.time_limit_minutes} Min.` : ""}
                    {attempt?.score_percent != null ? ` · ${attempt.score_percent}%` : ""}
                  </p>
                  <Button variant="gold" size="sm" onClick={() => void startQuiz(q.id)}>
                    <Play className="mr-2 h-4 w-4" />
                    {status === "open"
                      ? t("studentDashboard.quizStart", { defaultValue: "Quiz starten" })
                      : t("studentDashboard.quizRetry", { defaultValue: "Erneut versuchen" })}
                  </Button>
                </Card>
              );
            })}
          </div>
        )
      ) : attempts.length === 0 ? (
        <EmptyState
          title={t("studentDashboard.quizNoAttempts", { defaultValue: "Noch keine Versuche" })}
          description={t("studentDashboard.quizNoAttemptsDesc", {
            defaultValue: "Schließe ein Quiz ab, um deinen Verlauf zu sehen.",
          })}
        />
      ) : (
        <div className="space-y-3">
          {attempts.map((a) => {
            const status = resolveQuizStatus(a);
            const feedback = a.teacher_feedback || a.feedback;
            return (
              <Card key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`font-semibold ${textPrimary}`}>
                      {a.generated_quizzes?.title ??
                        t("studentDashboard.publishedQuiz", { defaultValue: "Quiz" })}
                    </p>
                    <Badge variant={status === "in_progress" ? "warning" : "success"}>
                      {statusLabel(status, t)}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-muted">
                    {a.completed_at
                      ? new Date(a.completed_at).toLocaleString(i18n.language?.startsWith("de") ? "de-AT" : undefined)
                      : t("studentDashboard.quizStatusInProgress", { defaultValue: "In Bearbeitung" })}
                  </p>
                  {feedback ? (
                    <p className="mt-1 text-xs text-text-muted">
                      {t("studentDashboard.quizFeedback", { defaultValue: "Feedback" })}: {feedback}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  {a.score_percent !== null && (
                    <span className="text-2xl font-bold text-[#D4AF37]">{a.score_percent}%</span>
                  )}
                  {a.quiz_id ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void startQuiz(a.quiz_id)}
                      aria-label={t("studentDashboard.quizRetry", { defaultValue: "Erneut versuchen" })}
                    >
                      <RotateCcw className="mr-1.5 h-4 w-4" />
                      {t("studentDashboard.quizRetry", { defaultValue: "Erneut versuchen" })}
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
