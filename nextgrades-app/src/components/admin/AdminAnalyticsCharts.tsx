"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { fetchAdminChartData } from "@/lib/admin/chart-data";
import { cn } from "@/lib/utils";

const CHART_GOLD = "var(--brand-gold)";
const CHART_NAVY = "var(--brand-navy)";
const CHART_MUTED = "var(--text-muted)";

const ROLE_COLORS = [CHART_GOLD, "#4DA3FF", "#22C55E"];

function formatDayLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function AdminAnalyticsCharts() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [signups, setSignups] = useState<{ label: string; count: number }[]>([]);
  const [activity, setActivity] = useState<{ label: string; count: number }[]>([]);
  const [roles, setRoles] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchAdminChartData();
        setSignups(data.signupsByDay.map((d) => ({ label: formatDayLabel(d.date), count: d.count })));
        setActivity(data.activityByDay.map((d) => ({ label: formatDayLabel(d.date), count: d.count })));
        setRoles([
          { name: t("adminUsers.roleStudent"), value: data.roleBreakdown.student },
          { name: t("adminUsers.roleTeacher"), value: data.roleBreakdown.teacher },
          { name: t("adminUsers.roleAdmin"), value: data.roleBreakdown.admin },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} hoverable={false} className={cn(i === 3 ? "lg:col-span-2" : "", "h-72 animate-pulse bg-surface-subtle")} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card hoverable={false} className="p-5 sm:p-6">
        <h3 className="mb-4 text-base font-bold text-foreground">{t("adminAnalytics.signupsTitle")}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={signups}>
              <XAxis dataKey="label" tick={{ fill: CHART_MUTED, fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fill: CHART_MUTED, fontSize: 11 }} width={32} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--table-border)",
                  borderRadius: "0.75rem",
                }}
              />
              <Line type="monotone" dataKey="count" stroke={CHART_GOLD} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card hoverable={false} className="p-5 sm:p-6">
        <h3 className="mb-4 text-base font-bold text-foreground">{t("adminAnalytics.activityTitle")}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activity}>
              <XAxis dataKey="label" tick={{ fill: CHART_MUTED, fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fill: CHART_MUTED, fontSize: 11 }} width={32} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--table-border)",
                  borderRadius: "0.75rem",
                }}
              />
              <Bar dataKey="count" fill={CHART_NAVY} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card hoverable={false} className="p-5 sm:p-6 lg:col-span-2">
        <h3 className="mb-4 text-base font-bold text-foreground">{t("adminAnalytics.rolesTitle")}</h3>
        <div className="mx-auto h-64 max-w-sm">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={roles} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={2}>
                {roles.map((_, index) => (
                  <Cell key={index} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--table-border)",
                  borderRadius: "0.75rem",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-text-muted">
          {roles.map((r, i) => (
            <li key={r.name} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: ROLE_COLORS[i % ROLE_COLORS.length] }}
              />
              {r.name}: {r.value}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
