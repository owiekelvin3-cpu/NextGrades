import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { validateMeetingLink } from "@/lib/meetings/link";
import { wallTimeToUtc } from "@/lib/zoom/datetime";
import { deriveLessonDisplayStatus, meetingLinkFromLesson } from "@/lib/lessons/display-status";

function serviceUnavailable() {
  return NextResponse.json({ error: "Admin service is not configured." }, { status: 503 });
}

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

const LESSON_SELECT = `
  id, teacher_id, student_id, subject_id, group_id, start_time, duration, status, notes, attendance,
  meeting_url, zoom_link, meeting_title, timezone, meeting_type, created_at, updated_at,
  teacher:profiles!lessons_teacher_id_fkey(id, full_name, email),
  student:profiles!lessons_student_id_fkey(id, full_name, email),
  subject:subjects(id, name)
`;

type ProfileRef = { id: string; full_name: string | null; email: string | null };

function profileName(p: ProfileRef | null): string {
  return p?.full_name?.trim() || p?.email || "—";
}

function mapLesson(row: Record<string, unknown>, now: Date) {
  const teacher = normalizeRelation(row.teacher as ProfileRef | null);
  const student = normalizeRelation(row.student as ProfileRef | null);
  const subject = normalizeRelation(row.subject as { id: string; name: string } | null);
  const startTime = row.start_time as string;
  const statusRaw = row.status as string;

  return {
    id: row.id as string,
    teacherId: row.teacher_id as string,
    studentId: row.student_id as string,
    subjectId: (row.subject_id as string | null) ?? null,
    groupId: (row.group_id as string | null) ?? null,
    startTime,
    duration: row.duration as number,
    status: statusRaw,
    displayStatus: deriveLessonDisplayStatus({ status: statusRaw, start_time: startTime }, now),
    title: (row.meeting_title as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    attendance: (row.attendance as string | null) ?? null,
    timezone: (row.timezone as string | null) ?? null,
    meetingLink: meetingLinkFromLesson(row as { meeting_url?: string | null; zoom_link?: string | null }),
    teacherName: profileName(teacher),
    studentName: profileName(student),
    subjectName: subject?.name ?? null,
    teacher,
    student,
    subject,
  };
}

const ALLOWED_STATUSES = new Set(["scheduled", "completed", "cancelled", "no_show"]);

type PatchBody = {
  date?: string;
  startTime?: string;
  timezone?: string;
  duration?: number;
  meetingLink?: string;
  teacherId?: string;
  status?: string;
  notes?: string | null;
  cancel?: boolean;
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const { id } = await params;
  const admin = createAdminClient();

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const { data: lesson, error: fetchError } = await admin
      .from("lessons")
      .select("id, status, start_time, timezone, duration")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !lesson) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    }

    if (lesson.status === "cancelled" && !body.status && !body.cancel) {
      return NextResponse.json({ error: "This lesson was cancelled." }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.cancel === true) {
      updates.status = "cancelled";
    }

    if (typeof body.notes === "string" || body.notes === null) {
      updates.notes = body.notes?.trim() || null;
    }

    const nextStatus = body.status?.trim();
    if (nextStatus) {
      if (!ALLOWED_STATUSES.has(nextStatus)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      updates.status = nextStatus;
      if (nextStatus === "completed") {
        updates.completed_at = new Date().toISOString();
        if (!updates.attendance) updates.attendance = "attended";
      }
      if (nextStatus === "no_show") {
        updates.attendance = "no_show";
      }
    }

    const teacherId = body.teacherId?.trim();
    if (teacherId) {
      const { data: teacher } = await admin
        .from("profiles")
        .select("id, role")
        .eq("id", teacherId)
        .maybeSingle();
      if (!teacher || teacher.role !== "teacher") {
        return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
      }
      updates.teacher_id = teacherId;
    }

    const rawLink = body.meetingLink?.trim() || "";
    if (rawLink) {
      const linkCheck = validateMeetingLink(rawLink);
      if (!linkCheck.ok) {
        return NextResponse.json({ error: linkCheck.error }, { status: 400 });
      }
      updates.meeting_url = linkCheck.url;
      updates.meeting_provider = linkCheck.provider;
      updates.meeting_verified = true;
      updates.zoom_link = linkCheck.url;
    }

    if (body.date && body.startTime) {
      const timezone =
        body.timezone?.trim() || (lesson.timezone as string | null) || "Europe/Vienna";
      const startDateTime = wallTimeToUtc(body.date, body.startTime, timezone);
      if (Number.isNaN(startDateTime.getTime())) {
        return NextResponse.json({ error: "Invalid date or time." }, { status: 400 });
      }
      updates.start_time = startDateTime.toISOString();
      updates.timezone = timezone;
      if (typeof body.duration === "number" && body.duration > 0) {
        updates.duration = body.duration;
      } else if (typeof lesson.duration === "number" && lesson.duration > 0) {
        updates.duration = lesson.duration;
      }
      if (lesson.status === "completed" && !nextStatus) {
        updates.status = "scheduled";
      }
    } else if (typeof body.duration === "number" && body.duration > 0) {
      updates.duration = body.duration;
    }

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: "No changes provided." }, { status: 400 });
    }

    const { data: updated, error: updateError } = await admin
      .from("lessons")
      .update(updates)
      .eq("id", id)
      .select(LESSON_SELECT)
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: updateError?.message || "Update failed." }, { status: 500 });
    }

    return NextResponse.json({ lesson: mapLesson(updated as Record<string, unknown>, new Date()) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const { id } = await params;
  const admin = createAdminClient();

  try {
    const { data: updated, error } = await admin
      .from("lessons")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(LESSON_SELECT)
      .maybeSingle();

    if (error) throw error;
    if (!updated) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    }

    return NextResponse.json({ lesson: mapLesson(updated as Record<string, unknown>, new Date()) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Cancel failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
