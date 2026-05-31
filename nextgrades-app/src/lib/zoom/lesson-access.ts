import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole } from "@/lib/auth/roles";

export type LessonMeetingRow = {
  id: string;
  teacher_id: string;
  student_id: string;
  subject_id: string | null;
  status: string;
  start_time: string;
  duration: number;
  zoom_link: string | null;
  zoom_start_url: string | null;
  zoom_passcode: string | null;
  zoom_meeting_id: string | null;
};

export async function fetchLessonForMeetingAccess(
  db: SupabaseClient,
  lessonId: string
): Promise<LessonMeetingRow | null> {
  const { data, error } = await db
    .from("lessons")
    .select(
      "id, teacher_id, student_id, subject_id, status, start_time, duration, zoom_link, zoom_start_url, zoom_passcode, zoom_meeting_id"
    )
    .eq("id", lessonId)
    .maybeSingle();

  if (error || !data) return null;
  return data as LessonMeetingRow;
}

/** Students may join only their own scheduled lesson with an active enrollment (or prior lesson). */
export async function canStudentAccessLessonMeeting(
  db: SupabaseClient,
  lesson: LessonMeetingRow,
  studentId: string
): Promise<boolean> {
  if (lesson.student_id !== studentId) return false;
  if (lesson.status !== "scheduled") return false;
  if (!lesson.zoom_link && !lesson.zoom_meeting_id) return false;

  const { data: enrollment } = await db
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (enrollment) return true;

  // Lesson row itself implies teacher scheduled this student
  return true;
}

export function resolveMeetingUrl(
  lesson: LessonMeetingRow,
  role: AppRole,
  userId: string
): { url: string | null; passcode: string | null } {
  if (role === "teacher" && lesson.teacher_id === userId) {
    return {
      url: lesson.zoom_start_url || lesson.zoom_link,
      passcode: lesson.zoom_passcode,
    };
  }

  if (role === "student" && lesson.student_id === userId) {
    return {
      url: lesson.zoom_link,
      passcode: lesson.zoom_passcode,
    };
  }

  if (role === "admin") {
    return { url: lesson.zoom_link, passcode: lesson.zoom_passcode };
  }

  return { url: null, passcode: null };
}
