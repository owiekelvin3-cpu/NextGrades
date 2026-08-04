"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Activity, Gauge, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { AdminChartData } from "@/lib/admin/chart-data";
import { cn } from "@/lib/utils";

const CHART_GOLD = "var(--brand-gold)";
const CHART_GOLD_LIGHT = "#e5c158";
const CHART_NAVY = "#1a2740";
const CHART_MUTED = "var(--text-muted)";
const CHART_GRID = "rgba(212, 175, 55, 0.08)";

const ROLE_COLORS = [CHART_GOLD, "#4DA3FF", "#22C55E"];

const panelMotion = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function formatDayLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--brand-gold)]/25 bg-[var(--brand-navy-muted)] px-3 py-2 shadow-lg">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-gold)]">{label}</p>
      <p className="text-sm font-bold text-white">{payload[0].value.toLocaleString("de-DE")}</p>
    </div>
  );
}

type Props = {
  data: AdminChartData;
};

export function AdminAnalyticsCharts({ data }: Props) {
  const { t } = useTranslation();

  const signups = useMemo(
    () => data.signupsByDay.map((d) => ({ label: formatDayLabel(d.date), count: d.count })),
    [data.signupsByDay]
  );
  const activity = useMemo(
    () => data.activityByDay.map((d) => ({ label: formatDayLabel(d.date), count: d.count })),
    [data.activityByDay]
  );
  const roles = useMemo(
    () => [
      { name: t("adminUsers.roleStudent"), value: data.roleBreakdown.student, key: "student" },
      { name: t("adminUsers.roleTeacher"), value: data.roleBreakdown.teacher, key: "teacher" },
      { name: t("adminUsers.roleAdmin"), value: data.roleBreakdown.admin, key: "admin" },
    ],
    [data.roleBreakdown, t]
  );

  const roleTotal = roles.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <motion.div custom={0} variants={panelMotion} initial="hidden" animate="show">
        <ChartPanel
          icon={Plus}
          title={t("adminAnalytics.signupsTitle")}
          subtitle={t("adminAnalytics.last30Days")}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signups} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_GOLD} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={CHART_GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_GRID} strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: CHART_MUTED, fontSize: 10 }}
                  interval="preserveStartEnd"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: CHART_MUTED, fontSize: 10 }}
                  width={28}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={CHART_GOLD}
                  strokeWidth={2.5}
                  fill="url(#signupGradient)"
                  animationDuration={1200}
                  animationEasing="ease-out"
                  dot={false}
                  activeDot={{ r: 5, fill: CHART_GOLD_LIGHT, stroke: CHART_NAVY, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </motion.div>

      <motion.div custom={1} variants={panelMotion} initial="hidden" animate="show">
        <ChartPanel
          icon={Activity}
          title={t("adminAnalytics.activityTitle")}
          subtitle={t("adminAnalytics.last30Days")}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="activityBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_GOLD_LIGHT} />
                    <stop offset="100%" stopColor={CHART_GOLD} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_GRID} strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: CHART_MUTED, fontSize: 10 }}
                  interval="preserveStartEnd"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: CHART_MUTED, fontSize: 10 }}
                  width={28}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="count"
                  fill="url(#activityBar)"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      </motion.div>

      <motion.div custom={2} variants={panelMotion} initial="hidden" animate="show" className="lg:col-span-2">
        <ChartPanel
          icon={Gauge}
          title={t("adminAnalytics.rolesTitle")}
          subtitle={t("adminAnalytics.rolesSubtitle")}
          className="lg:col-span-2"
        >
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative h-64 w-64 shrink-0">
              <div
                className="pointer-events-none absolute inset-6 rounded-full bg-[var(--brand-gold)]/10 blur-2xl"
                aria-hidden
              />
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roles}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={3}
                    animationDuration={1400}
                    animationEasing="ease-out"
                    stroke="none"
                  >
                    {roles.map((_, index) => (
                      <Cell key={index} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tabular-nums text-foreground">{roleTotal}</span>
                <span className="text-xs text-text-muted">{t("adminAnalytics.totalUsers")}</span>
              </div>
            </div>

            <ul className="grid w-full max-w-md gap-3 sm:grid-cols-3 lg:max-w-lg lg:grid-cols-1">
              {roles.map((r, i) => {
                const pct = roleTotal > 0 ? Math.round((r.value / roleTotal) * 100) : 0;
                return (
                  <li
                    key={r.key}
                    className="rounded-xl border border-border-default bg-surface-muted/50 px-4 py-3 transition-colors hover:border-[var(--brand-gold)]/30"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span
                          className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10"
                          style={{ background: ROLE_COLORS[i % ROLE_COLORS.length] }}
                        />
                        {r.name}
                      </span>
                      <span className="text-sm font-bold tabular-nums text-[var(--brand-gold)]">{pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-subtle">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: ROLE_COLORS[i % ROLE_COLORS.length] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-text-muted">
                      {r.value.toLocaleString("de-DE")} {t("adminAnalytics.users")}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </ChartPanel>
      </motion.div>
    </div>
  );
}

function ChartPanel({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon: typeof Plus;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card hoverable={false} className={cn("admin-panel overflow-hidden p-0", className)}>
      <div className="border-b border-border-default bg-gradient-to-r from-[var(--brand-gold)]/10 via-transparent to-transparent px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-gold-muted)] ring-1 ring-[var(--brand-gold)]/20">
            <Icon className="h-5 w-5 text-[var(--brand-gold)]" aria-hidden />
          </span>
          <div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <p className="text-xs text-text-muted">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </Card>
  );
}
