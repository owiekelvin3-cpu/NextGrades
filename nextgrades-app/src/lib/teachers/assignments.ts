import type { SupabaseClient } from "@supabase/supabase-js";

export type AssignmentStatus = "active" | "paused" | "ended";

export type TeacherAssignmentRow = {
  id: string;
  teacher_id: string;
  student_id: string;
  subject_id: string | null;
  class_id: string | null;
  status: AssignmentStatus;
  assigned_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  teacher: { id: string; full_name: string | null; email: string | null } | null;
  student: {
    id: string;
    full_name: string | null;
    email: string | null;
    learning_goal: string | null;
    is_active: boolean | null;
  } | null;
  subject: { id: string; name: string } | null;
  class: { id: string; name: string; level: number | null } | null;
  assigned_by_profile: { id: string; full_name: string | null } | null;
};

const ASSIGNMENT_SELECT = `
  id, teacher_id, student_id, subject_id, class_id, status, assigned_by, notes, created_at, updated_at,
  teacher:profiles!teacher_student_assignments_teacher_id_fkey(id, full_name, email),
  student:profiles!teacher_student_assignments_student_id_fkey(id, full_name, email, learning_goal, is_active),
  subject:subjects(id, name),
  class:classes(id, name, level),
  assigned_by_profile:profiles!teacher_student_assignments_assigned_by_fkey(id, full_name)
`;

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapAssignmentRow(row: Record<string, unknown>): TeacherAssignmentRow {
  return {
    id: row.id as string,
    teacher_id: row.teacher_id as string,
    student_id: row.student_id as string,
    subject_id: (row.subject_id as string | null) ?? null,
    class_id: (row.class_id as string | null) ?? null,
    status: row.status as AssignmentStatus,
    assigned_by: (row.assigned_by as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    teacher: normalizeRelation(row.teacher as TeacherAssignmentRow["teacher"] | TeacherAssignmentRow["teacher"][]),
    student: normalizeRelation(row.student as TeacherAssignmentRow["student"] | TeacherAssignmentRow["student"][]),
    subject: normalizeRelation(row.subject as TeacherAssignmentRow["subject"] | TeacherAssignmentRow["subject"][]),
    class: normalizeRelation(row.class as TeacherAssignmentRow["class"] | TeacherAssignmentRow["class"][]),
    assigned_by_profile: normalizeRelation(
      row.assigned_by_profile as
        | TeacherAssignmentRow["assigned_by_profile"]
        | TeacherAssignmentRow["assigned_by_profile"][]
    ),
  };
}

/** Distinct student IDs with an active assignment to this teacher. */
export async function listAssignedStudentIds(
  db: SupabaseClient,
  teacherId: string
): Promise<string[]> {
  const { data, error } = await db
    .from("teacher_student_assignments")
    .select("student_id")
    .eq("teacher_id", teacherId)
    .eq("status", "active");

  if (error) throw new Error(error.message);
  return [...new Set((data ?? []).map((r) => r.student_id as string).filter(Boolean))];
}

export async function isStudentAssignedToTeacher(
  db: SupabaseClient,
  teacherId: string,
  studentId: string
): Promise<boolean> {
  const { data, error } = await db
    .from("teacher_student_assignments")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("student_id", studentId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data?.id);
}

export async function listTeacherAssignments(
  db: SupabaseClient,
  teacherId: string,
  opts?: { status?: AssignmentStatus | AssignmentStatus[] }
): Promise<TeacherAssignmentRow[]> {
  let query = db
    .from("teacher_student_assignments")
    .select(ASSIGNMENT_SELECT)
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (opts?.status) {
    const statuses = Array.isArray(opts.status) ? opts.status : [opts.status];
    query = query.in("status", statuses);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapAssignmentRow(row as Record<string, unknown>));
}

export async function listAdminAssignments(
  db: SupabaseClient,
  opts?: { status?: AssignmentStatus | AssignmentStatus[]; teacherId?: string; studentId?: string }
): Promise<TeacherAssignmentRow[]> {
  let query = db
    .from("teacher_student_assignments")
    .select(ASSIGNMENT_SELECT)
    .order("created_at", { ascending: false });

  if (opts?.status) {
    const statuses = Array.isArray(opts.status) ? opts.status : [opts.status];
    query = query.in("status", statuses);
  }
  if (opts?.teacherId) query = query.eq("teacher_id", opts.teacherId);
  if (opts?.studentId) query = query.eq("student_id", opts.studentId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapAssignmentRow(row as Record<string, unknown>));
}

export async function createTeacherAssignment(
  db: SupabaseClient,
  input: {
    teacherId: string;
    studentId: string;
    subjectId?: string | null;
    classId?: string | null;
    notes?: string | null;
    assignedBy?: string | null;
    status?: AssignmentStatus;
  }
): Promise<TeacherAssignmentRow> {
  const subjectId = input.subjectId ?? null;
  const now = new Date().toISOString();
  const payload = {
    teacher_id: input.teacherId,
    student_id: input.studentId,
    subject_id: subjectId,
    class_id: input.classId ?? null,
    notes: input.notes?.trim() || null,
    assigned_by: input.assignedBy ?? null,
    status: input.status ?? "active",
    updated_at: now,
  };

  // NULL subject_id does not participate in UNIQUE matching — find manually first.
  let existingQuery = db
    .from("teacher_student_assignments")
    .select("id")
    .eq("teacher_id", input.teacherId)
    .eq("student_id", input.studentId)
    .limit(1);

  existingQuery = subjectId
    ? existingQuery.eq("subject_id", subjectId)
    : existingQuery.is("subject_id", null);

  const { data: existing } = await existingQuery.maybeSingle();

  if (existing?.id) {
    return updateTeacherAssignment(db, existing.id as string, {
      status: payload.status as AssignmentStatus,
      subjectId,
      classId: payload.class_id,
      notes: payload.notes,
    });
  }

  const { data, error } = await db
    .from("teacher_student_assignments")
    .insert(payload)
    .select(ASSIGNMENT_SELECT)
    .single();

  if (error) {
    // Race on unique constraint — fall back to upsert-style update.
    if (error.code === "23505" && subjectId) {
      const { data: conflicted, error: upsertError } = await db
        .from("teacher_student_assignments")
        .upsert(payload, { onConflict: "teacher_id,student_id,subject_id" })
        .select(ASSIGNMENT_SELECT)
        .single();
      if (upsertError) throw new Error(upsertError.message);
      return mapAssignmentRow(conflicted as Record<string, unknown>);
    }
    throw new Error(error.message);
  }

  return mapAssignmentRow(data as Record<string, unknown>);
}

export async function updateTeacherAssignment(
  db: SupabaseClient,
  id: string,
  patch: {
    status?: AssignmentStatus;
    subjectId?: string | null;
    classId?: string | null;
    notes?: string | null;
  }
): Promise<TeacherAssignmentRow> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.subjectId !== undefined) updates.subject_id = patch.subjectId;
  if (patch.classId !== undefined) updates.class_id = patch.classId;
  if (patch.notes !== undefined) updates.notes = patch.notes?.trim() || null;

  const { data, error } = await db
    .from("teacher_student_assignments")
    .update(updates)
    .eq("id", id)
    .select(ASSIGNMENT_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return mapAssignmentRow(data as Record<string, unknown>);
}

export async function endTeacherAssignment(
  db: SupabaseClient,
  id: string
): Promise<TeacherAssignmentRow> {
  return updateTeacherAssignment(db, id, { status: "ended" });
}
