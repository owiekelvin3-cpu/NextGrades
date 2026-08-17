import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import type { ZoomMeetingType } from "@/lib/zoom/config";
import { ZOOM_MEETING_TYPES } from "@/lib/zoom/config";
import { createZoomMeetingOAuth } from "@/lib/zoom/meetings";
import { getZoomConnection, getZoomAccessToken } from "@/lib/zoom/tokens";
import { resolveTargetStudentIds } from "@/lib/zoom/scheduling";
import { formatZoomLocalStartTime, wallTimeToUtc } from "@/lib/zoom/datetime";
import { notifyLiveClassScheduled } from "@/lib/notifications/triggers";

export async function GET() {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
  const { data, error } = await db
    .from("lessons")
    .select("*")
    .eq("teacher_id", teacherId)
    .neq("status", "cancelled")
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const studentIds = [...new Set(rows.map((r) => r.student_id as string).filter(Boolean))];
  let nameById = new Map<string, string>();
  if (studentIds.length) {
    const { data: profiles } = await db.from("profiles").select("id, full_name").in("id", studentIds);
    nameById = new Map(
      (profiles ?? []).map((p) => [p.id as string, ((p.full_name as string | null)?.trim() || "Student")])
    );
  }

  return NextResponse.json({
    meetings: rows.map((row) => ({
      ...row,
      student_name: nameById.get(row.student_id as string) ?? null,
    })),
  });
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
      { error: "Connect your Zoom account before creating live classes." },
      { status: 400 }
    );
  }

  const token = await getZoomAccessToken(teacherId);
  if (!token) {
    return NextResponse.json(
      { error: "Zoom session expired. Reconnect your Zoom account in Settings." },
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

    const startDateTime = wallTimeToUtc(date, startTime, timezone);
    if (Number.isNaN(startDateTime.getTime())) {
      return NextResponse.json({ error: "Invalid date or time" }, { status: 400 });
    }

    const admin = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;

    let targetStudentIds: string[];
    try {
      targetStudentIds = await resolveTargetStudentIds(admin, teacherId, {
        meetingType,
        studentId,
        studentIds,
        subjectId,
      });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid student selection" },
        { status: 400 }
      );
    }

    if (targetStudentIds.length === 0) {
      return NextResponse.json(
        {
          error:
            "Select an enrolled student, or a subject with enrolled students. Students must be enrolled before receiving meeting links.",
        },
        { status: 400 }
      );
    }

    const zoomMeeting = await createZoomMeetingOAuth({
      teacherId,
      topic: title.trim(),
      description,
      startTimeLocal: formatZoomLocalStartTime(date, startTime),
      duration,
      timezone,
      meetingType,
    });

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
          zoom_start_url: zoomMeeting.start_url ?? null,
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
