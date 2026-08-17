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
): Promise<{ id: string; name: string }[]> {
  const { data: profiles } = await db
    .from("profiles")
    .select("id, full_name")
    .eq("role", "student")
    .order("full_name");

  return (profiles ?? [])
    .map((p) => ({
      id: p.id as string,
      name: (p.full_name as string | null)?.trim() || "Student",
    }));
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
