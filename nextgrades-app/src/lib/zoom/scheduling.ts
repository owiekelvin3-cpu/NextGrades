import type { SupabaseClient } from "@supabase/supabase-js";

/** Students a teacher may schedule: active enrollments + prior lesson students. */
export async function listEligibleStudentsForTeacher(
  db: SupabaseClient,
  teacherId: string
): Promise<{ id: string; name: string }[]> {
  const [{ data: enrollments }, { data: priorLessons }] = await Promise.all([
    db.from("enrollments").select("student_id").eq("status", "active"),
    db.from("lessons").select("student_id").eq("teacher_id", teacherId),
  ]);

  const ids = new Set<string>();
  for (const row of enrollments ?? []) {
    if (row.student_id) ids.add(row.student_id as string);
  }
  for (const row of priorLessons ?? []) {
    if (row.student_id) ids.add(row.student_id as string);
  }

  if (ids.size === 0) return [];

  const { data: profiles } = await db
    .from("profiles")
    .select("id, full_name")
    .in("id", [...ids])
    .eq("role", "student")
    .order("full_name");

  return (profiles ?? []).map((p) => ({
    id: p.id as string,
    name: (p.full_name as string | null)?.trim() || "Student",
  }));
}

export async function isStudentEligibleForTeacher(
  db: SupabaseClient,
  teacherId: string,
  studentId: string
): Promise<boolean> {
  const { data: enrollment } = await db
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (enrollment) return true;

  const { data: prior } = await db
    .from("lessons")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("student_id", studentId)
    .limit(1)
    .maybeSingle();

  return Boolean(prior);
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
    if (!ok) throw new Error("Selected student is not enrolled or assigned to you");
    return [studentId];
  }

  if (studentIds?.length) {
    const eligible: string[] = [];
    for (const id of studentIds) {
      if (await isStudentEligibleForTeacher(db, teacherId, id)) eligible.push(id);
    }
    if (!eligible.length) throw new Error("No eligible students in selection");
    return eligible;
  }

  if (subjectId) {
    const { data: enrollments } = await db
      .from("enrollments")
      .select("student_id")
      .eq("subject_id", subjectId)
      .eq("status", "active");

    const ids = (enrollments ?? []).map((e) => e.student_id as string);
    const eligible: string[] = [];
    for (const id of ids) {
      if (await isStudentEligibleForTeacher(db, teacherId, id)) eligible.push(id);
    }
    return eligible;
  }

  if (meetingType === "private_session") {
    throw new Error("Select a student for private sessions");
  }

  return [];
}
