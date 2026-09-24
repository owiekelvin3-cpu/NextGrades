import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import {
  completeLessonByTeacher,
  type LessonAttendanceStatus,
} from "@/lib/lessons/complete-lesson";

type AttendanceEntry = {
  lessonId: string;
  attendance: LessonAttendanceStatus;
};

/** Mark attendance for multiple students in a group lesson session. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Service not configured." }, { status: 503 });
  }

  const { id: groupId } = await params;
  const teacherId = gate.auth!.profile!.id;
  const admin = createAdminClient();

  const body = (await request.json()) as { entries?: AttendanceEntry[] };
  const entries = body.entries ?? [];
  if (!entries.length) {
    return NextResponse.json({ error: "No attendance entries provided." }, { status: 400 });
  }

  try {
    const { data: group } = await admin
      .from("tutoring_groups")
      .select("id, teacher_id")
      .eq("id", groupId)
      .maybeSingle();

    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
    if (group.teacher_id !== teacherId && gate.auth!.profile!.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const results = [];
    for (const entry of entries) {
      const { data: lesson } = await admin
        .from("lessons")
        .select("id, teacher_id, group_id, status")
        .eq("id", entry.lessonId)
        .maybeSingle();

      if (!lesson || lesson.teacher_id !== teacherId) {
        results.push({ lessonId: entry.lessonId, ok: false, error: "Lesson not found" });
        continue;
      }

      try {
        const result = await completeLessonByTeacher(admin, {
          lessonId: entry.lessonId,
          teacherId,
          attendance: entry.attendance,
        });
        results.push({ lessonId: entry.lessonId, ok: true, ...result });
      } catch (err) {
        results.push({
          lessonId: entry.lessonId,
          ok: false,
          error: err instanceof Error ? err.message : "Failed",
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to mark attendance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
