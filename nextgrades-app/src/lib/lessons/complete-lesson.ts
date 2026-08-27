import type { SupabaseClient } from "@supabase/supabase-js";
import { decrementStudentUnit } from "@/lib/lessons/consume-units";
import { notifyLessonCompleted } from "@/lib/notifications/triggers";

export type LessonAttendanceStatus = "attended" | "excused" | "no_show";

export type CompleteLessonResult = {
  lesson: Record<string, unknown>;
  deducted: boolean;
  earningsAmount: number;
  ledgerId: string | null;
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

async function upsertLessonAttendance(
  db: SupabaseClient,
  opts: {
    lessonId: string;
    studentId: string;
    status: LessonAttendanceStatus;
    markedBy: string;
  }
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await db.from("lesson_attendance").upsert(
    {
      lesson_id: opts.lessonId,
      student_id: opts.studentId,
      status: opts.status,
      marked_by: opts.markedBy,
      updated_at: now,
    },
    { onConflict: "lesson_id,student_id" }
  );
  if (error) throw new Error(error.message);
}

async function ensureTeacherStats(
  db: SupabaseClient,
  teacherId: string
): Promise<{
  hourly_rate: number;
  pending_earnings: number;
  earnings_mtd: number;
  total_hours: number;
}> {
  const { data: existing } = await db
    .from("teacher_stats")
    .select("hourly_rate, pending_earnings, earnings_mtd, total_hours")
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (existing) {
    return {
      hourly_rate: Number(existing.hourly_rate ?? 35),
      pending_earnings: Number(existing.pending_earnings ?? 0),
      earnings_mtd: Number(existing.earnings_mtd ?? 0),
      total_hours: Number(existing.total_hours ?? 0),
    };
  }

  const { data: created, error } = await db
    .from("teacher_stats")
    .insert({
      teacher_id: teacherId,
      hourly_rate: 35,
      pending_earnings: 0,
      paid_out_earnings: 0,
      earnings_mtd: 0,
      total_hours: 0,
    })
    .select("hourly_rate, pending_earnings, earnings_mtd, total_hours")
    .single();

  if (error) throw new Error(error.message);
  return {
    hourly_rate: Number(created.hourly_rate ?? 35),
    pending_earnings: Number(created.pending_earnings ?? 0),
    earnings_mtd: Number(created.earnings_mtd ?? 0),
    total_hours: Number(created.total_hours ?? 0),
  };
}

/**
 * Teacher marks a lesson complete (or no-show).
 * - attended: status=completed, deduct unit, pending earnings
 * - excused: status=completed, no deduct, no earnings
 * - no_show: status=no_show, deduct unit (slot used), pending earnings
 */
export async function completeLessonByTeacher(
  db: SupabaseClient,
  opts: {
    lessonId: string;
    teacherId: string;
    attendance?: LessonAttendanceStatus;
  }
): Promise<CompleteLessonResult> {
  const attendance: LessonAttendanceStatus = opts.attendance ?? "attended";
  if (!["attended", "excused", "no_show"].includes(attendance)) {
    throw new Error("Invalid attendance value");
  }

  const { data: lesson, error: fetchError } = await db
    .from("lessons")
    .select(
      "id, teacher_id, student_id, subject_id, status, start_time, duration, meeting_title, units_consumed, attendance, completed_at"
    )
    .eq("id", opts.lessonId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!lesson) throw new Error("Lesson not found");
  if (lesson.teacher_id !== opts.teacherId) {
    throw new Error("Lesson does not belong to this teacher");
  }
  if (lesson.status === "cancelled") {
    throw new Error("Cancelled lessons cannot be completed");
  }

  const shouldDeduct = attendance === "attended" || attendance === "no_show";
  const shouldEarn = shouldDeduct;
  const nextStatus = attendance === "no_show" ? "no_show" : "completed";
  const durationMinutes = Number(lesson.duration) || 60;
  const hours = durationMinutes / 60;
  const now = new Date().toISOString();

  const alreadyConsumed = Boolean(lesson.units_consumed);
  let deducted = false;

  const updates: Record<string, unknown> = {
    status: nextStatus,
    attendance,
    completed_at: lesson.completed_at ?? now,
    updated_at: now,
  };

  if (shouldDeduct && !alreadyConsumed) {
    updates.units_consumed = true;
  }

  const { data: updated, error: updateError } = await db
    .from("lessons")
    .update(updates)
    .eq("id", opts.lessonId)
    .eq("teacher_id", opts.teacherId)
    .select()
    .single();

  if (updateError || !updated) {
    throw new Error(updateError?.message || "Failed to complete lesson");
  }

  await upsertLessonAttendance(db, {
    lessonId: opts.lessonId,
    studentId: lesson.student_id as string,
    status: attendance,
    markedBy: opts.teacherId,
  });

  if (shouldDeduct && !alreadyConsumed) {
    await decrementStudentUnit(db, lesson.student_id as string);
    deducted = true;
  }

  let earningsAmount = 0;
  let ledgerId: string | null = null;

  if (shouldEarn) {
    const stats = await ensureTeacherStats(db, opts.teacherId);
    earningsAmount = roundMoney(stats.hourly_rate * hours);

    const { data: existingLedger } = await db
      .from("teacher_earnings_ledger")
      .select("id, amount, status")
      .eq("lesson_id", opts.lessonId)
      .eq("entry_type", "lesson_completed")
      .neq("status", "void")
      .maybeSingle();

    if (!existingLedger) {
      const { data: ledger, error: ledgerError } = await db
        .from("teacher_earnings_ledger")
        .insert({
          teacher_id: opts.teacherId,
          lesson_id: opts.lessonId,
          amount: earningsAmount,
          currency: "EUR",
          entry_type: "lesson_completed",
          status: "pending",
          note:
            attendance === "no_show"
              ? "No-show – slot reserved"
              : `Lesson completed (${durationMinutes} min)`,
        })
        .select("id")
        .single();

      if (ledgerError) throw new Error(ledgerError.message);
      ledgerId = ledger.id as string;

      await db
        .from("teacher_stats")
        .update({
          pending_earnings: roundMoney(stats.pending_earnings + earningsAmount),
          earnings_mtd: roundMoney(stats.earnings_mtd + earningsAmount),
          total_hours: roundMoney(stats.total_hours + hours),
          updated_at: now,
        })
        .eq("teacher_id", opts.teacherId);
    } else {
      ledgerId = existingLedger.id as string;
      earningsAmount = Number(existingLedger.amount ?? earningsAmount);
    }
  }

  const title =
    (lesson.meeting_title as string | null)?.trim() ||
    "deine Stunde";

  void notifyLessonCompleted({
    lessonId: opts.lessonId,
    studentId: lesson.student_id as string,
    teacherId: opts.teacherId,
    title,
    attendance,
    deducted,
  });

  return {
    lesson: updated as Record<string, unknown>,
    deducted,
    earningsAmount,
    ledgerId,
  };
}

/** Set attendance without changing completion status when already terminal. */
export async function setLessonAttendanceByTeacher(
  db: SupabaseClient,
  opts: {
    lessonId: string;
    teacherId: string;
    attendance: LessonAttendanceStatus;
  }
): Promise<{ lesson: Record<string, unknown> }> {
  const { attendance } = opts;
  if (!["attended", "excused", "no_show"].includes(attendance)) {
    throw new Error("Invalid attendance value");
  }

  const { data: lesson, error: fetchError } = await db
    .from("lessons")
    .select("id, teacher_id, student_id, status")
    .eq("id", opts.lessonId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!lesson) throw new Error("Lesson not found");
  if (lesson.teacher_id !== opts.teacherId) {
    throw new Error("Lesson does not belong to this teacher");
  }
  if (lesson.status === "cancelled") {
    throw new Error("Cancelled lessons cannot be updated");
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await db
    .from("lessons")
    .update({ attendance, updated_at: now })
    .eq("id", opts.lessonId)
    .eq("teacher_id", opts.teacherId)
    .select()
    .single();

  if (updateError || !updated) {
    throw new Error(updateError?.message || "Failed to update attendance");
  }

  await upsertLessonAttendance(db, {
    lessonId: opts.lessonId,
    studentId: lesson.student_id as string,
    status: attendance,
    markedBy: opts.teacherId,
  });

  return { lesson: updated as Record<string, unknown> };
}
