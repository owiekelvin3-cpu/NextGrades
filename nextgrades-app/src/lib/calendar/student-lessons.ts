import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { LESSON_QUERY_LIMIT, lessonHistorySinceIso } from "@/lib/dashboard/limits";
import type { CalendarLesson } from "@/lib/calendar/ical";

type LessonRow = {
  id: string;
  teacher_id: string | null;
  subject_id: string | null;
  start_time: string;
  duration: number | null;
  zoom_link: string | null;
  status: string | null;
};

export async function fetchStudentLessonsForCalendar(studentId: string): Promise<CalendarLesson[]> {
  if (!isSupabaseServiceRoleConfigured()) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("lessons")
    .select("id, teacher_id, subject_id, start_time, duration, zoom_link, status")
    .eq("student_id", studentId)
    .neq("status", "cancelled")
    .gte("start_time", lessonHistorySinceIso())
    .order("start_time", { ascending: true })
    .limit(LESSON_QUERY_LIMIT);

  if (error || !data?.length) return [];

  const rows = data as LessonRow[];
  const teacherIds = [...new Set(rows.map((r) => r.teacher_id).filter(Boolean))] as string[];
  const subjectIds = [...new Set(rows.map((r) => r.subject_id).filter(Boolean))] as string[];

  const [teachers, subjects] = await Promise.all([
    teacherIds.length
      ? admin.from("profiles").select("id, full_name").in("id", teacherIds)
      : Promise.resolve({ data: [] }),
    subjectIds.length
      ? admin.from("subjects").select("id, name").in("id", subjectIds)
      : Promise.resolve({ data: [] }),
  ]);

  const teacherMap = new Map(
    (teachers.data || []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name ?? undefined])
  );
  const subjectMap = new Map(
    (subjects.data || []).map((s: { id: string; name: string }) => [s.id, s.name])
  );

  return rows.map((r) => ({
    id: r.id,
    start_time: r.start_time,
    duration: r.duration ?? 60,
    zoom_link: r.zoom_link,
    status: r.status ?? "scheduled",
    teacher_name: r.teacher_id ? teacherMap.get(r.teacher_id) : undefined,
    subject_name: r.subject_id ? subjectMap.get(r.subject_id) : undefined,
  }));
}
