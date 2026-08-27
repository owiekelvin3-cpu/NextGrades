"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Badge } from "@/components/ui/Badge";
import { TeacherDashboardLayout } from "./TeacherDashboardLayout";
import { teacherPanel } from "./teacher-ui";

type QuizRow = {
  id: string;
  title: string;
  description?: string | null;
  difficulty: string;
  is_published: boolean;
  created_at: string;
  topic?: string | null;
  quiz_questions?: { count: number }[];
};

type AttemptRow = {
  id: string;
  quiz_id: string;
  student_id: string;
  score_percent: number | null;
  completed_at: string | null;
  created_at: string;
  generated_quizzes?: { id: string; title: string; difficulty?: string };
};

function questionCount(quiz: QuizRow): number {
  const embed = quiz.quiz_questions;
  if (!Array.isArray(embed) || embed.length === 0) return 0;
  const first = embed[0] as { count?: number };
  return Number(first?.count ?? 0);
}

export function TeacherAssignmentsExperience() {
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [quizRes, attemptsRes] = await Promise.all([
        fetch("/api/quiz/quizzes"),
        fetch("/api/quiz/attempts"),
      ]);
      const quizData = quizRes.ok ? ((await quizRes.json()) as QuizRow[]) : [];
      const attemptData = attemptsRes.ok ? ((await attemptsRes.json()) as AttemptRow[]) : [];
      setQuizzes(Array.isArray(quizData) ? quizData : []);
      setAttempts(Array.isArray(attemptData) ? attemptData : []);
    } catch {
      setQuizzes([]);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const attemptsByQuiz = useMemo(() => {
    const map = new Map<string, AttemptRow[]>();
    for (const attempt of attempts) {
      const list = map.get(attempt.quiz_id) ?? [];
      list.push(attempt);
      map.set(attempt.quiz_id, list);
    }
    return map;
  }, [attempts]);

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.assignments")}
      description={t("teacherDashboard.assignmentsSubtitle", {
        defaultValue: "Veröffentlichte Quizze und Abgaben deiner SchülerInnen.",
      })}
    >
      <div className="mx-auto max-w-[1000px] space-y-6">
        <div className={`${teacherPanel()} border-[var(--brand-gold)]/20 bg-[var(--brand-gold-muted)]/30 p-5`}>
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-gold)]" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("teacherDashboard.assignmentsAiNote", {
                  defaultValue: "Kontaktiere die Verwaltung für KI-Generierung neuer Quizze.",
                })}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {t("teacherDashboard.assignmentsAiHint", {
                  defaultValue: "Du kannst vorhandene Quizze einsehen und Abgaben prüfen.",
                })}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingBlock />
        ) : quizzes.length === 0 ? (
          <div className={`${teacherPanel()} p-10 text-center`}>
            <ClipboardList className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-4 text-sm text-text-muted">
              {t("teacherDashboard.assignmentsEmpty", {
                defaultValue: "Noch keine Quizze vorhanden. Die Verwaltung kann Quizze erstellen und zuweisen.",
              })}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map((quiz) => {
              const quizAttempts = attemptsByQuiz.get(quiz.id) ?? [];
              const expanded = expandedQuizId === quiz.id;
              return (
                <div key={quiz.id} className={teacherPanel()}>
                  <button
                    type="button"
                    onClick={() => setExpandedQuizId(expanded ? null : quiz.id)}
                    className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-surface-subtle"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{quiz.title}</p>
                      {quiz.topic && <p className="mt-0.5 text-xs text-text-muted">{quiz.topic}</p>}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant={quiz.is_published ? "success" : "default"}>
                          {quiz.is_published
                            ? t("teacherDashboard.quizPublished", { defaultValue: "Veröffentlicht" })
                            : t("teacherDashboard.quizDraft", { defaultValue: "Entwurf" })}
                        </Badge>
                        <span className="text-xs text-text-muted">
                          {questionCount(quiz)} {t("teacherDashboard.quizQuestions", { defaultValue: "Fragen" })}
                        </span>
                        <span className="text-xs text-text-muted">
                          {quizAttempts.length}{" "}
                          {t("teacherDashboard.quizAttempts", { defaultValue: "Abgaben" })}
                        </span>
                      </div>
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-border-default px-5 py-4">
                      {quizAttempts.length === 0 ? (
                        <p className="text-sm text-text-muted">
                          {t("teacherDashboard.noQuizAttempts", { defaultValue: "Noch keine Abgaben für dieses Quiz." })}
                        </p>
                      ) : (
                        <ul className="divide-y divide-border-default">
                          {quizAttempts.map((attempt) => (
                            <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                              <span className="text-text-muted">
                                {new Date(attempt.created_at).toLocaleDateString(locale)}
                              </span>
                              <Badge variant={attempt.completed_at ? "success" : "warning"}>
                                {attempt.completed_at
                                  ? attempt.score_percent != null
                                    ? t("teacherDashboard.attemptGraded", {
                                        score: attempt.score_percent,
                                        defaultValue: "Bewertet · {{score}}%",
                                      })
                                    : t("teacherDashboard.attemptSubmitted", { defaultValue: "Abgegeben" })
                                  : t("teacherDashboard.attemptInProgress", { defaultValue: "In Bearbeitung" })}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TeacherDashboardLayout>
  );
}
