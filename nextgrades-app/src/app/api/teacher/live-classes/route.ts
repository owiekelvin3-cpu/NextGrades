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
import { settleHeldLessonUnits } from "@/lib/lessons/consume-units";

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
  groupId?: string;
  subjectId?: string;
  meetingLink?: string;
  passcode?: string;
  isRecurring?: boolean;
  recurrenceWeeks?: number;
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
      timezone = "Europe/Vienna",
      meetingType = "live_class",
      studentId,
      studentIds,
      groupId,
      subjectId,
      meetingLink,
      passcode,
      isRecurring = false,
      recurrenceWeeks = 1,
    } = body;

    if (!title?.trim() || !date || !startTime) {
      return NextResponse.json({ error: "Title, date, and start time are required" }, { status: 400 });
    }

    const rawLink = meetingLink?.trim() || "";
    if (!rawLink) {
      return NextResponse.json(
        {
          error:
            "Füge vor der Stunde einen Video-Link ein (Zoom, Google Meet oder Teams), sonst können SchülerInnen nicht beitreten.",
        },
        { status: 400 }
      );
    }
    const linkCheck = validateMeetingLink(rawLink);
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
        groupId,
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
            "Select a student so the lesson appears in their appointments.",
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

    const weekCount = isRecurring
      ? Math.min(12, Math.max(1, Math.trunc(Number(recurrenceWeeks) || 1)))
      : 1;
    const occurrenceStarts: Date[] = [];
    for (let w = 0; w < weekCount; w++) {
      const occ = new Date(startDateTime.getTime());
      occ.setUTCDate(occ.getUTCDate() + w * 7);
      occurrenceStarts.push(occ);
    }
    const recurrenceRule =
      isRecurring && weekCount > 1 ? `FREQ=WEEKLY;COUNT=${weekCount}` : isRecurring ? "FREQ=WEEKLY;COUNT=1" : null;
    const resolvedGroupId = groupId?.trim() || null;

    const lessons = [];
    for (const occurrenceStart of occurrenceStarts) {
      for (const sid of targetStudentIds) {
        const { data: lesson, error: insertError } = await admin
          .from("lessons")
          .insert({
            teacher_id: teacherId,
            student_id: sid,
            subject_id: subjectId || null,
            group_id: resolvedGroupId,
            start_time: occurrenceStart.toISOString(),
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
            is_recurring: Boolean(isRecurring),
            recurrence_rule: recurrenceRule,
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
          startTime: occurrenceStart.toISOString(),
          joinUrl: linkCheck.url,
        });
      }
    }

    await settleHeldLessonUnits(admin);

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
