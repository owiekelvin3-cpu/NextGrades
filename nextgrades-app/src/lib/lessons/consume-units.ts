import type { SupabaseClient } from "@supabase/supabase-js";


export function lessonHasMeetingLink(lesson: {
  meeting_url?: string | null;
  zoom_link?: string | null;
  zoom_meeting_id?: string | null;
}): boolean {
  return Boolean(lesson.meeting_url || lesson.zoom_link || lesson.zoom_meeting_id);
}

/** A prepaid unit is used after a linked meeting's scheduled end time. */
export function lessonShouldConsumeUnit(
  lesson: {
    status: string;
    units_consumed?: boolean | null;
    start_time: string;
    duration: number | null;
    meeting_url?: string | null;
    zoom_link?: string | null;
    zoom_meeting_id?: string | null;
  },
  now = Date.now()
): boolean {
  if (lesson.units_consumed) return false;
  if (lesson.status !== "scheduled") return false;
  if (!lessonHasMeetingLink(lesson)) return false;
  const end = new Date(lesson.start_time).getTime() + (Number(lesson.duration) || 60) * 60_000;
  return Number.isFinite(end) && end <= now;
}

export async function decrementStudentUnit(db: SupabaseClient, studentId: string): Promise<void> {
  const { data: units } = await db
    .from("user_units")
    .select("remaining_units, total_units")
    .eq("student_id", studentId)
    .maybeSingle();

  if (!units) return;
  if ((units.total_units ?? 0) <= 0 && (units.remaining_units ?? 0) <= 0) return;

  await db
    .from("user_units")
    .update({
      remaining_units: Math.max(0, (units.remaining_units ?? 0) - 1),
      updated_at: new Date().toISOString(),
    })
    .eq("student_id", studentId);
}

/** Credits are deducted only when a teacher clicks Complete Lesson — not automatically. */
export async function settleHeldLessonUnits(_db: SupabaseClient): Promise<number> {
  return 0;
}

export async function restoreLessonUnitOnCancel(
  db: SupabaseClient,
  lesson: { id: string; student_id: string; units_consumed?: boolean | null }
): Promise<void> {
  if (!lesson.units_consumed) return;

  await db
    .from("lessons")
    .update({ units_consumed: false, updated_at: new Date().toISOString() })
    .eq("id", lesson.id);

  const { data: units } = await db
    .from("user_units")
    .select("remaining_units, total_units")
    .eq("student_id", lesson.student_id)
    .maybeSingle();

  if (!units) return;

  await db
    .from("user_units")
    .update({
      remaining_units:
        (units.total_units ?? 0) > 0
          ? Math.min(units.total_units, (units.remaining_units ?? 0) + 1)
          : (units.remaining_units ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("student_id", lesson.student_id);
}
