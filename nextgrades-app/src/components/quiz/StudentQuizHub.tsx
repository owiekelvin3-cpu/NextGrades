"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { useTheme } from "@/context/ThemeContext";
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
  quiz_questions?: { count: number }[];
};

type AttemptRow = {
  id: string;
  score_percent: number | null;
  completed_at: string | null;
  created_at: string;
  generated_quizzes?: { title: string };
};

export function StudentQuizHub() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState<"available" | "history">("available");
  const [quizzes, setQuizzes] = useState<PublishedQuiz[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<{
    meta: { id: string; title: string; time_limit_minutes: number | null };
    questions: QuizQuestion[];
  } | null>(null);

  const isDark = theme === "dark";
  const textPrimary = "text-foreground";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, aRes] = await Promise.all([
        fetch("/api/quiz/quizzes?published=true"),
        fetch("/api/quiz/attempts"),
      ]);
      if (qRes.ok) setQuizzes(await qRes.json());
      if (aRes.ok) setAttempts(await aRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startQuiz = async (quizId: string) => {
    const res = await fetch(`/api/quiz/quizzes/${quizId}`);
    const data = await res.json();
    if (!res.ok) return;
    const questions = (data.quiz_questions || []).sort(
      (a: QuizQuestion, b: QuizQuestion) => a.sort_order - b.sort_order
    ) as QuizQuestion[];
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
      <div className="flex gap-2">
        <Button
          variant={tab === "available" ? "gold" : "outline"}
          size="sm"
          onClick={() => setTab("available")}
        >
          <Brain className="w-4 h-4 mr-2" />
          {t("studentDashboard.startQuiz", { defaultValue: "Available quizzes" })}
        </Button>
        <Button
          variant={tab === "history" ? "gold" : "outline"}
          size="sm"
          onClick={() => setTab("history")}
        >
          <History className="w-4 h-4 mr-2" />
          {t("dashboardPages.student.quizzes.title", { defaultValue: "History" })}
        </Button>
      </div>

      {tab === "available" ? (
        quizzes.length === 0 ? (
          <EmptyState
            title={t("dashboardPages.student.quizzes.title")}
            description={t("studentDashboard.bookWithTeacher")}
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {quizzes.map((q) => (
              <Card key={q.id} className={`p-6`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`font-bold ${textPrimary}`}>{q.title}</h3>
                  <Badge variant="gold">{q.difficulty}</Badge>
                </div>
                {q.topic && <p className="text-sm text-text-muted mb-2">{q.topic}</p>}
                <p className="text-sm text-text-muted mb-4">
                  {Array.isArray(q.quiz_questions)
                    ? q.quiz_questions.length
                    : (q.quiz_questions as unknown as { count?: number })?.count ?? "—"}{" "}
                  questions
                  {q.time_limit_minutes ? ` · ${q.time_limit_minutes} min` : ""}
                </p>
                <Button variant="gold" size="sm" onClick={() => void startQuiz(q.id)}>
                  <Play className="w-4 h-4 mr-2" />
                  Start quiz
                </Button>
              </Card>
            ))}
          </div>
        )
      ) : attempts.length === 0 ? (
        <EmptyState title="No attempts yet" description="Complete a quiz to see your history here." />
      ) : (
        <div className="space-y-3">
          {attempts.map((a) => (
            <Card key={a.id} className={`p-4 flex flex-wrap justify-between items-center gap-3`}>
              <div>
                <p className={`font-semibold ${textPrimary}`}>
                  {a.generated_quizzes?.title ?? "Quiz"}
                </p>
                <p className="text-sm text-text-muted">
                  {a.completed_at
                    ? new Date(a.completed_at).toLocaleString()
                    : "In progress"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {a.score_percent !== null && (
                  <span className="text-2xl font-bold text-[#D4AF37]">{a.score_percent}%</span>
                )}
                {a.completed_at && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const quizId = (a as { quiz_id?: string }).quiz_id;
                      if (quizId) void startQuiz(quizId);
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
