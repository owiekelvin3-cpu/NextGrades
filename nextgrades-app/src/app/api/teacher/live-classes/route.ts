import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import type { ZoomMeetingType } from "@/lib/zoom/config";
import { ZOOM_MEETING_TYPES } from "@/lib/zoom/config";
import { resolveTargetStudentIds } from "@/lib/zoom/scheduling";
import { wallTimeToUtc } from "@/lib/zoom/datetime";
import { notifyLiveClassScheduled } from "@/lib/notifications/triggers";
import { validateMeetingLink } from "@/lib/meetings/link";

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
  meetingLink: string;
  passcode?: string;
};

/** Schedule a live class with a teacher-pasted meeting link (no Zoom OAuth required). */
export async function POST(request: Request) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;

  try {
    const body = (await request.json()) as CreateBody;
    const {
      title,
      description,
      date,
      startTime,
      duration = 60,
      timezone = "Europe/Berlin",
      meetingType = "live_class",
      studentId,
      studentIds,
      subjectId,
      meetingLink,
      passcode,
    } = body;

    if (!title?.trim() || !date || !startTime) {
      return NextResponse.json({ error: "Title, date, and start time are required" }, { status: 400 });
    }

    const linkCheck = validateMeetingLink(meetingLink);
    if (!linkCheck.ok) {
      return NextResponse.json({ error: linkCheck.error }, { status: 400 });
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
            "Select a student or a subject with enrolled students so they receive the meeting link.",
        },
        { status: 400 }
      );
    }

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
          meeting_url: linkCheck.url,
          meeting_provider: linkCheck.provider,
          meeting_verified: true,
          zoom_link: linkCheck.url,
          zoom_passcode: passcode?.trim() || null,
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
        joinUrl: linkCheck.url,
      });
    }

    return NextResponse.json({
      lessons,
      provider: linkCheck.provider,
      meetingUrl: linkCheck.url,
    });
  } catch (e) {
    console.error("[teacher/live-classes POST]", e);
    const message = e instanceof Error ? e.message : "Failed to schedule live class";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
