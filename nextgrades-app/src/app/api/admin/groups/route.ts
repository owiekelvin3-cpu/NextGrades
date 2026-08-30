import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";

function serviceUnavailable() {
  return NextResponse.json({ error: "Admin service is not configured." }, { status: 503 });
}

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

const GROUP_SELECT = `
  id, name, subject_id, class_id, teacher_id, schedule_notes, meeting_url, is_active, created_at, updated_at,
  teacher:profiles!tutoring_groups_teacher_id_fkey(id, full_name, email),
  subject:subjects(id, name),
  class:classes(id, name, level),
  members:tutoring_group_members(
    id, student_id, joined_at,
    student:profiles!tutoring_group_members_student_id_fkey(id, full_name, email)
  )
`;

function mapGroup(row: Record<string, unknown>) {
  const membersRaw = (row.members as Record<string, unknown>[] | null) ?? [];
  return {
    id: row.id as string,
    name: row.name as string,
    subjectId: (row.subject_id as string | null) ?? null,
    classId: (row.class_id as string | null) ?? null,
    teacherId: row.teacher_id as string,
    scheduleNotes: (row.schedule_notes as string | null) ?? null,
    meetingUrl: (row.meeting_url as string | null) ?? null,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at as string,
    teacher: normalizeRelation(
      row.teacher as { id: string; full_name: string | null; email: string | null } | null
    ),
    subject: normalizeRelation(row.subject as { id: string; name: string } | null),
    class: normalizeRelation(
      row.class as { id: string; name: string; level: number | null } | null
    ),
    members: membersRaw.map((m) => {
      const student = normalizeRelation(
        m.student as { id: string; full_name: string | null; email: string | null } | null
      );
      return {
        id: m.id as string,
        studentId: m.student_id as string,
        joinedAt: m.joined_at as string,
        name: student?.full_name?.trim() || student?.email || "SchülerIn",
        email: student?.email ?? null,
      };
    }),
  };
}

export async function GET() {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const admin = createAdminClient();
  try {
    const { data, error } = await admin
      .from("tutoring_groups")
      .select(GROUP_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ groups: (data ?? []).map((row) => mapGroup(row as Record<string, unknown>)) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load groups";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type CreateBody = {
  name?: string;
  teacherId?: string;
  subjectId?: string | null;
  classId?: string | null;
  scheduleNotes?: string | null;
  meetingUrl?: string | null;
  studentIds?: string[];
};

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const admin = createAdminClient();
  const body = (await request.json().catch(() => ({}))) as CreateBody;
  const name = body.name?.trim();
  const teacherId = body.teacherId?.trim();
  const studentIds = [...new Set((body.studentIds ?? []).map((id) => id.trim()).filter(Boolean))];

  if (!name || !teacherId) {
    return NextResponse.json({ error: "name and teacherId are required." }, { status: 400 });
  }

  try {
    const { data: teacher } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", teacherId)
      .maybeSingle();
    if (!teacher || teacher.role !== "teacher") {
      return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
    }

    const { data: created, error } = await admin
      .from("tutoring_groups")
      .insert({
        name,
        teacher_id: teacherId,
        subject_id: body.subjectId?.trim() || null,
        class_id: body.classId?.trim() || null,
        schedule_notes: body.scheduleNotes?.trim() || null,
        meeting_url: body.meetingUrl?.trim() || null,
        created_by: gate.auth!.user.id,
        is_active: true,
      })
      .select("id")
      .single();

    if (error || !created) throw new Error(error?.message || "Failed to create group");

    if (studentIds.length) {
      const { error: memberError } = await admin.from("tutoring_group_members").insert(
        studentIds.map((studentId) => ({
          group_id: created.id,
          student_id: studentId,
        }))
      );
      if (memberError) throw new Error(memberError.message);
    }

    const { data: full, error: loadError } = await admin
      .from("tutoring_groups")
      .select(GROUP_SELECT)
      .eq("id", created.id)
      .single();
    if (loadError || !full) throw new Error(loadError?.message || "Failed to load group");

    return NextResponse.json({ group: mapGroup(full as Record<string, unknown>) }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create group";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
