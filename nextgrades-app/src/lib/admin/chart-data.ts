import { supabase } from "@/lib/supabase/client";
import { isSupabaseEnvConfigured } from "@/lib/supabase/env";

export type DailyCount = { date: string; count: number };

export type AdminChartData = {
  signupsByDay: DailyCount[];
  activityByDay: DailyCount[];
  roleBreakdown: { student: number; teacher: number; admin: number };
};

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function countByDay(rows: { created_at: string }[], days: string[]): DailyCount[] {
  const map = new Map(days.map((d) => [d, 0]));
  for (const row of rows) {
    const key = row.created_at.slice(0, 10);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return days.map((date) => ({ date, count: map.get(date) ?? 0 }));
}

export async function fetchAdminChartData(): Promise<AdminChartData> {
  const empty: AdminChartData = {
    signupsByDay: lastNDays(30).map((date) => ({ date, count: 0 })),
    activityByDay: lastNDays(30).map((date) => ({ date, count: 0 })),
    roleBreakdown: { student: 0, teacher: 0, admin: 0 },
  };

  if (!isSupabaseEnvConfigured()) return empty;

  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  const [profilesRes, activityRes, roleCounts] = await Promise.all([
    supabase.from("profiles").select("created_at").gte("created_at", sinceIso),
    supabase.from("activity_logs").select("created_at").gte("created_at", sinceIso),
    Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
    ]),
  ]);

  const days = lastNDays(30);
  const profiles = (profilesRes.data ?? []) as { created_at: string }[];
  const activities = (activityRes.data ?? []) as { created_at: string }[];

  return {
    signupsByDay: countByDay(profiles, days),
    activityByDay: countByDay(activities, days),
    roleBreakdown: {
      student: roleCounts[0].count ?? 0,
      teacher: roleCounts[1].count ?? 0,
      admin: roleCounts[2].count ?? 0,
    },
  };
}
