import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { createZoomMeetingOAuth } from "@/lib/zoom/meetings";
import { getZoomConnection } from "@/lib/zoom/tokens";
import { notifyLiveClassScheduled } from "@/lib/notifications/triggers";

/** @deprecated Prefer POST /api/zoom/meetings - kept for backward compatibility */
export async function POST(request: Request) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;
  if (!(await getZoomConnection(teacherId))) {
    return NextResponse.json(
      { error: "Connect Zoom in Settings before creating meetings." },
      { status: 400 }
    );
  }

  try {
    const { topic, startTime, duration, studentId, subjectId } = await request.json();

    if (!topic || !startTime || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const startDateTime = new Date(startTime);
    const isoDate = startDateTime.toISOString().slice(0, 10);
    const isoTime = startDateTime.toISOString().slice(11, 16);
    const meeting = await createZoomMeetingOAuth({
      teacherId,
      topic,
      startTimeLocal: `${isoDate}T${isoTime}:00`,
      duration: duration ?? 60,
      timezone: "Europe/Berlin",
      meetingType: "private_session",
    });

    const admin = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;

    const { data: lesson, error } = await admin
      .from("lessons")
      .insert({
        teacher_id: teacherId,
        student_id: studentId,
        subject_id: subjectId || null,
        start_time: startDateTime.toISOString(),
        duration: duration ?? 60,
        zoom_link: meeting.join_url,
        zoom_start_url: meeting.start_url ?? null,
        zoom_meeting_id: meeting.id,
        zoom_passcode: meeting.password ?? null,
        meeting_title: topic,
        meeting_type: "private_session",
        timezone: "Europe/Berlin",
        status: "scheduled",
      })
      .select()
      .single();

    if (error) throw error;

    void notifyLiveClassScheduled({
      lessonId: lesson.id,
      studentId,
      teacherId,
      teacherName: gate.auth!.profile!.full_name ?? undefined,
      title: topic,
      startTime,
      joinUrl: meeting.join_url,
    });

    return NextResponse.json(lesson);
  } catch (error: unknown) {
    console.error("Zoom meeting creation error:", error);
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
