"use client";

import { useEffect, useState } from "react";
import { DashboardPage } from "@/components/dashboard/DashboardPage";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AdminKpiCard, AdminKpiStrip } from "@/components/admin/AdminKpiCard";
import { Sparkles, MessageSquare, Zap, Shield, RefreshCw } from "lucide-react";
import { themeInputClass } from "@/lib/theme/form-fields";
import { cn } from "@/lib/utils";

type ChatbotStats = {
  settings: {
    enabled: boolean;
    streaming_enabled: boolean;
    rag_enabled: boolean;
    max_messages_per_minute: number;
    default_model: string;
    system_prompt_override: string | null;
  } | null;
  stats: {
    totalRequests30d: number;
    successRate: number;
    avgLatencyMs: number;
    sessions30d: number;
    messages30d: number;
  };
};

export default function AdminChatbotPage() {
  const [data, setData] = useState<ChatbotStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/chatbot");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateSetting = async (patch: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/chatbot", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const json = await res.json();
        setData((prev) => (prev ? { ...prev, settings: json.settings } : prev));
      }
    } finally {
      setSaving(false);
    }
  };

  const s = data?.settings;
  const stats = data?.stats;

  return (
    <DashboardPage role="admin" titleKey="chatbotAdmin.title" descriptionKey="chatbotAdmin.description">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Badge variant={s?.enabled ? "success" : "warning"}>
            {s?.enabled ? "Enabled" : "Disabled"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <AdminKpiStrip className="sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4">
          <AdminKpiCard
            label="Requests (30d)"
            value={stats?.totalRequests30d ?? "-"}
            icon={MessageSquare}
            iconTone="info"
          />
          <AdminKpiCard
            label="Success rate"
            value={stats ? `${stats.successRate}%` : "-"}
            icon={Shield}
            iconTone="success"
          />
          <AdminKpiCard
            label="Avg latency"
            value={stats ? `${stats.avgLatencyMs}ms` : "-"}
            icon={Zap}
            iconTone="warning"
          />
          <AdminKpiCard
            label="Sessions (30d)"
            value={stats?.sessions30d ?? "-"}
            icon={Sparkles}
            iconTone="gold"
          />
        </AdminKpiStrip>

        <Card hoverable={false} className="p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">Chatbot settings</h3>
          <div className="space-y-4">
            {[
              { key: "enabled", label: "Enable chatbot", value: s?.enabled ?? true },
              { key: "streaming_enabled", label: "Streaming responses", value: s?.streaming_enabled ?? true },
              { key: "rag_enabled", label: "Material context (RAG)", value: s?.rag_enabled ?? true },
            ].map(({ key, label, value }) => (
              <label key={key} className="flex items-center justify-between gap-4 rounded-xl border border-border-default bg-surface-subtle px-4 py-3">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <input
                  type="checkbox"
                  checked={value}
                  disabled={saving}
                  onChange={(e) => void updateSetting({ [key]: e.target.checked })}
                  className="h-5 w-5 rounded accent-[var(--brand-gold)]"
                />
              </label>
            ))}

            <label className="block">
              <span className="text-sm font-medium text-foreground">Rate limit (messages/min)</span>
              <input
                type="number"
                min={5}
                max={60}
                defaultValue={s?.max_messages_per_minute ?? 20}
                disabled={saving}
                onBlur={(e) => void updateSetting({ max_messages_per_minute: Number(e.target.value) })}
                className={cn(themeInputClass, "mt-2 py-2.5")}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-foreground">Default model</span>
              <input
                type="text"
                defaultValue={s?.default_model ?? "llama-3.3-70b-versatile"}
                disabled={saving}
                onBlur={(e) => void updateSetting({ default_model: e.target.value })}
                className={cn(themeInputClass, "mt-2 py-2.5")}
              />
            </label>
          </div>
        </Card>

        <Card hoverable={false} className="p-6">
          <h3 className="mb-2 text-lg font-bold text-foreground">Environment</h3>
          <p className="text-sm leading-relaxed text-text-muted">
            Set <code className="rounded bg-surface-subtle px-1.5 py-0.5 text-foreground">GROQ_API_KEY</code> in{" "}
            <code className="rounded bg-surface-subtle px-1.5 py-0.5 text-foreground">.env.local</code>. Optional
            fallbacks:{" "}
            <code className="rounded bg-surface-subtle px-1.5 py-0.5 text-foreground">OPENROUTER_API_KEY</code>,{" "}
            <code className="rounded bg-surface-subtle px-1.5 py-0.5 text-foreground">TOGETHER_API_KEY</code>.
          </p>
        </Card>
      </div>
    </DashboardPage>
  );
}
