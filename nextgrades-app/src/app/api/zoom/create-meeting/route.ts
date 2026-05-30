import { NextResponse } from "next/server";
import { createZoomMeeting } from "@/lib/zoom/client";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";

export async function POST(request: Request) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  try {
    const { topic, startTime, duration, studentId, subjectId } = await request.json();

    if (!topic || !startTime || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const teacherId = gate.auth!.profile!.id;

    const meeting = await createZoomMeeting(topic, new Date(startTime), duration ?? 60);

    const { data: lesson, error } = await gate.auth!.supabase
      .from("lessons")
      .insert({
        teacher_id: teacherId,
        student_id: studentId,
        subject_id: subjectId || null,
        start_time: startTime,
        duration: duration ?? 60,
        zoom_link: meeting.join_url,
        zoom_meeting_id: meeting.id,
        status: "scheduled",
      })
      .select()
      .single();

    if (error) throw error;

    const { notifyLiveClassScheduled } = await import("@/lib/notifications/triggers");
    void notifyLiveClassScheduled({
      lessonId: lesson.id,
      studentId,
      teacherId,
      startTime,
    });

    return NextResponse.json(lesson);
  } catch (error: unknown) {
    console.error("Zoom meeting creation error:", error);
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
