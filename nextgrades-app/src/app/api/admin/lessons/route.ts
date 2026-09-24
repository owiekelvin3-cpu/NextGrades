import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { validateMeetingLink } from "@/lib/meetings/link";
import { wallTimeToUtc } from "@/lib/zoom/datetime";
import { deriveLessonDisplayStatus, meetingLinkFromLesson } from "@/lib/lessons/display-status";
import { notifyLiveClassScheduled } from "@/lib/notifications/triggers";
import { settleHeldLessonUnits } from "@/lib/lessons/consume-units";

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
  const displayStatus = deriveLessonDisplayStatus({ status: statusRaw, start_time: startTime }, now);

  return {
    id: row.id as string,
    teacherId: row.teacher_id as string,
    studentId: row.student_id as string,
    subjectId: (row.subject_id as string | null) ?? null,
    groupId: (row.group_id as string | null) ?? null,
    startTime,
    duration: row.duration as number,
    status: statusRaw,
    displayStatus,
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

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId")?.trim();
  const teacherId = searchParams.get("teacherId")?.trim();
  const subjectId = searchParams.get("subjectId")?.trim();
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();
  const statusFilter = searchParams.get("status")?.trim().toLowerCase();
  const q = searchParams.get("q")?.trim();

  const admin = createAdminClient();
  const now = new Date();
  const nowIso = now.toISOString();

  try {
    let query = admin.from("lessons").select(LESSON_SELECT).order("start_time", { ascending: false }).limit(400);

    if (studentId) query = query.eq("student_id", studentId);
    if (teacherId) query = query.eq("teacher_id", teacherId);
    if (subjectId) query = query.eq("subject_id", subjectId);
    if (from) query = query.gte("start_time", `${from}T00:00:00.000Z`);
    if (to) query = query.lte("start_time", `${to}T23:59:59.999Z`);
    if (q) query = query.ilike("meeting_title", `%${q}%`);

    if (statusFilter === "upcoming") {
      query = query.eq("status", "scheduled").gte("start_time", nowIso);
    } else if (statusFilter === "completed") {
      query = query.in("status", ["completed", "no_show"]);
    } else if (statusFilter === "cancelled") {
      query = query.eq("status", "cancelled");
    } else if (statusFilter === "missed") {
      query = query.eq("status", "scheduled").lt("start_time", nowIso);
    } else if (statusFilter === "past") {
      query = query.lt("start_time", nowIso);
    }

    const { data, error } = await query;
    if (error) throw error;

    let lessons = (data ?? []).map((row) => mapLesson(row as Record<string, unknown>, now));

    if (statusFilter === "missed") {
      lessons = lessons.filter((l) => l.displayStatus === "missed");
    }

    return NextResponse.json({ lessons });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load lessons";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type CreateBody = {
  teacherId?: string;
  studentId?: string;
  groupId?: string;
  subjectId?: string | null;
  date?: string;
  startTime?: string;
  duration?: number;
  timezone?: string;
  meetingLink?: string;
  title?: string;
  notes?: string | null;
};

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const admin = createAdminClient();
  const body = (await request.json().catch(() => ({}))) as CreateBody;

  const teacherId = body.teacherId?.trim();
  const studentId = body.studentId?.trim();
  const groupId = body.groupId?.trim();
  const date = body.date?.trim();
  const startTime = body.startTime?.trim();
  const duration = typeof body.duration === "number" && body.duration > 0 ? body.duration : 60;
  const timezone = body.timezone?.trim() || "Europe/Vienna";
  const title = body.title?.trim() || "Unterrichtsstunde";
  const notes = body.notes?.trim() || null;
  const subjectId = body.subjectId?.trim() || null;

  if (!teacherId || !date || !startTime) {
    return NextResponse.json({ error: "teacherId, date, and startTime are required." }, { status: 400 });
  }

  if (!studentId && !groupId) {
    return NextResponse.json({ error: "studentId or groupId is required." }, { status: 400 });
  }

  const rawLink = body.meetingLink?.trim() || "";
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

  const startDateTime = wallTimeToUtc(date, startTime, timezone);
  if (Number.isNaN(startDateTime.getTime())) {
    return NextResponse.json({ error: "Invalid date or time." }, { status: 400 });
  }

  try {
    const { data: teacher } = await admin
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", teacherId)
      .maybeSingle();
    if (!teacher || teacher.role !== "teacher") {
      return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
    }

    let targetStudentIds: string[] = [];
    let resolvedGroupId: string | null = null;

    if (groupId) {
      const { data: group } = await admin
        .from("tutoring_groups")
        .select("id, teacher_id")
        .eq("id", groupId)
        .maybeSingle();
      if (!group) {
        return NextResponse.json({ error: "Group not found." }, { status: 404 });
      }
      resolvedGroupId = group.id as string;
      const { data: members } = await admin
        .from("tutoring_group_members")
        .select("student_id")
        .eq("group_id", groupId);
      targetStudentIds = [...new Set((members ?? []).map((m) => m.student_id as string))];
      if (targetStudentIds.length === 0) {
        return NextResponse.json({ error: "Group has no students." }, { status: 400 });
      }
    } else if (studentId) {
      targetStudentIds = [studentId];
    }

    let subjectName: string | undefined;
    if (subjectId) {
      const { data: sub } = await admin.from("subjects").select("name").eq("id", subjectId).maybeSingle();
      subjectName = sub?.name as string | undefined;
    }

    const teacherName = (teacher.full_name as string | null) ?? "Lehrkraft";
    const createdIds: string[] = [];

    for (const sid of targetStudentIds) {
      const { data: lesson, error: insertError } = await admin
        .from("lessons")
        .insert({
          teacher_id: teacherId,
          student_id: sid,
          subject_id: subjectId,
          group_id: resolvedGroupId,
          start_time: startDateTime.toISOString(),
          duration,
          meeting_url: linkCheck.url,
          meeting_provider: linkCheck.provider,
          meeting_verified: true,
          zoom_link: linkCheck.url,
          meeting_title: title,
          notes,
          meeting_type: "live_class",
          timezone,
          status: "scheduled",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      createdIds.push(lesson.id as string);

      void notifyLiveClassScheduled({
        lessonId: lesson.id as string,
        studentId: sid,
        teacherId,
        teacherName,
        subjectName,
        title,
        startTime: startDateTime.toISOString(),
        joinUrl: linkCheck.url,
      });
    }

    await settleHeldLessonUnits(admin);

    const { data: rows, error: loadError } = await admin
      .from("lessons")
      .select(LESSON_SELECT)
      .in("id", createdIds);
    if (loadError) throw loadError;

    const now = new Date();
    return NextResponse.json(
      {
        lessons: (rows ?? []).map((row) => mapLesson(row as Record<string, unknown>, now)),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create lesson";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
