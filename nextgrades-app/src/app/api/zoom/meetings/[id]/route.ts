import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { deleteZoomMeetingOAuth } from "@/lib/zoom/meetings";

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
    .select("*")
    .eq("id", lessonId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (fetchError || !lesson) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const meetingId = lesson.zoom_meeting_id as string | null;
  if (meetingId) {
    try {
      await deleteZoomMeetingOAuth(teacherId, meetingId);
    } catch (e) {
      console.warn("[zoom delete]", e);
    }

    await db
      .from("lessons")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("zoom_meeting_id", meetingId)
      .eq("teacher_id", teacherId);
  } else {
    await db
      .from("lessons")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", lessonId);
  }

  return NextResponse.json({ success: true });
}
