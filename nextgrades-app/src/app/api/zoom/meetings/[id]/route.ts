import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { deleteZoomMeetingOAuth } from "@/lib/zoom/meetings";
import { restoreLessonUnitOnCancel } from "@/lib/lessons/consume-units";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const { id: lessonId } = await params;
  const teacherId = gate.auth!.profile!.id;

  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;

  const { data: lesson, error: fetchError } = await db
    .from("lessons")
    .select("id, zoom_meeting_id, status, student_id, units_consumed")
    .eq("id", lessonId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (fetchError || !lesson) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  if (lesson.status === "cancelled") {
    return NextResponse.json({ success: true });
  }

  const meetingId = lesson.zoom_meeting_id as string | null;

  if (meetingId) {
    const { count } = await db
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("zoom_meeting_id", meetingId)
      .eq("teacher_id", teacherId)
      .neq("status", "cancelled");

    if (count === 1) {
      try {
        await deleteZoomMeetingOAuth(teacherId, meetingId);
      } catch (e) {
        console.warn("[zoom delete]", e);
      }
    }
  }

  await restoreLessonUnitOnCancel(db, {
    id: lesson.id as string,
    student_id: lesson.student_id as string,
    units_consumed: Boolean(lesson.units_consumed),
  });

  await db
    .from("lessons")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", lessonId);

  return NextResponse.json({ success: true });
}
