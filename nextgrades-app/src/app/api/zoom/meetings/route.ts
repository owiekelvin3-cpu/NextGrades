import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import type { ZoomMeetingType } from "@/lib/zoom/config";
import { ZOOM_MEETING_TYPES } from "@/lib/zoom/config";
import { createZoomMeetingOAuth, deleteZoomMeetingOAuth } from "@/lib/zoom/meetings";
import { getZoomConnection } from "@/lib/zoom/tokens";
import { notifyLiveClassScheduled } from "@/lib/notifications/triggers";

export async function GET() {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;
  const { data, error } = await gate.auth!.supabase
    .from("lessons")
    .select("*")
    .eq("teacher_id", teacherId)
    .not("zoom_meeting_id", "is", null)
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ meetings: data ?? [] });
}

type CreateBody = {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  duration?: number;
  timezone?: string;
  meetingType?: ZoomMeetingType;
  studentId?: string;
  studentIds?: string[];
  subjectId?: string;
};

export async function POST(request: Request) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;
  const connection = await getZoomConnection(teacherId);
  if (!connection) {
    return NextResponse.json(
      { error: "Connect your Zoom account in Settings before creating live classes." },
      { status: 400 }
    );
  }

  try {
    const body = (await request.json()) as CreateBody;
    const {
      title,
      description,
      date,
      startTime,
      duration = 60,
      timezone = "Europe/Berlin",
      meetingType = "private_session",
      studentId,
      studentIds,
      subjectId,
    } = body;

    if (!title?.trim() || !date || !startTime) {
      return NextResponse.json({ error: "Title, date, and start time are required" }, { status: 400 });
    }

    if (!ZOOM_MEETING_TYPES.includes(meetingType)) {
      return NextResponse.json({ error: "Invalid meeting type" }, { status: 400 });
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    if (Number.isNaN(startDateTime.getTime())) {
      return NextResponse.json({ error: "Invalid date or time" }, { status: 400 });
    }

    let targetStudentIds: string[] = [];
    if (meetingType === "private_session") {
      if (!studentId) {
        return NextResponse.json({ error: "Select a student for private sessions" }, { status: 400 });
      }
      targetStudentIds = [studentId];
    } else if (studentIds?.length) {
      targetStudentIds = studentIds;
    } else if (subjectId && isSupabaseServiceRoleConfigured()) {
      const admin = createAdminClient();
      const { data: enrollments } = await admin
        .from("enrollments")
        .select("student_id")
        .eq("subject_id", subjectId)
        .eq("status", "active");
      targetStudentIds = (enrollments ?? []).map((e: { student_id: string }) => e.student_id);
    }

    if (targetStudentIds.length === 0) {
      return NextResponse.json(
        { error: "Select at least one student or a subject with enrolled students" },
        { status: 400 }
      );
    }

    const zoomMeeting = await createZoomMeetingOAuth({
      teacherId,
      topic: title.trim(),
      description,
      startTime: startDateTime,
      duration,
      timezone,
      meetingType,
    });

    const admin = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
    const teacherName = gate.auth!.profile!.full_name ?? "Your teacher";

    let subjectName: string | undefined;
    if (subjectId) {
      const { data: sub } = await admin.from("subjects").select("name").eq("id", subjectId).maybeSingle();
      subjectName = sub?.name as string | undefined;
    }

    const lessons = [];
    for (const sid of targetStudentIds) {
      const { data: lesson, error: insertError } = await admin
        .from("lessons")
        .insert({
          teacher_id: teacherId,
          student_id: sid,
          subject_id: subjectId || null,
          start_time: startDateTime.toISOString(),
          duration,
          zoom_link: zoomMeeting.join_url,
          zoom_meeting_id: zoomMeeting.id,
          zoom_passcode: zoomMeeting.password ?? null,
          meeting_title: title.trim(),
          meeting_description: description ?? null,
          meeting_type: meetingType,
          timezone,
          status: "scheduled",
        })
        .select()
        .single();

      if (insertError) throw insertError;
      lessons.push(lesson);

      void notifyLiveClassScheduled({
        lessonId: lesson.id as string,
        studentId: sid,
        teacherId,
        teacherName,
        subjectName,
        title: title.trim(),
        startTime: startDateTime.toISOString(),
        joinUrl: zoomMeeting.join_url,
      });
    }

    return NextResponse.json({
      meeting: zoomMeeting,
      lessons,
    });
  } catch (e) {
    console.error("[zoom/meetings POST]", e);
    const message = e instanceof Error ? e.message : "Failed to create meeting";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
