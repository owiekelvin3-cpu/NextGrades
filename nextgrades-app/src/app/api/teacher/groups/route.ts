import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/** Tutoring groups assigned to the teacher, with members. */
export async function GET() {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;

  try {
    const { data: groups, error } = await db
      .from("tutoring_groups")
      .select(
        `
        id, name, subject_id, class_id, teacher_id, schedule_notes, meeting_url, is_active, created_at, updated_at,
        subject:subjects(id, name),
        class:classes(id, name, level),
        members:tutoring_group_members(
          id, student_id, joined_at,
          student:profiles!tutoring_group_members_student_id_fkey(id, full_name, email)
        )
      `
      )
      .eq("teacher_id", teacherId)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    const payload = (groups ?? []).map((g) => {
      const row = g as Record<string, unknown>;
      const membersRaw = (row.members as Record<string, unknown>[] | null) ?? [];
      return {
        id: row.id as string,
        name: row.name as string,
        subjectId: (row.subject_id as string | null) ?? null,
        classId: (row.class_id as string | null) ?? null,
        scheduleNotes: (row.schedule_notes as string | null) ?? null,
        meetingUrl: (row.meeting_url as string | null) ?? null,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        subject: normalizeRelation(
          row.subject as { id: string; name: string } | { id: string; name: string }[] | null
        ),
        class: normalizeRelation(
          row.class as
            | { id: string; name: string; level: number | null }
            | { id: string; name: string; level: number | null }[]
            | null
        ),
        members: membersRaw.map((m) => {
          const student = normalizeRelation(
            m.student as
              | { id: string; full_name: string | null; email: string | null }
              | { id: string; full_name: string | null; email: string | null }[]
              | null
          );
          return {
            id: m.id as string,
            studentId: m.student_id as string,
            joinedAt: m.joined_at as string,
            name: student?.full_name?.trim() || "Student",
            email: student?.email ?? null,
          };
        }),
      };
    });

    return NextResponse.json({ groups: payload });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load groups";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
