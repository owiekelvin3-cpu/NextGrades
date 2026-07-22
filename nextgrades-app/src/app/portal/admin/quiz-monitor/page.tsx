"use client";

import { useEffect, useState } from "react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { Card } from "@/components/ui/Card";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { AdminKpiCard, AdminKpiStrip } from "@/components/admin/AdminKpiCard";
import { AdminTableStatusBadge } from "@/components/admin/AdminTable";
import { Brain, FileText, Users, Zap, CheckCircle2, XCircle } from "lucide-react";

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

export default function AdminQuizMonitorPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/quiz/admin/stats");
        if (res.ok) setStats(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
          <p className="text-text-muted">Unable to load quiz analytics. Ensure you are logged in as admin.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <AdminKpiStrip className="sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4">
            <AdminKpiCard label="Materials" value={stats.counts.materials} icon={FileText} iconTone="info" />
            <AdminKpiCard label="Quizzes" value={stats.counts.quizzes} icon={Brain} iconTone="gold" />
            <AdminKpiCard label="Attempts" value={stats.counts.attempts} icon={Users} iconTone="success" />
            <AdminKpiCard label="Student scores" value={stats.counts.studentScores} icon={Zap} iconTone="warning" />
          </AdminKpiStrip>

          <Card hoverable={false} className="overflow-hidden p-0">
            <div className="border-b border-[var(--table-border)] px-5 py-4">
              <h3 className="font-bold text-foreground">Generation engine</h3>
              <p className="mt-1 text-sm text-text-muted">
                {stats.generation.engine} · {stats.generation.completedJobs} completed ·{" "}
                {stats.generation.failedJobs} failed
              </p>
            </div>
            <ul className="max-h-56 space-y-2 overflow-y-auto p-5 text-sm">
              {stats.generation.recentJobs.map((j) => (
                <li
                  key={j.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-surface-subtle px-3 py-2.5"
                >
                  <span className="text-foreground">
                    {j.mode} · {new Date(j.created_at).toLocaleString()}
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

          <div className="grid gap-6 lg:grid-cols-2">
            <Card hoverable={false} className="overflow-hidden p-0">
              <div className="border-b border-[var(--table-border)] px-5 py-4">
                <h3 className="font-bold text-foreground">Recent uploads</h3>
              </div>
              <ul className="space-y-2 p-5 text-sm">
                {stats.recentMaterials.map((m) => (
                  <li
                    key={m.id}
                    className="flex justify-between gap-2 rounded-xl border border-border-default bg-surface-subtle px-3 py-2.5"
                  >
                    <span className="truncate font-medium text-foreground">{m.title}</span>
                    <AdminTableStatusBadge label={m.extraction_status} variant="info" />
                  </li>
                ))}
              </ul>
            </Card>
            <Card hoverable={false} className="overflow-hidden p-0">
              <div className="border-b border-[var(--table-border)] px-5 py-4">
                <h3 className="font-bold text-foreground">Recent quizzes</h3>
              </div>
              <ul className="space-y-2 p-5 text-sm">
                {stats.recentQuizzes.map((q) => (
                  <li
                    key={q.id}
                    className="flex justify-between gap-2 rounded-xl border border-border-default bg-surface-subtle px-3 py-2.5"
                  >
                    <span className="truncate font-medium text-foreground">{q.title}</span>
                    <AdminTableStatusBadge
                      label={q.is_published ? "Published" : "Draft"}
                      variant={q.is_published ? "success" : "default"}
                    />
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </DashboardPage>
  );
}
