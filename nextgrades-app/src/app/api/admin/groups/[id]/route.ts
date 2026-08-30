import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";

type RouteParams = { params: Promise<{ id: string }> };

function serviceUnavailable() {
  return NextResponse.json({ error: "Admin service is not configured." }, { status: 503 });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    teacherId?: string;
    subjectId?: string | null;
    classId?: string | null;
    scheduleNotes?: string | null;
    meetingUrl?: string | null;
    isActive?: boolean;
    studentIds?: string[];
  };

  const admin = createAdminClient();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.teacherId !== undefined) updates.teacher_id = body.teacherId;
  if (body.subjectId !== undefined) updates.subject_id = body.subjectId?.trim() || null;
  if (body.classId !== undefined) updates.class_id = body.classId?.trim() || null;
  if (body.scheduleNotes !== undefined) updates.schedule_notes = body.scheduleNotes?.trim() || null;
  if (body.meetingUrl !== undefined) updates.meeting_url = body.meetingUrl?.trim() || null;
  if (body.isActive !== undefined) updates.is_active = body.isActive;

  try {
    const { error } = await admin.from("tutoring_groups").update(updates).eq("id", id);
    if (error) throw error;

    if (body.studentIds) {
      const studentIds = [...new Set(body.studentIds.map((sid) => sid.trim()).filter(Boolean))];
      await admin.from("tutoring_group_members").delete().eq("group_id", id);
      if (studentIds.length) {
        const { error: memberError } = await admin.from("tutoring_group_members").insert(
          studentIds.map((studentId) => ({ group_id: id, student_id: studentId }))
        );
        if (memberError) throw new Error(memberError.message);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update group";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const admin = createAdminClient();
  try {
    const { error } = await admin
      .from("tutoring_groups")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to archive group";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
