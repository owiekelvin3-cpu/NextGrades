import type { SupabaseClient } from "@supabase/supabase-js";

async function isActiveStudent(
  db: SupabaseClient,
  studentId: string
): Promise<boolean> {
  const { data } = await db
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", studentId)
    .maybeSingle();

  if (!data || data.role !== "student") return false;
  return data.is_active !== false;
}

/** Students a teacher may invite to a live class or webinar. */
export async function listEligibleStudentsForTeacher(
  db: SupabaseClient,
  _teacherId: string
): Promise<{ id: string; name: string; remainingUnits: number; totalUnits: number }[]> {
  const { data: profiles } = await db
    .from("profiles")
    .select("id, full_name, is_active")
    .eq("role", "student")
    .order("full_name");

  const active = (profiles ?? []).filter((p) => p.is_active !== false);
  const ids = active.map((p) => p.id as string);
  const unitByStudent = new Map<string, { remaining: number; total: number }>();

  if (ids.length) {
    const { data: units } = await db
      .from("user_units")
      .select("student_id, remaining_units, total_units")
      .in("student_id", ids);
    for (const row of units ?? []) {
      unitByStudent.set(row.student_id as string, {
        remaining: (row.remaining_units as number | null) ?? 0,
        total: (row.total_units as number | null) ?? 0,
      });
    }
  }

  return active.map((p) => {
    const units = unitByStudent.get(p.id as string);
    return {
      id: p.id as string,
      name: (p.full_name as string | null)?.trim() || "Student",
      remainingUnits: units?.remaining ?? 0,
      totalUnits: units?.total ?? 0,
    };
  });
}

export async function isStudentEligibleForTeacher(
  db: SupabaseClient,
  _teacherId: string,
  studentId: string
): Promise<boolean> {
  return isActiveStudent(db, studentId);
}

export async function resolveTargetStudentIds(
  db: SupabaseClient,
  teacherId: string,
  opts: {
    meetingType: string;
    studentId?: string;
    studentIds?: string[];
    subjectId?: string;
  }
): Promise<string[]> {
  const { meetingType, studentId, studentIds, subjectId } = opts;

  if (studentId) {
    const ok = await isStudentEligibleForTeacher(db, teacherId, studentId);
    if (!ok) throw new Error("Selected student was not found");
    return [studentId];
  }

  if (studentIds?.length) {
    const eligible: string[] = [];
    for (const id of studentIds) {
      if (await isStudentEligibleForTeacher(db, teacherId, id)) eligible.push(id);
    }
    if (!eligible.length) throw new Error("No valid students in selection");
    return eligible;
  }

  if (subjectId) {
    const { data: enrollments } = await db
      .from("enrollments")
      .select("student_id")
      .eq("subject_id", subjectId)
      .eq("status", "active");

    const unique = [...new Set((enrollments ?? []).map((e) => e.student_id as string).filter(Boolean))];
    const eligible: string[] = [];
    for (const id of unique) {
      if (await isStudentEligibleForTeacher(db, teacherId, id)) eligible.push(id);
    }
    if (!eligible.length) {
      throw new Error("No students are enrolled in this subject yet");
    }
    return eligible;
  }

  if (meetingType === "private_session") {
    throw new Error("Select a student for private sessions");
  }

  return [];
}
