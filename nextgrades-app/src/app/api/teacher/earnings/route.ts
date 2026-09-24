import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import {
  aggregateLedgerAll,
  aggregateLedgerPeriod,
  monthRangeIso,
  previousMonth,
  roundMoney,
  type LedgerRow,
} from "@/lib/teachers/payroll";

/**
 * Teacher earnings summary + ledger (Notenfabrik-style periods).
 */
export async function GET(request: Request) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 50) || 50));

  try {
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    const prev = previousMonth(thisYear, thisMonth);
    const thisRange = monthRangeIso(thisYear, thisMonth);
    const lastRange = monthRangeIso(prev.year, prev.month);

    const [statsRes, ledgerAllRes, ledgerRecentRes] = await Promise.all([
      db
        .from("teacher_stats")
        .select(
          "hourly_rate, rate_lower_level, rate_upper_level, pending_earnings, paid_out_earnings, earnings_mtd, total_hours, next_payout_at, current_bonus_level"
        )
        .eq("teacher_id", teacherId)
        .maybeSingle(),
      db
        .from("teacher_earnings_ledger")
        .select("id, lesson_id, amount, entry_type, status, note, created_at, paid_at")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false }),
      db
        .from("teacher_earnings_ledger")
        .select("id, lesson_id, amount, currency, entry_type, status, note, created_at, paid_at")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    if (statsRes.error) throw new Error(statsRes.error.message);
    if (ledgerAllRes.error) throw new Error(ledgerAllRes.error.message);
    if (ledgerRecentRes.error) throw new Error(ledgerRecentRes.error.message);

    const stats = statsRes.data;
    const allEntries = (ledgerAllRes.data ?? []) as LedgerRow[];
    const ledger = ledgerRecentRes.data ?? [];

    const hourlyFallback = Number(stats?.hourly_rate ?? 35);
    const rateLower = Number(stats?.rate_lower_level ?? hourlyFallback);
    const rateUpper = Number(stats?.rate_upper_level ?? hourlyFallback);

    const lastMonth = aggregateLedgerPeriod(allEntries, lastRange.start, lastRange.end);
    const thisMonthStats = aggregateLedgerPeriod(allEntries, thisRange.start, thisRange.end);
    const totals = aggregateLedgerAll(allEntries);

    const pendingFromLedger = allEntries
      .filter((e) => e.status === "pending" && e.entry_type !== "payout")
      .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

    return NextResponse.json({
      rates: {
        lowerLevel: roundMoney(rateLower),
        upperLevel: roundMoney(rateUpper),
        hourlyRate: roundMoney(hourlyFallback),
      },
      periods: {
        lastMonth,
        thisMonth: thisMonthStats,
        total: totals,
      },
      summary: {
        hourlyRate: roundMoney(hourlyFallback),
        rateLowerLevel: roundMoney(rateLower),
        rateUpperLevel: roundMoney(rateUpper),
        pendingEarnings: Number(stats?.pending_earnings ?? pendingFromLedger),
        paidOutEarnings: Number(stats?.paid_out_earnings ?? 0),
        earningsMtd: thisMonthStats.earnings,
        completedLessonsThisMonth: thisMonthStats.units,
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
