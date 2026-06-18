import type { SupabaseClient } from "@supabase/supabase-js";

/** Students linked to a teacher via prior lessons or shared subject enrollments. */
async function getTeacherLinkedStudentIds(
  db: SupabaseClient,
  teacherId: string
): Promise<Set<string>> {
  const ids = new Set<string>();
  const subjectIds = new Set<string>();

  const [{ data: lessons }, { data: notes }] = await Promise.all([
    db.from("lessons").select("student_id, subject_id").eq("teacher_id", teacherId),
    db.from("teacher_student_notes").select("student_id").eq("teacher_id", teacherId),
  ]);

  for (const row of lessons ?? []) {
    if (row.student_id) ids.add(row.student_id as string);
    if (row.subject_id) subjectIds.add(row.subject_id as string);
  }
  for (const row of notes ?? []) {
    if (row.student_id) ids.add(row.student_id as string);
  }

  if (subjectIds.size > 0) {
    const { data: enrollments } = await db
      .from("enrollments")
      .select("student_id")
      .eq("status", "active")
      .in("subject_id", [...subjectIds]);

    for (const row of enrollments ?? []) {
      if (row.student_id) ids.add(row.student_id as string);
    }
  }

  return ids;
}

/** Students a teacher may schedule: linked students only (never platform-wide). */
export async function listEligibleStudentsForTeacher(
  db: SupabaseClient,
  teacherId: string
): Promise<{ id: string; name: string }[]> {
  const ids = await getTeacherLinkedStudentIds(db, teacherId);
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
  const linked = await getTeacherLinkedStudentIds(db, teacherId);
  return linked.has(studentId);
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
    const { data: teachesSubject } = await db
      .from("lessons")
      .select("id")
      .eq("teacher_id", teacherId)
      .eq("subject_id", subjectId)
      .limit(1)
      .maybeSingle();

    if (!teachesSubject) {
      throw new Error("You are not assigned to this subject");
    }

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
    if (!eligible.length) {
      throw new Error("No eligible students enrolled in this subject");
    }
    return eligible;
  }

  if (meetingType === "private_session") {
    throw new Error("Select a student for private sessions");
  }

  return [];
}
