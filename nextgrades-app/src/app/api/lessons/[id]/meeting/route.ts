import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuthenticatedApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import {
  canStudentAccessLessonMeeting,
  fetchLessonForMeetingAccess,
  resolveMeetingUrl,
} from "@/lib/zoom/lesson-access";

/** Authenticated access to Zoom join (student) or start (teacher) URLs. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: lessonId } = await params;
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;
  const auth = gate.auth!;

  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : auth.supabase;
  const lesson = await fetchLessonForMeetingAccess(db, lessonId);

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const role = auth.profile.role;
  const userId = auth.user.id;

  if (role === "student") {
    const allowed = await canStudentAccessLessonMeeting(db, lesson, userId);
    if (!allowed) {
      return NextResponse.json({ error: "You are not enrolled in this class" }, { status: 403 });
    }
  } else if (role === "teacher" && lesson.teacher_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (role !== "admin" && role !== "teacher" && role !== "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { url, passcode, provider } = resolveMeetingUrl(lesson, role, userId);
  if (!url) {
    return NextResponse.json({ error: "Meeting link not available" }, { status: 404 });
  }

  return NextResponse.json({
    url,
    passcode,
    provider,
    role: role === "teacher" ? "host" : "participant",
    meetingId: lesson.zoom_meeting_id,
    startTime: lesson.start_time,
    duration: lesson.duration,
  });
}
