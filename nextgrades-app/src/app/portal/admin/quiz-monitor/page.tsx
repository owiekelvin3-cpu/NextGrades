"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { Card } from "@/components/ui/Card";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { AdminKpiCard, AdminKpiStrip } from "@/components/admin/AdminKpiCard";
import { AdminTableStatusBadge } from "@/components/admin/AdminTable";
import { AdminQuizCreateForm } from "@/components/admin/AdminQuizCreateForm";
import { Brain, FileText, Users, Zap, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";

type Stats = {
  counts: { materials: number; quizzes: number; attempts: number; studentScores: number };
  generation: {
    engine: string;
    completedJobs: number;
    failedJobs: number;
    recentJobs: Array<{ id: string; status: string; mode: string; created_at: string; error_message?: string }>;
  };
  recentMaterials: Array<{ id: string; title: string; extraction_status: string; created_at: string }>;
  recentQuizzes: Array<{ id: string; title: string; is_published: boolean; ai_model?: string; created_at: string }>;
};

type QuizRow = {
  id: string;
  title: string;
  is_published: boolean;
  difficulty?: string;
  created_at: string;
  quiz_questions?: { count: number }[];
};

export default function AdminQuizMonitorPage() {
  const toast = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [statsRes, quizRes] = await Promise.all([fetch("/api/quiz/admin/stats"), fetch("/api/quiz/quizzes")]);
    if (statsRes.ok) setStats(await statsRes.json());
    if (quizRes.ok) {
      const data = await quizRes.json();
      setQuizzes(Array.isArray(data) ? data : []);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const togglePublish = async (quiz: QuizRow) => {
    const res = await fetch(`/api/quiz/quizzes/${quiz.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: !quiz.is_published }),
    });
    if (!res.ok) {
      toast.error("Status konnte nicht geändert werden.");
      return;
    }
    toast.success(quiz.is_published ? "Als Entwurf gespeichert." : "Freigabebereit. Jetzt unter „Quizze freischalten“ einzelnen SchülerInnen zuweisen.");
    void load();
  };

  const removeQuiz = async (id: string) => {
    if (!confirm("Dieses Quiz wirklich löschen?")) return;
    const res = await fetch(`/api/quiz/quizzes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Löschen fehlgeschlagen.");
      return;
    }
    toast.success("Quiz gelöscht.");
    void load();
  };

  return (
    <DashboardPage
      role="admin"
      titleKey="dashboardPages.admin.quizMonitor.title"
      descriptionKey="dashboardPages.admin.quizMonitor.description"
    >
      {loading ? (
        <LoadingBlock />
      ) : !stats ? (
        <Card hoverable={false} className="p-8 text-center">
          <p className="text-text-muted">Quiz-Daten konnten nicht geladen werden. Als Admin angemeldet?</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <AdminQuizCreateForm onCreated={() => void load()} />

          <AdminKpiStrip className="sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4">
            <AdminKpiCard label="Materialien" value={stats.counts.materials} icon={FileText} iconTone="info" />
            <AdminKpiCard label="Quizzes" value={stats.counts.quizzes} icon={Brain} iconTone="gold" />
            <AdminKpiCard label="Versuche" value={stats.counts.attempts} icon={Users} iconTone="success" />
            <AdminKpiCard label="Schüler-Scores" value={stats.counts.studentScores} icon={Zap} iconTone="warning" />
          </AdminKpiStrip>

          <Card hoverable={false} className="overflow-hidden p-0">
            <div className="border-b border-[var(--table-border)] px-5 py-4">
              <h3 className="font-bold text-foreground">Alle Quizzes</h3>
              <p className="mt-1 text-sm text-text-muted">Veröffentlichen, damit sie unter Aufgaben sichtbar sind.</p>
            </div>
            {quizzes.length === 0 ? (
              <p className="px-5 py-8 text-sm text-text-muted">Noch keine Quizzes.</p>
            ) : (
              <ul className="divide-y divide-border-default">
                {quizzes.map((q) => {
                  const count = q.quiz_questions?.[0]?.count;
                  return (
                    <li key={q.id} className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{q.title}</p>
                        <p className="text-xs text-text-muted">
                          {typeof count === "number" ? `${count} Fragen · ` : ""}
                          {new Date(q.created_at).toLocaleDateString("de-AT")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <AdminTableStatusBadge
                          label={q.is_published ? "Veröffentlicht" : "Entwurf"}
                          variant={q.is_published ? "success" : "default"}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => void togglePublish(q)}>
                          {q.is_published ? "Zurückziehen" : "Veröffentlichen"}
                        </Button>
                        <button
                          type="button"
                          onClick={() => void removeQuiz(q.id)}
                          className="rounded-xl border border-red-100 p-2 text-red-500 hover:bg-red-50"
                          aria-label="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card hoverable={false} className="overflow-hidden p-0">
            <div className="border-b border-[var(--table-border)] px-5 py-4">
              <h3 className="font-bold text-foreground">Generierung</h3>
              <p className="mt-1 text-sm text-text-muted">
                {stats.generation.engine} · {stats.generation.completedJobs} abgeschlossen · {stats.generation.failedJobs}{" "}
                fehlgeschlagen
              </p>
            </div>
            <ul className="max-h-56 space-y-2 overflow-y-auto p-5 text-sm">
              {stats.generation.recentJobs.map((j) => (
                <li
                  key={j.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-surface-subtle px-3 py-2.5"
                >
                  <span className="text-foreground">
                    {j.mode} · {new Date(j.created_at).toLocaleString("de-AT")}
                  </span>
                  <span className="flex items-center gap-1.5 text-text-muted">
                    {j.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : j.status === "failed" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : null}
                    {j.status}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </DashboardPage>
  );
}
