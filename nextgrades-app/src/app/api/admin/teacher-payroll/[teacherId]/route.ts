import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import {
  monthRangeIso,
  parsePayrollMonth,
  roundMoney,
  sumLessonEarningsInRange,
  type LedgerRow,
} from "@/lib/teachers/payroll";

type RouteParams = { params: Promise<{ teacherId: string }> };

function serviceUnavailable() {
  return NextResponse.json({ error: "Admin service is not configured." }, { status: 503 });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const { teacherId } = await params;
  if (!teacherId) return NextResponse.json({ error: "teacherId is required." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as {
    hourlyRate?: number;
    action?: string;
    month?: string;
  };

  const admin = createAdminClient();
  const now = new Date().toISOString();

  try {
    const { data: teacher } = await admin
      .from("profiles")
      .select("id, role, full_name, email")
      .eq("id", teacherId)
      .maybeSingle();

    if (!teacher || teacher.role !== "teacher") {
      return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
    }

    if (body.hourlyRate !== undefined) {
      const rate = Number(body.hourlyRate);
      if (!Number.isFinite(rate) || rate < 0 || rate > 500) {
        return NextResponse.json({ error: "Invalid hourly rate." }, { status: 400 });
      }

      const { data: existing } = await admin
        .from("teacher_stats")
        .select("teacher_id")
        .eq("teacher_id", teacherId)
        .maybeSingle();

      if (existing) {
        const { error } = await admin
          .from("teacher_stats")
          .update({ hourly_rate: roundMoney(rate), updated_at: now })
          .eq("teacher_id", teacherId);
        if (error) throw error;
      } else {
        const { error } = await admin.from("teacher_stats").insert({
          teacher_id: teacherId,
          hourly_rate: roundMoney(rate),
          pending_earnings: 0,
          paid_out_earnings: 0,
          earnings_mtd: 0,
          total_hours: 0,
        });
        if (error) throw error;
      }

      return NextResponse.json({ ok: true, hourlyRate: roundMoney(rate) });
    }

    if (body.action === "markPaid") {
      const { year, month, key: monthKey } = parsePayrollMonth(body.month);
      const { start, end } = monthRangeIso(year, month);

      const { data: pendingEntries, error: ledgerError } = await admin
        .from("teacher_earnings_ledger")
        .select("id, amount, status, entry_type, created_at")
        .eq("teacher_id", teacherId)
        .eq("entry_type", "lesson_completed")
        .eq("status", "pending")
        .gte("created_at", start)
        .lt("created_at", end);

      if (ledgerError) throw ledgerError;

      const entries = (pendingEntries ?? []) as LedgerRow[];
      const payoutAmount = sumLessonEarningsInRange(entries, start, end, "pending");

      if (payoutAmount <= 0) {
        return NextResponse.json({ error: "No pending earnings for this month." }, { status: 400 });
      }

      const { data: stats } = await admin
        .from("teacher_stats")
        .select("pending_earnings, paid_out_earnings")
        .eq("teacher_id", teacherId)
        .maybeSingle();

      const pendingBefore = Number(stats?.pending_earnings ?? 0);
      const paidBefore = Number(stats?.paid_out_earnings ?? 0);

      const { error: payoutError } = await admin.from("teacher_earnings_ledger").insert({
        teacher_id: teacherId,
        lesson_id: null,
        amount: payoutAmount,
        currency: "EUR",
        entry_type: "payout",
        status: "paid",
        note: `Auszahlung ${monthKey}`,
        paid_at: now,
      });
      if (payoutError) throw payoutError;

      const entryIds = entries.map((e) => e.id);
      const { error: markError } = await admin
        .from("teacher_earnings_ledger")
        .update({ status: "paid", paid_at: now })
        .in("id", entryIds);
      if (markError) throw markError;

      await admin
        .from("teacher_stats")
        .update({
          pending_earnings: roundMoney(Math.max(0, pendingBefore - payoutAmount)),
          paid_out_earnings: roundMoney(paidBefore + payoutAmount),
          updated_at: now,
        })
        .eq("teacher_id", teacherId);

      return NextResponse.json({
        ok: true,
        month: monthKey,
        amountPaid: payoutAmount,
        lessonsMarked: entryIds.length,
      });
    }

    return NextResponse.json({ error: "No valid update." }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update teacher payroll";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
