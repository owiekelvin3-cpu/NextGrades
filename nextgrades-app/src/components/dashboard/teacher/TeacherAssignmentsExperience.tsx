"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, Sparkles, Plus, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "@/lib/i18n/locales";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
  teacher_feedback?: string | null;
  student?: { full_name?: string | null; email?: string | null };
  generated_quizzes?: { id: string; title: string; difficulty?: string };
};

type StudentOption = { id: string; name: string };
type GroupOption = { id: string; name: string; memberCount: number };

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
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const [assignQuizId, setAssignQuizId] = useState<string | null>(null);
  const [assignTargetMode, setAssignTargetMode] = useState<"students" | "group">("students");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [feedbackDraft, setFeedbackDraft] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [quizRes, attemptsRes, studentsRes, groupsRes] = await Promise.all([
        fetch("/api/quiz/quizzes"),
        fetch("/api/quiz/attempts"),
        fetch("/api/teacher/students"),
        fetch("/api/teacher/groups"),
      ]);
      const quizData = quizRes.ok ? ((await quizRes.json()) as QuizRow[]) : [];
      const attemptData = attemptsRes.ok ? ((await attemptsRes.json()) as AttemptRow[]) : [];
      const studentsJson = studentsRes.ok
        ? ((await studentsRes.json()) as {
            students?: Array<{ studentId: string; name: string }>;
          })
        : { students: [] };
      const groupsJson = groupsRes.ok
        ? ((await groupsRes.json()) as {
            groups?: Array<{ id: string; name: string; members?: unknown[] }>;
          })
        : { groups: [] };
      setStudents(
        (studentsJson.students ?? []).map((s) => ({ id: s.studentId, name: s.name }))
      );
      setGroups(
        (groupsJson.groups ?? []).map((g) => ({
          id: g.id,
          name: g.name,
          memberCount: Array.isArray(g.members) ? g.members.length : 0,
        }))
      );
      setQuizzes(Array.isArray(quizData) ? quizData : []);
      setAttempts(Array.isArray(attemptData) ? attemptData : []);
    } catch {
      setQuizzes([]);
      setAttempts([]);
      setStudents([]);
      setGroups([]);
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

  const pendingCount = useMemo(
    () => attempts.filter((a) => a.completed_at && !a.teacher_feedback).length,
    [attempts]
  );

  const createQuiz = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/quiz/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          publish: true,
          questions: [
            {
              question_type: "short_answer",
              question_text: t("teacherDashboard.defaultQuestion", {
                defaultValue: "Beantworte die Aufgabe.",
              }),
              correct_answer: t("teacherDashboard.defaultAnswer", { defaultValue: "Antwort" }),
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setNewTitle("");
      await load();
    } finally {
      setCreating(false);
    }
  };

  const assignQuiz = async () => {
    if (!assignQuizId) return;
    if (assignTargetMode === "group" && !selectedGroupId) return;
    if (assignTargetMode === "students" && !selectedStudents.length) return;
    const res = await fetch("/api/teacher/quiz-grants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: assignQuizId,
        ...(assignTargetMode === "group"
          ? { groupId: selectedGroupId }
          : { studentIds: selectedStudents }),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      }),
    });
    if (res.ok) {
      setAssignQuizId(null);
      setSelectedStudents([]);
      setSelectedGroupId("");
      setAssignTargetMode("students");
      setDueDate("");
      await load();
    }
  };

  const saveFeedback = async (attemptId: string) => {
    const feedback = feedbackDraft[attemptId]?.trim();
    if (!feedback) return;
    const res = await fetch(`/api/quiz/attempts/${attemptId}/grade`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherFeedback: feedback }),
    });
    if (res.ok) await load();
  };

  return (
    <TeacherDashboardLayout
      title={t("teacherDashboard.nav.assignments")}
      description={t("teacherDashboard.assignmentsSubtitle", {
        defaultValue: "Quizze erstellen, zuweisen und Abgaben bewerten.",
      })}
    >
      <div className="mx-auto max-w-[1000px] space-y-6">
        <div className={`${teacherPanel()} border-[var(--brand-gold)]/20 bg-[var(--brand-gold-muted)]/30 p-5`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-gold)]" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("teacherDashboard.assignmentsTeacherNote", {
                    defaultValue: "Erstelle Quizze selbst oder nutze den KI-Generator.",
                  })}
                </p>
                {pendingCount > 0 && (
                  <p className="mt-1 text-xs font-semibold text-orange-700">
                    {t("teacherDashboard.pendingSubmissionsCount", {
                      count: pendingCount,
                      defaultValue: "{{count}} Abgaben warten auf Feedback",
                    })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" href="/dashboard/teacher/ai-generator">
                <Sparkles className="mr-2 h-4 w-4" />
                {t("teacherDashboard.nav.aiGenerator", { defaultValue: "KI-Generator" })}
              </Button>
            </div>
          </div>
        </div>

        <div className={`${teacherPanel()} p-5`}>
          <h3 className="text-sm font-semibold">
            {t("teacherDashboard.createQuizQuick", { defaultValue: "Schnell-Quiz erstellen" })}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t("teacherDashboard.quizTitlePlaceholder", { defaultValue: "Quiz-Titel" })}
              className="min-w-[200px] flex-1 rounded-xl border border-border-default px-3 py-2 text-sm"
            />
            <Button variant="gold" size="sm" disabled={creating || !newTitle.trim()} onClick={() => void createQuiz()}>
              <Plus className="mr-2 h-4 w-4" />
              {t("teacherDashboard.createQuiz", { defaultValue: "Erstellen" })}
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingBlock />
        ) : quizzes.length === 0 ? (
          <div className={`${teacherPanel()} p-10 text-center`}>
            <ClipboardList className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-4 text-sm text-text-muted">
              {t("teacherDashboard.assignmentsEmptyTeacher", {
                defaultValue: "Noch keine Quizze. Erstelle eines oder nutze den KI-Generator.",
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
                  <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setExpandedQuizId(expanded ? null : quiz.id)}
                      className="min-w-0 flex-1 text-left"
                    >
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
                    </button>
                    {quiz.is_published && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAssignQuizId(quiz.id);
                          setAssignTargetMode("students");
                          setSelectedGroupId("");
                          setSelectedStudents([]);
                        }}
                      >
                        {t("teacherDashboard.assignQuiz", { defaultValue: "Zuweisen" })}
                      </Button>
                    )}
                  </div>

                  {expanded && (
                    <div className="border-t border-border-default px-5 py-4">
                      {quizAttempts.length === 0 ? (
                        <p className="text-sm text-text-muted">
                          {t("teacherDashboard.noQuizAttempts", { defaultValue: "Noch keine Abgaben für dieses Quiz." })}
                        </p>
                      ) : (
                        <ul className="divide-y divide-border-default">
                          {quizAttempts.map((attempt) => {
                            const studentName =
                              attempt.student?.full_name?.trim() ||
                              t("teacherDashboard.studentFallback", { defaultValue: "SchülerIn" });
                            return (
                              <li key={attempt.id} className="space-y-3 py-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                  <span className="font-medium">{studentName}</span>
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
                                </div>
                                {attempt.teacher_feedback ? (
                                  <p className="rounded-lg bg-surface-subtle px-3 py-2 text-sm text-text-muted">
                                    {attempt.teacher_feedback}
                                  </p>
                                ) : attempt.completed_at ? (
                                  <div className="flex flex-wrap gap-2">
                                    <input
                                      value={feedbackDraft[attempt.id] ?? ""}
                                      onChange={(e) =>
                                        setFeedbackDraft((d) => ({ ...d, [attempt.id]: e.target.value }))
                                      }
                                      placeholder={t("teacherDashboard.feedbackPlaceholder", {
                                        defaultValue: "Feedback an SchülerIn…",
                                      })}
                                      className="min-w-[200px] flex-1 rounded-xl border border-border-default px-3 py-2 text-sm"
                                    />
                                    <Button
                                      variant="gold"
                                      size="sm"
                                      onClick={() => void saveFeedback(attempt.id)}
                                    >
                                      <Send className="mr-1 h-3 w-3" />
                                      {t("teacherDashboard.sendFeedback", { defaultValue: "Senden" })}
                                    </Button>
                                  </div>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {assignQuizId && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
            <div className={`${teacherPanel()} w-full max-w-md p-5`}>
              <h3 className="font-semibold">{t("teacherDashboard.assignQuiz", { defaultValue: "Quiz zuweisen" })}</h3>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignTargetMode("students")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    assignTargetMode === "students"
                      ? "bg-[#0D1B2A] text-white"
                      : "bg-surface-subtle text-text-muted"
                  }`}
                >
                  {t("teacherDashboard.assignToStudents", { defaultValue: "SchülerInnen" })}
                </button>
                <button
                  type="button"
                  onClick={() => setAssignTargetMode("group")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    assignTargetMode === "group"
                      ? "bg-[#0D1B2A] text-white"
                      : "bg-surface-subtle text-text-muted"
                  }`}
                >
                  {t("teacherDashboard.assignToGroup", { defaultValue: "Gruppe" })}
                </button>
              </div>
              {assignTargetMode === "group" ? (
                <div className="mt-4">
                  <label className="block text-sm text-text-muted">
                    {t("teacherDashboard.selectGroup", { defaultValue: "Gruppe wählen" })}
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border-default px-3 py-2 text-sm"
                    >
                      <option value="">{t("teacherDashboard.selectGroupPlaceholder", { defaultValue: "—" })}</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                          {g.memberCount > 0
                            ? ` (${t("teacherDashboard.groupMemberCount", {
                                count: g.memberCount,
                                defaultValue: "{{count}} Mitglieder",
                              })})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  {groups.length === 0 && (
                    <p className="mt-2 text-xs text-text-muted">
                      {t("teacherDashboard.noGroups", { defaultValue: "Keine aktiven Gruppen." })}
                    </p>
                  )}
                </div>
              ) : (
                <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto">
                  {students.map((s) => (
                    <li key={s.id}>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(s.id)}
                          onChange={(e) =>
                            setSelectedStudents((prev) =>
                              e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                            )
                          }
                        />
                        {s.name}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              <label className="mt-4 block text-sm">
                {t("teacherDashboard.dueDate", { defaultValue: "Frist" })}
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-default px-3 py-2"
                />
              </label>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAssignQuizId(null)}>
                  {t("common.cancel", { defaultValue: "Abbrechen" })}
                </Button>
                <Button
                  variant="gold"
                  disabled={
                    assignTargetMode === "group" ? !selectedGroupId : selectedStudents.length === 0
                  }
                  onClick={() => void assignQuiz()}
                >
                  {t("teacherDashboard.assignQuiz", { defaultValue: "Zuweisen" })}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherDashboardLayout>
  );
}
