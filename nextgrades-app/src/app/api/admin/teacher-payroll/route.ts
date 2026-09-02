import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import {
  countLessonEntriesInRange,
  formatPayrollMonthLabel,
  monthRangeIso,
  parsePayrollMonth,
  roundMoney,
  sumLessonEarningsInRange,
  type LedgerRow,
} from "@/lib/teachers/payroll";

function serviceUnavailable() {
  return NextResponse.json({ error: "Admin service is not configured." }, { status: 503 });
}

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const { searchParams } = new URL(request.url);
  const { year, month, key: monthKey } = parsePayrollMonth(searchParams.get("month"));
  const { start, end } = monthRangeIso(year, month);

  const admin = createAdminClient();

  try {
    const { data: teachers, error: teachersError } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "teacher")
      .eq("is_active", true)
      .order("full_name", { ascending: true });

    if (teachersError) throw teachersError;

    const teacherIds = (teachers ?? []).map((t) => t.id as string);
    if (!teacherIds.length) {
      return NextResponse.json({
        month: monthKey,
        monthLabel: formatPayrollMonthLabel(year, month),
        teachers: [],
        totals: { lessons: 0, hours: 0, earnings: 0, toPay: 0 },
      });
    }

    const [statsRes, ledgerRes, lessonsRes] = await Promise.all([
      admin.from("teacher_stats").select("teacher_id, hourly_rate, pending_earnings, paid_out_earnings").in("teacher_id", teacherIds),
      admin
        .from("teacher_earnings_ledger")
        .select("id, teacher_id, lesson_id, amount, entry_type, status, note, created_at, paid_at")
        .in("teacher_id", teacherIds)
        .gte("created_at", start)
        .lt("created_at", end),
      admin
        .from("lessons")
        .select("id, teacher_id, student_id, start_time, duration, status, attendance, completed_at, meeting_title")
        .in("teacher_id", teacherIds)
        .in("status", ["completed", "no_show"])
        .gte("completed_at", start)
        .lt("completed_at", end),
    ]);

    if (statsRes.error) throw statsRes.error;
    if (ledgerRes.error) throw ledgerRes.error;
    if (lessonsRes.error) throw lessonsRes.error;

    const statsByTeacher = new Map(
      (statsRes.data ?? []).map((s) => [
        s.teacher_id as string,
        {
          hourlyRate: Number(s.hourly_rate ?? 35),
          pendingEarnings: Number(s.pending_earnings ?? 0),
          paidOutEarnings: Number(s.paid_out_earnings ?? 0),
        },
      ])
    );

    const ledgerByTeacher = new Map<string, LedgerRow[]>();
    for (const row of ledgerRes.data ?? []) {
      const tid = row.teacher_id as string;
      const list = ledgerByTeacher.get(tid) ?? [];
      list.push(row as LedgerRow);
      ledgerByTeacher.set(tid, list);
    }

    const lessonsByTeacher = new Map<string, typeof lessonsRes.data>();
    for (const row of lessonsRes.data ?? []) {
      const tid = row.teacher_id as string;
      const list = lessonsByTeacher.get(tid) ?? [];
      list.push(row);
      lessonsByTeacher.set(tid, list);
    }

    const studentIds = [
      ...new Set((lessonsRes.data ?? []).map((l) => l.student_id as string).filter(Boolean)),
    ];
    const { data: students } = studentIds.length
      ? await admin.from("profiles").select("id, full_name, email").in("id", studentIds)
      : { data: [] };
    const studentName = new Map(
      (students ?? []).map((s) => [s.id as string, (s.full_name as string | null)?.trim() || (s.email as string) || "SchülerIn"])
    );

    let totalLessons = 0;
    let totalHours = 0;
    let totalEarnings = 0;
    let totalToPay = 0;

    const payload = (teachers ?? []).map((teacher) => {
      const id = teacher.id as string;
      const stats = statsByTeacher.get(id) ?? { hourlyRate: 35, pendingEarnings: 0, paidOutEarnings: 0 };
      const ledger = ledgerByTeacher.get(id) ?? [];
      const lessons = lessonsByTeacher.get(id) ?? [];

      const completedLessons = countLessonEntriesInRange(ledger, start, end) || lessons.length;
      const hours = roundMoney(
        lessons.reduce((sum, l) => sum + (Number(l.duration) || 60) / 60, 0)
      );
      const earningsMonth = sumLessonEarningsInRange(ledger, start, end);
      const toPay = sumLessonEarningsInRange(ledger, start, end, "pending");

      const studentsTaught = [...new Set(lessons.map((l) => l.student_id as string))];

      totalLessons += completedLessons;
      totalHours += hours;
      totalEarnings += earningsMonth;
      totalToPay += toPay;

      return {
        teacherId: id,
        name: (teacher.full_name as string | null)?.trim() || (teacher.email as string) || id,
        email: (teacher.email as string | null) ?? null,
        hourlyRate: stats.hourlyRate,
        completedLessons,
        totalHours: hours,
        studentsTaught: studentsTaught.map((sid) => ({
          id: sid,
          name: studentName.get(sid) ?? sid,
        })),
        earningsMonth,
        amountToPay: toPay,
        pendingTotal: stats.pendingEarnings,
        paidOutTotal: stats.paidOutEarnings,
        lessons: lessons.map((l) => ({
          id: l.id as string,
          studentId: l.student_id as string,
          studentName: studentName.get(l.student_id as string) ?? "SchülerIn",
          startTime: l.start_time as string,
          durationMinutes: Number(l.duration) || 60,
          status: l.status as string,
          attendance: (l.attendance as string | null) ?? null,
          completedAt: (l.completed_at as string | null) ?? null,
          title: (l.meeting_title as string | null) ?? null,
        })),
      };
    });

    return NextResponse.json({
      month: monthKey,
      monthLabel: formatPayrollMonthLabel(year, month),
      teachers: payload.sort((a, b) => b.amountToPay - a.amountToPay || b.completedLessons - a.completedLessons),
      totals: {
        lessons: totalLessons,
        hours: roundMoney(totalHours),
        earnings: roundMoney(totalEarnings),
        toPay: roundMoney(totalToPay),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load teacher payroll";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
