"use client";

import { useCallback, useEffect, useState } from "react";
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
import type { StudentAssignmentStatus } from "@/app/api/student/assignments/route";

type AssignmentRow = {
  id: string;
  quizId: string;
  title: string;
  subjectName: string | null;
  dueDate: string | null;
  status: StudentAssignmentStatus;
  score: number | null;
  feedback: string | null;
  allowRetry: boolean;
  difficulty: string;
  timeLimitMinutes: number | null;
};

function statusLabel(
  status: StudentAssignmentStatus,
  t: (key: string, opts?: Record<string, string | number>) => string
): string {
  switch (status) {
    case "in_progress":
      return t("studentDashboard.quizStatusInProgress");
    case "submitted":
      return t("studentDashboard.quizStatusSubmitted");
    case "graded":
      return t("studentDashboard.quizStatusGraded");
    case "completed":
      return t("studentDashboard.quizStatusCompleted");
    default:
      return t("studentDashboard.quizStatusOpen");
  }
}

function statusVariant(status: StudentAssignmentStatus): "warning" | "success" | "gold" {
  if (status === "open" || status === "in_progress") return "warning";
  if (status === "submitted") return "gold";
  return "success";
}

function difficultyLabel(
  difficulty: string,
  t: (key: string, opts?: Record<string, string>) => string
): string {
  const key = difficulty.toLowerCase();
  if (key === "easy") return t("studentDashboard.quizDifficultyEasy");
  if (key === "hard") return t("studentDashboard.quizDifficultyHard");
  return t("studentDashboard.quizDifficultyMedium");
}

export function StudentQuizHub() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [tab, setTab] = useState<"available" | "history">("available");
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<{
    meta: { id: string; title: string; time_limit_minutes: number | null };
    questions: QuizQuestion[];
  } | null>(null);

  const dateLocale = i18n.language?.startsWith("de") ? "de-AT" : undefined;
  const textPrimary = "text-foreground";

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/student/assignments");
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setLoadError(json.error || t("studentDashboard.quizLoadError"));
        setAssignments([]);
        return;
      }
      const json = (await res.json()) as { assignments?: AssignmentRow[] };
      setAssignments(Array.isArray(json.assignments) ? json.assignments : []);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const startQuiz = async (quizId: string) => {
    const res = await fetch(`/api/quiz/quizzes/${quizId}`);
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || t("studentDashboard.quizStartError"));
      return;
    }
    const questions = (data.quiz_questions || []).sort(
      (a: QuizQuestion, b: QuizQuestion) => a.sort_order - b.sort_order
    ) as QuizQuestion[];
    if (!questions.length) {
      toast.error(t("studentDashboard.quizEmpty"));
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

  const openAssignments = assignments.filter(
    (a) => a.status === "open" || a.status === "in_progress"
  );
  const historyAssignments = assignments.filter(
    (a) => a.status === "submitted" || a.status === "graded" || a.status === "completed"
  );

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

  const renderAssignmentCard = (a: AssignmentRow, showRetry: boolean) => (
    <Card key={a.id} className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`font-bold ${textPrimary}`}>{a.title}</h3>
            <Badge variant={statusVariant(a.status)}>{statusLabel(a.status, t)}</Badge>
            <Badge variant="gold">{difficultyLabel(a.difficulty, t)}</Badge>
          </div>

          <dl className="grid gap-1.5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("studentDashboard.assignmentSubject")}
              </dt>
              <dd className="text-foreground">{a.subjectName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("studentDashboard.assignmentDueDate")}
              </dt>
              <dd className="text-foreground">
                {a.dueDate
                  ? new Date(a.dueDate).toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : t("studentDashboard.assignmentNoDueDate")}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("studentDashboard.assignmentScore")}
              </dt>
              <dd className="font-semibold text-[#D4AF37]">
                {a.score != null ? `${a.score}%` : "—"}
              </dd>
            </div>
            {a.timeLimitMinutes ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {t("studentDashboard.assignmentTimeLimit")}
                </dt>
                <dd className="text-foreground">
                  {a.timeLimitMinutes} {t("studentDashboard.minShort")}
                </dd>
              </div>
            ) : null}
          </dl>

          {a.feedback ? (
            <div className="rounded-lg border border-border-default bg-surface-subtle/50 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("studentDashboard.quizFeedback")}
              </p>
              <p className="mt-1 text-sm text-foreground">{a.feedback}</p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {(a.status === "open" || a.status === "in_progress") && (
            <Button variant="gold" size="sm" onClick={() => void startQuiz(a.quizId)}>
              <Play className="mr-2 h-4 w-4" />
              {a.status === "open"
                ? t("studentDashboard.quizStart")
                : t("studentDashboard.quizContinue")}
            </Button>
          )}
          {showRetry && a.allowRetry && (
            <Button variant="outline" size="sm" onClick={() => void startQuiz(a.quizId)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("studentDashboard.quizRetry")}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={tab === "available" ? "gold" : "outline"}
          size="sm"
          onClick={() => setTab("available")}
        >
          <Brain className="mr-2 h-4 w-4" />
          {t("studentDashboard.availableQuizzes")} ({openAssignments.length})
        </Button>
        <Button
          variant={tab === "history" ? "gold" : "outline"}
          size="sm"
          onClick={() => setTab("history")}
        >
          <History className="mr-2 h-4 w-4" />
          {t("studentDashboard.quizHistory")} ({historyAssignments.length})
        </Button>
      </div>

      {tab === "available" ? (
        loadError ? (
          <EmptyState title={t("studentDashboard.quizLoadError")} description={loadError} />
        ) : openAssignments.length === 0 ? (
          <EmptyState
            title={t("studentDashboard.noOpenAssignments")}
            description={t("studentDashboard.noOpenAssignmentsDesc")}
          />
        ) : (
          <div className="space-y-4">{openAssignments.map((a) => renderAssignmentCard(a, false))}</div>
        )
      ) : historyAssignments.length === 0 ? (
        <EmptyState
          title={t("studentDashboard.quizNoAttempts")}
          description={t("studentDashboard.quizNoAttemptsDesc")}
        />
      ) : (
        <div className="space-y-4">
          {historyAssignments.map((a) => renderAssignmentCard(a, true))}
        </div>
      )}
    </div>
  );
}
