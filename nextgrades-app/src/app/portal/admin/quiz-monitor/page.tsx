"use client";

import { useEffect, useState } from "react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { Card } from "@/components/ui/Card";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { useTheme } from "@/context/ThemeContext";
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
  const { theme } = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const isDark = theme === "dark";
  const textPrimary = "text-foreground";

  useEffect(() => {
    (async () => {
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
      titleKey="dashboardPages.teacher.aiGenerator.title"
      descriptionKey="dashboardPages.teacher.aiGenerator.description"
    >
      {loading ? (
        <LoadingBlock />
      ) : !stats ? (
        <p className="text-gray-500">Unable to load quiz analytics. Ensure you are logged in as admin.</p>
      ) : (
        <div className="space-y-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: "Materials", value: stats.counts.materials },
              { icon: Brain, label: "Quizzes", value: stats.counts.quizzes },
              { icon: Users, label: "Attempts", value: stats.counts.attempts },
              { icon: Zap, label: "Student scores", value: stats.counts.studentScores },
            ].map((s) => (
              <Card key={s.label} className={`p-5`}>
                <s.icon className="w-6 h-6 text-[#D4AF37] mb-2" />
                <p className={`text-2xl font-bold ${textPrimary}`}>{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </Card>
            ))}
          </div>

          <Card className={`p-6`}>
            <h3 className={`font-bold mb-2 ${textPrimary}`}>Generation engine</h3>
            <p className="text-sm text-gray-500 mb-4">
              {stats.generation.engine} · {stats.generation.completedJobs} completed ·{" "}
              {stats.generation.failedJobs} failed
            </p>
            <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
              {stats.generation.recentJobs.map((j) => (
                <li key={j.id} className="flex items-center justify-between gap-2">
                  <span className={textPrimary}>
                    {j.mode} · {new Date(j.created_at).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    {j.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : j.status === "failed" ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : null}
                    {j.status}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className={`p-6`}>
              <h3 className={`font-bold mb-4 ${textPrimary}`}>Recent uploads</h3>
              <ul className="space-y-2 text-sm">
                {stats.recentMaterials.map((m) => (
                  <li key={m.id} className="flex justify-between gap-2 text-gray-500">
                    <span className={textPrimary}>{m.title}</span>
                    <span>{m.extraction_status}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className={`p-6`}>
              <h3 className={`font-bold mb-4 ${textPrimary}`}>Recent quizzes</h3>
              <ul className="space-y-2 text-sm">
                {stats.recentQuizzes.map((q) => (
                  <li key={q.id} className="flex justify-between gap-2">
                    <span className={textPrimary}>{q.title}</span>
                    <span className="text-gray-500">{q.is_published ? "Published" : "Draft"}</span>
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
