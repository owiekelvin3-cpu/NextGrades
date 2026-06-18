"use client";

import { useEffect, useState } from "react";
import { Shield, AlertTriangle, Lock, Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";

type SecurityPayload = {
  stats: {
    failedLogins7d: number;
    activeLockouts: number;
    recentEventCount: number;
    loginOtpSent: number;
    suspiciousEvents: number;
  };
  recentEvents: Array<{
    id: string;
    event_type: string;
    success: boolean;
    email: string | null;
    ip_address: string | null;
    created_at: string;
  }>;
  activeLockouts: Array<{
    email: string;
    ip_address: string | null;
    failed_attempts: number;
    locked_until: string | null;
  }>;
};

export default function AdminSecurityPage() {
  const [data, setData] = useState<SecurityPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/security")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load security data");
        setData(json);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  const stats = data?.stats;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Shield className="h-7 w-7 text-[#D4AF37]" />
          Security Monitoring
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Failed logins, lockouts, OTP events, and recent audit activity (last 7 days).
        </p>
      </div>

      {error && (
        <Card className="mb-4 border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600">{error}</Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Failed logins (7d)", value: stats?.failedLogins7d ?? "—", icon: AlertTriangle },
          { label: "Active lockouts", value: stats?.activeLockouts ?? "—", icon: Lock },
          { label: "Login OTP sent", value: stats?.loginOtpSent ?? "—", icon: Activity },
          { label: "Suspicious events", value: stats?.suspiciousEvents ?? "—", icon: Shield },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-[#D4AF37]" />
              <div>
                <p className="text-xs text-text-muted">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-border px-4 py-3 font-semibold">Recent security events</div>
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-muted/80 text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-2">Event</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">IP</th>
                  <th className="px-4 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentEvents ?? []).map((e) => (
                  <tr key={e.id} className="border-t border-border/60">
                    <td className="px-4 py-2">
                      <span className={e.success ? "text-green-600" : "text-red-600"}>{e.event_type}</span>
                    </td>
                    <td className="px-4 py-2 text-text-muted">{e.email || "—"}</td>
                    <td className="px-4 py-2 text-text-muted">{e.ip_address || "—"}</td>
                    <td className="px-4 py-2 text-text-muted">{new Date(e.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-border px-4 py-3 font-semibold">Active lockouts</div>
          <div className="max-h-[420px] overflow-auto p-4 text-sm">
            {(data?.activeLockouts ?? []).length === 0 ? (
              <p className="text-text-muted">No active lockouts.</p>
            ) : (
              <ul className="space-y-3">
                {data?.activeLockouts.map((l, i) => (
                  <li key={`${l.email}-${i}`} className="rounded-lg border border-border/60 p-3">
                    <p className="font-medium">{l.email}</p>
                    <p className="text-xs text-text-muted">
                      {l.failed_attempts} failures · IP {l.ip_address || "unknown"} · until{" "}
                      {l.locked_until ? new Date(l.locked_until).toLocaleString() : "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
