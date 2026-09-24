import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/** Group detail: next lesson, schedule, zoom, materials, members, recent attendance. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const { id: groupId } = await params;
  const teacherId = gate.auth!.profile!.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;

  try {
    const { data: group, error } = await db
      .from("tutoring_groups")
      .select(
        `
        id, name, subject_id, class_id, teacher_id, schedule_notes, meeting_url, is_active,
        max_students, day_of_week, start_time, duration_minutes, start_date,
        subject:subjects(id, name),
        class:classes(id, name, level),
        members:tutoring_group_members(
          id, student_id, joined_at,
          student:profiles!tutoring_group_members_student_id_fkey(id, full_name, email)
        )
      `
      )
      .eq("id", groupId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
    if (group.teacher_id !== teacherId && gate.auth!.profile!.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const memberIds = ((group.members as { student_id: string }[]) ?? []).map((m) => m.student_id);
    const now = new Date().toISOString();

    const [lessonsRes, materialsRes] = await Promise.all([
      memberIds.length
        ? db
            .from("lessons")
            .select(
              "id, student_id, start_time, duration, status, meeting_title, zoom_link, meeting_url, attendance, group_id"
            )
            .eq("teacher_id", group.teacher_id as string)
            .in("student_id", memberIds)
            .gte("start_time", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
            .order("start_time", { ascending: true })
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      db
        .from("group_material_assignments")
        .select(
          `id, assigned_at,
           material:materials(id, title, content_type, file_name, status)`
        )
        .eq("group_id", groupId)
        .order("assigned_at", { ascending: false }),
    ]);

    const lessons = lessonsRes.data ?? [];
    const upcoming = lessons.filter(
      (l) => l.status === "scheduled" && (l.start_time as string) >= now
    );
    const nextLesson = upcoming[0] ?? null;

    const schedule = lessons
      .filter((l) => l.status === "scheduled")
      .slice(0, 20)
      .map((l) => ({
        id: l.id as string,
        studentId: l.student_id as string,
        startTime: l.start_time as string,
        duration: Number(l.duration ?? 60),
        title: (l.meeting_title as string | null) ?? group.name,
        zoomLink: (l.zoom_link as string | null) ?? (l.meeting_url as string | null) ?? group.meeting_url,
        status: l.status as string,
      }));

    const sessionMap = new Map<
      string,
      {
        startTime: string;
        duration: number;
        title: string;
        zoomLink: string | null;
        lessons: Array<{ lessonId: string; studentId: string; attendance: string | null; status: string }>;
      }
    >();

    for (const l of lessons) {
      const key = l.start_time as string;
      const existing = sessionMap.get(key);
      const entry = {
        lessonId: l.id as string,
        studentId: l.student_id as string,
        attendance: (l.attendance as string | null) ?? null,
        status: l.status as string,
      };
      if (existing) {
        existing.lessons.push(entry);
      } else {
        sessionMap.set(key, {
          startTime: key,
          duration: Number(l.duration ?? 60),
          title: (l.meeting_title as string | null) ?? (group.name as string),
          zoomLink:
            (l.zoom_link as string | null) ??
            (l.meeting_url as string | null) ??
            (group.meeting_url as string | null),
          lessons: [entry],
        });
      }
    }

    const sessions = [...sessionMap.values()].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const recentAttendance = lessons
      .filter((l) => ["completed", "no_show"].includes(l.status as string))
      .slice(-30)
      .map((l) => ({
        lessonId: l.id as string,
        studentId: l.student_id as string,
        startTime: l.start_time as string,
        attendance: (l.attendance as string | null) ?? "attended",
        status: l.status as string,
      }));

    const membersRaw = (group.members as Record<string, unknown>[] | null) ?? [];
    const members = membersRaw.map((m) => {
      const student = normalizeRelation(
        m.student as { id: string; full_name: string | null; email: string | null } | null
      );
      return {
        id: m.id as string,
        studentId: m.student_id as string,
        name: student?.full_name?.trim() || "Student",
        email: student?.email ?? null,
        joinedAt: m.joined_at as string,
      };
    });

    const materials = (materialsRes.data ?? []).map((row) => {
      const mat = normalizeRelation(
        row.material as
          | { id: string; title: string; content_type?: string; file_name?: string; status?: string }
          | { id: string; title: string; content_type?: string; file_name?: string; status?: string }[]
          | null
      );
      return {
        id: row.id as string,
        assignedAt: row.assigned_at as string,
        materialId: mat?.id ?? "",
        title: mat?.title ?? "Material",
        contentType: mat?.content_type ?? null,
        fileName: mat?.file_name ?? null,
        status: mat?.status ?? null,
      };
    });

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        scheduleNotes: group.schedule_notes,
        meetingUrl: group.meeting_url,
        maxStudents: (group.max_students as number | null) ?? null,
        dayOfWeek: (group.day_of_week as number | null) ?? null,
        startTime: (group.start_time as string | null) ?? null,
        durationMinutes: (group.duration_minutes as number | null) ?? null,
        startDate: (group.start_date as string | null) ?? null,
        subject: normalizeRelation(
          group.subject as { id: string; name: string } | { id: string; name: string }[] | null
        ),
        class: normalizeRelation(
          group.class as
            | { id: string; name: string; level: number | null }
            | { id: string; name: string; level: number | null }[]
            | null
        ),
        members,
      },
      nextLesson: nextLesson
        ? {
            id: nextLesson.id,
            startTime: nextLesson.start_time,
            duration: Number(nextLesson.duration ?? 60),
            title: (nextLesson.meeting_title as string | null) ?? group.name,
            zoomLink:
              (nextLesson.zoom_link as string | null) ??
              (nextLesson.meeting_url as string | null) ??
              group.meeting_url,
          }
        : null,
      schedule,
      sessions,
      materials,
      recentAttendance,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load group";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
