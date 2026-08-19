import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { validateMeetingLink } from "@/lib/meetings/link";
import { wallTimeToUtc } from "@/lib/zoom/datetime";
import { notifyLiveClassScheduled } from "@/lib/notifications/triggers";

type PatchBody = {
  meetingLink?: string;
  passcode?: string;
  date?: string;
  startTime?: string;
  timezone?: string;
  duration?: number;
};

/** Add or update the video link (and optionally the time) on an existing lesson. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const { id: lessonId } = await params;
  const teacherId = gate.auth!.profile!.id;

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;

  const { data: lesson, error: fetchError } = await db
    .from("lessons")
    .select("id, student_id, subject_id, start_time, duration, timezone, status, meeting_title")
    .eq("id", lessonId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (fetchError || !lesson) {
    return NextResponse.json({ error: "Stunde nicht gefunden." }, { status: 404 });
  }

  if (lesson.status === "cancelled") {
    return NextResponse.json({ error: "Diese Stunde wurde abgesagt." }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

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

  if (typeof body.passcode === "string") {
    updates.zoom_passcode = body.passcode.trim() || null;
  }

  if (body.date && body.startTime) {
    const timezone = body.timezone || (lesson.timezone as string | null) || "Europe/Vienna";
    const startDateTime = wallTimeToUtc(body.date, body.startTime, timezone);
    if (Number.isNaN(startDateTime.getTime())) {
      return NextResponse.json({ error: "Ungültiges Datum oder Uhrzeit." }, { status: 400 });
    }
    updates.start_time = startDateTime.toISOString();
    updates.timezone = timezone;
    if (typeof body.duration === "number" && body.duration > 0) {
      updates.duration = body.duration;
    }
    if (lesson.status === "completed") {
      updates.status = "scheduled";
    }
  }

  if (Object.keys(updates).length <= 1) {
    return NextResponse.json(
      { error: "Füge vor der Stunde einen Video-Link ein (Zoom, Meet oder Teams)." },
      { status: 400 }
    );
  }

  const { data: updated, error: updateError } = await db
    .from("lessons")
    .update(updates)
    .eq("id", lessonId)
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message || "Speichern fehlgeschlagen." }, { status: 500 });
  }

  if (rawLink) {
    const teacherName = gate.auth!.profile!.full_name ?? "deine Lehrkraft";
    void notifyLiveClassScheduled({
      lessonId,
      studentId: lesson.student_id as string,
      teacherId,
      teacherName,
      title: (lesson.meeting_title as string | null) || undefined,
      startTime: (updated.start_time as string) || (lesson.start_time as string),
      joinUrl: rawLink,
    });
  }

  return NextResponse.json({ lesson: updated });
}
