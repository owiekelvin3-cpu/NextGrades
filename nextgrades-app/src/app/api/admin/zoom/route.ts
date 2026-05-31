import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

export async function GET() {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const nowIso = now.toISOString();

  const [connectionsRes, lessonsRes, upcomingRes, activeRes, upcomingListRes] = await Promise.all([
    admin.from("teacher_zoom_connections").select("teacher_id, zoom_email, connected_at", { count: "exact" }),
    admin.from("lessons").select("id", { count: "exact", head: true }).not("zoom_meeting_id", "is", null),
    admin
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .not("zoom_meeting_id", "is", null)
      .eq("status", "scheduled")
      .gte("start_time", nowIso),
    admin
      .from("lessons")
      .select("id, start_time, duration")
      .not("zoom_meeting_id", "is", null)
      .eq("status", "scheduled")
      .lte("start_time", nowIso),
    admin
      .from("lessons")
      .select("id, meeting_title, start_time, duration, meeting_type, zoom_link, teacher_id, student_id")
      .not("zoom_meeting_id", "is", null)
      .eq("status", "scheduled")
      .gte("start_time", nowIso)
      .order("start_time", { ascending: true })
      .limit(20),
  ]);

  const activeMeetings = (activeRes.data ?? []).filter((l: { start_time: string; duration: number | null }) => {
    const start = new Date(l.start_time).getTime();
    const end = start + (l.duration ?? 60) * 60_000;
    return end > now.getTime();
  }).length;

  const teacherIds = [...new Set((upcomingListRes.data ?? []).map((l: { teacher_id: string }) => l.teacher_id))];
  const { data: teachers } = teacherIds.length
    ? await admin.from("profiles").select("id, full_name").in("id", teacherIds)
    : { data: [] };

  const teacherMap = new Map((teachers ?? []).map((t: { id: string; full_name: string | null }) => [t.id, t.full_name]));

  return NextResponse.json({
    connectedTeachers: connectionsRes.count ?? 0,
    connections: connectionsRes.data ?? [],
    totalMeetings: lessonsRes.count ?? 0,
    upcomingMeetings: upcomingRes.count ?? 0,
    activeMeetings,
    upcoming: (upcomingListRes.data ?? []).map((l: Record<string, unknown>) => ({
      ...l,
      teacher_name: teacherMap.get(l.teacher_id as string) ?? null,
    })),
  });
}
