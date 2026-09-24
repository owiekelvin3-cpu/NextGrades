import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { fetchTeacherBonusOverview } from "@/lib/teachers/nextjump-bonus";
import { roundMoney } from "@/lib/teachers/payroll";

export async function GET() {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;

  try {
    const { data: stats } = await db
      .from("teacher_stats")
      .select("hourly_rate, rate_lower_level, rate_upper_level, current_bonus_level")
      .eq("teacher_id", teacherId)
      .maybeSingle();

    const fallback = Number(stats?.hourly_rate ?? 35);
    const rates = {
      lowerLevel: roundMoney(Number(stats?.rate_lower_level ?? fallback)),
      upperLevel: roundMoney(Number(stats?.rate_upper_level ?? fallback)),
    };

    let bonusOverview = { loyalty: { lessonsCompleted: 0, bonusPerHour: 0, periodEnd: "", nextTarget: null as number | null }, students: [] as Awaited<ReturnType<typeof fetchTeacherBonusOverview>>["students"] };

    try {
      bonusOverview = await fetchTeacherBonusOverview(db, teacherId);
    } catch {
      /* tables may not exist yet */
    }

    return NextResponse.json({
      rates,
      bonusLevel: Number(stats?.current_bonus_level ?? 1),
      ...bonusOverview,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load bonus data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
