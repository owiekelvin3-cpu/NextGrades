"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { QuizQuestion } from "@/lib/quiz/types";

type QuizMeta = {
  id: string;
  title: string;
  time_limit_minutes: number | null;
};

type GradedAnswer = {
  question_id: string;
  answer: string;
  is_correct: boolean;
};

export function QuizPlayer({
  quiz,
  questions,
  onExit,
}: {
  quiz: QuizMeta;
  questions: QuizQuestion[];
  onExit: () => void;
}) {
  const { theme } = useTheme();
  const toast = useToast();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{
    scorePercent: number;
    graded: GradedAnswer[];
    questions: QuizQuestion[];
  } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : null
  );
  const [startedAt] = useState(Date.now());

  const isDark = theme === "dark";
  const textPrimary = isDark ? "text-white" : "text-[#0D1B2A]";
  const current = questions[index];
  const progress = ((index + 1) / questions.length) * 100;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/quiz/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizId: quiz.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAttemptId(data.attempt.id);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not start quiz");
        onExit();
      }
    })();
  }, [quiz.id, onExit, toast]);

  useEffect(() => {
    if (secondsLeft === null || finished) return;
    if (secondsLeft <= 0) {
      void handleSubmit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s !== null ? s - 1 : s)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, finished]);

  const handleSubmit = async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: questions.map((q) => ({
          question_id: q.id,
          answer: answers[q.id] || "",
        })),
        timeSpentSeconds: Math.round((Date.now() - startedAt) / 1000),
      };
      const res = await fetch(`/api/quiz/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({
        scorePercent: data.scorePercent,
        graded: data.graded,
        questions: data.questions,
      });
      setFinished(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const gradedMap = useMemo(
    () => new Map(result?.graded.map((g) => [g.question_id, g]) || []),
    [result]
  );

  if (!current && !finished) {
    return <p className="text-gray-500">Loading quiz…</p>;
  }

  if (finished && result) {
    return (
      <div className="space-y-6">
        <Card className={`p-8 text-center ${isDark ? "bg-[#112240]" : "bg-white"}`}>
          <p className={`text-5xl font-bold text-[#D4AF37] mb-2`}>{result.scorePercent}%</p>
          <p className={textPrimary}>Quiz complete</p>
          <Button variant="gold" className="mt-6" onClick={onExit}>
            Back to quizzes
          </Button>
        </Card>

        <div className="space-y-4">
          {result.questions.map((q) => {
            const g = gradedMap.get(q.id);
            const ok = g?.is_correct;
            return (
              <Card key={q.id} className={`p-5 ${isDark ? "bg-[#112240]" : "bg-white"}`}>
                <div className="flex items-start gap-3">
                  {ok ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                  <div>
                    <p className={`font-medium ${textPrimary}`}>{q.question_text}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Your answer: {g?.answer || "—"}
                    </p>
                    {!ok && (
                      <p className="text-sm text-[#D4AF37] mt-1">Correct: {q.correct_answer}</p>
                    )}
                    {q.explanation && (
                      <p className="text-sm text-gray-400 mt-2">{q.explanation}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold ${textPrimary}`}>{quiz.title}</h2>
          <p className="text-sm text-gray-500">
            Question {index + 1} of {questions.length}
          </p>
        </div>
        {secondsLeft !== null && (
          <Badge variant="gold" className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
          </Badge>
        )}
      </div>

      <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${progress}%` }} />
      </div>

      <Card className={`p-6 ${isDark ? "bg-[#112240]" : "bg-white"}`}>
        <Badge variant="outline" className="mb-4">
          {current.question_type.replace("_", " ")}
        </Badge>
        <p className={`text-lg font-semibold mb-6 ${textPrimary}`}>{current.question_text}</p>

        {current.question_type === "mcq" && current.options ? (
          <div className="space-y-3">
            {current.options.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  answers[current.id] === opt
                    ? "border-[#D4AF37] bg-[#D4AF37]/10"
                    : isDark
                      ? "border-white/10 hover:border-white/20"
                      : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={current.id}
                  checked={answers[current.id] === opt}
                  onChange={() => setAnswers({ ...answers, [current.id]: opt })}
                  className="accent-[#D4AF37]"
                />
                <span className={textPrimary}>{opt}</span>
              </label>
            ))}
          </div>
        ) : current.question_type === "true_false" ? (
          <div className="flex gap-3">
            {["true", "false"].map((v) => (
              <Button
                key={v}
                variant={answers[current.id] === v ? "gold" : "outline"}
                onClick={() => setAnswers({ ...answers, [current.id]: v })}
              >
                {v === "true" ? "True" : "False"}
              </Button>
            ))}
          </div>
        ) : (
          <input
            className={`w-full px-4 py-3 rounded-xl border ${
              isDark ? "border-white/15 bg-[#0D1B2A] text-white" : "border-gray-200"
            }`}
            value={answers[current.id] || ""}
            onChange={(e) => setAnswers({ ...answers, [current.id]: e.target.value })}
            placeholder="Your answer"
          />
        )}
      </Card>

      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        {index < questions.length - 1 ? (
          <Button variant="gold" onClick={() => setIndex((i) => i + 1)}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button variant="gold" onClick={handleSubmit} disabled={submitting || !attemptId}>
            {submitting ? "Submitting…" : "Submit quiz"}
          </Button>
        )}
      </div>
    </div>
  );
}
