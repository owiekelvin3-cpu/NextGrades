import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import {
  completeLessonByTeacher,
  type LessonAttendanceStatus,
} from "@/lib/lessons/complete-lesson";

type RouteParams = { params: Promise<{ id: string }> };

type Body = {
  attendance?: LessonAttendanceStatus;
};

export async function POST(request: Request, { params }: RouteParams) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const { id: lessonId } = await params;
  if (!lessonId) {
    return NextResponse.json({ error: "Lesson id is required." }, { status: 400 });
  }

  const teacherId = gate.auth!.profile!.id;
  const body = (await request.json().catch(() => ({}))) as Body;
  const attendance = body.attendance;

  if (attendance && !["attended", "excused", "no_show"].includes(attendance)) {
    return NextResponse.json({ error: "Invalid attendance value." }, { status: 400 });
  }

  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;

  try {
    const result = await completeLessonByTeacher(db, {
      lessonId,
      teacherId,
      attendance,
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to complete lesson";
    const lower = message.toLowerCase();
    const status =
      lower.includes("not found") || lower.includes("does not belong")
        ? 404
        : lower.includes("cancelled") || lower.includes("invalid")
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
