import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { monthRangeIso, sumLessonEarningsInRange, type LedgerRow } from "@/lib/teachers/payroll";

/**
 * Teacher earnings summary + ledger.
 * Intentionally excludes customer/Stripe payment data — only teacher_stats + teacher_earnings_ledger.
 */
export async function GET(request: Request) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 50) || 50));

  try {
    const [statsRes, ledgerRes, monthLedgerRes] = await Promise.all([
      db
        .from("teacher_stats")
        .select(
          "hourly_rate, pending_earnings, paid_out_earnings, earnings_mtd, total_hours, next_payout_at, current_bonus_level"
        )
        .eq("teacher_id", teacherId)
        .maybeSingle(),
      db
        .from("teacher_earnings_ledger")
        .select("id, lesson_id, amount, currency, entry_type, status, note, created_at, paid_at")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false })
        .limit(limit),
      (() => {
        const now = new Date();
        const { start, end } = monthRangeIso(now.getFullYear(), now.getMonth() + 1);
        return db
          .from("teacher_earnings_ledger")
          .select("id, lesson_id, amount, entry_type, status, created_at")
          .eq("teacher_id", teacherId)
          .gte("created_at", start)
          .lt("created_at", end);
      })(),
    ]);

    if (statsRes.error) throw new Error(statsRes.error.message);
    if (ledgerRes.error) throw new Error(ledgerRes.error.message);
    if (monthLedgerRes.error) throw new Error(monthLedgerRes.error.message);

    const stats = statsRes.data;
    const ledger = ledgerRes.data ?? [];
    const monthLedger = (monthLedgerRes.data ?? []) as LedgerRow[];
    const { start, end } = monthRangeIso(new Date().getFullYear(), new Date().getMonth() + 1);
    const earningsMtd = sumLessonEarningsInRange(monthLedger, start, end);

    const pendingFromLedger = ledger
      .filter((e) => e.status === "pending" && e.entry_type !== "payout")
      .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

    return NextResponse.json({
      summary: {
        hourlyRate: Number(stats?.hourly_rate ?? 35),
        pendingEarnings: Number(stats?.pending_earnings ?? pendingFromLedger),
        paidOutEarnings: Number(stats?.paid_out_earnings ?? 0),
        earningsMtd,
        completedLessonsThisMonth: monthLedger.filter(
          (e) => e.entry_type === "lesson_completed" && e.status !== "void"
        ).length,
        totalHours: Number(stats?.total_hours ?? 0),
        nextPayoutAt: (stats?.next_payout_at as string | null) ?? null,
        bonusLevel: Number(stats?.current_bonus_level ?? 1),
      },
      ledger: ledger.map((e) => ({
        id: e.id as string,
        lessonId: (e.lesson_id as string | null) ?? null,
        amount: Number(e.amount ?? 0),
        currency: (e.currency as string) || "EUR",
        entryType: e.entry_type as string,
        status: e.status as string,
        note: (e.note as string | null) ?? null,
        createdAt: e.created_at as string,
        paidAt: (e.paid_at as string | null) ?? null,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load earnings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
