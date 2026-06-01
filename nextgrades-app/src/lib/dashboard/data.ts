import { supabase } from "@/lib/supabase/client";
import type { Material, Subject } from "@/lib/api/client";
import { getCachedSession } from "@/lib/supabase/session-cache";
import { isSupabaseEnvConfigured } from "@/lib/supabase/env";

export type DashboardLesson = {
  id: string;
  start_time: string;
  duration: number;
  zoom_link?: string | null;
  zoom_meeting_id?: string | null;
  status: string;
  notes?: string | null;
  student_id?: string | null;
  teacher_name?: string;
  student_name?: string;
  subject_name?: string;
};

export type DashboardProfile = {
  id: string;
  full_name: string | null;
  role: string;
  avatar_url?: string | null;
  created_at?: string;
};

export type StudentEnrollment = {
  id: string;
  status: string;
  subject_name?: string;
  class_name?: string;
  semester?: number | null;
};

export type TeacherStudentRow = {
  id: string;
  name: string;
  subject: string;
  next_lesson: string;
};

export type ActivityLogRow = {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  time: string;
};

export type NotificationRow = {
  id: string;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type AdminStats = {
  total_students: number;
  total_teachers: number;
  active_enrollments: number;
  total_earnings: number;
};

async function getSessionUserId(): Promise<string | null> {
  const session = await getCachedSession();
  return session?.user?.id ?? null;
}

async function mapLessons(rows: Record<string, unknown>[]): Promise<DashboardLesson[]> {
  if (!rows.length) return [];

  const teacherIds = [...new Set(rows.map((r) => r.teacher_id as string).filter(Boolean))];
  const studentIds = [...new Set(rows.map((r) => r.student_id as string).filter(Boolean))];
  const subjectIds = [...new Set(rows.map((r) => r.subject_id as string).filter(Boolean))];

  const [teachers, students, subjects] = await Promise.all([
    teacherIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", teacherIds)
      : Promise.resolve({ data: [] }),
    studentIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", studentIds)
      : Promise.resolve({ data: [] }),
    subjectIds.length
      ? supabase.from("subjects").select("id, name").in("id", subjectIds)
      : Promise.resolve({ data: [] }),
  ]);

  const teacherMap = new Map<string, string | undefined>(
    (teachers.data || []).map((p: { id: string; full_name: string | null }) => [
      p.id,
      p.full_name ?? undefined,
    ])
  );
  const studentMap = new Map<string, string | undefined>(
    (students.data || []).map((p: { id: string; full_name: string | null }) => [
      p.id,
      p.full_name ?? undefined,
    ])
  );
  const subjectMap = new Map<string, string>(
    (subjects.data || []).map((s: { id: string; name: string }) => [s.id, s.name])
  );

  return rows.map((r) => ({
    id: r.id as string,
    start_time: r.start_time as string,
    duration: (r.duration as number) ?? 60,
    zoom_link: r.zoom_link as string | null,
    zoom_meeting_id: r.zoom_meeting_id as string | null,
    status: (r.status as string) ?? "scheduled",
    teacher_name: teacherMap.get(r.teacher_id as string),
    student_name: studentMap.get(r.student_id as string),
    subject_name: subjectMap.get(r.subject_id as string),
  }));
}

export async function fetchStudentLessons(studentId: string): Promise<DashboardLesson[]> {
  if (!isSupabaseEnvConfigured()) return [];

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("student_id", studentId)
    .gte("start_time", now)
    .in("status", ["scheduled"])
    .order("start_time", { ascending: true })
    .limit(20);

  if (error || !data) return [];
  return mapLessons(data);
}

export async function fetchTeacherLessons(teacherId: string): Promise<DashboardLesson[]> {
  if (!isSupabaseEnvConfigured()) return [];

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("teacher_id", teacherId)
    .gte("start_time", now)
    .in("status", ["scheduled"])
    .order("start_time", { ascending: true })
    .limit(20);

  if (error || !data) return [];
  return mapLessons(data);
}

export async function fetchStudentUnits(studentId: string): Promise<{ total: number; remaining: number } | null> {
  if (!isSupabaseEnvConfigured()) return null;

  const { data, error } = await supabase
    .from("user_units")
    .select("total_units, remaining_units")
    .eq("student_id", studentId)
    .maybeSingle();

  if (error || !data) return null;
  return { total: data.total_units ?? 0, remaining: data.remaining_units ?? 0 };
}

export async function fetchStudentEnrollments(studentId: string): Promise<StudentEnrollment[]> {
  if (!isSupabaseEnvConfigured()) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select("id, status, semester, subject_id, class_id")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error || !data?.length) return [];

  type EnrollmentRow = {
    id: string;
    status: string;
    semester: number | null;
    subject_id: string;
    class_id: string | null;
  };
  const rows = data as EnrollmentRow[];

  const subjectIds = [...new Set(rows.map((e) => e.subject_id).filter(Boolean))];
  const classIds = [...new Set(rows.map((e) => e.class_id).filter(Boolean))];

  const [subjectsRes, classesRes] = await Promise.all([
    subjectIds.length
      ? supabase.from("subjects").select("id, name").in("id", subjectIds)
      : Promise.resolve({ data: [] }),
    classIds.length
      ? supabase.from("classes").select("id, name").in("id", classIds)
      : Promise.resolve({ data: [] }),
  ]);

  const subjectMap = new Map<string, string>(
    (subjectsRes.data || []).map((s: { id: string; name: string }) => [s.id, s.name])
  );
  const classMap = new Map<string, string>(
    (classesRes.data || []).map((c: { id: string; name: string }) => [c.id, c.name])
  );

  return rows.map((e) => ({
    id: e.id,
    status: e.status,
    semester: e.semester,
    subject_name: subjectMap.get(e.subject_id) ?? undefined,
    class_name: e.class_id ? classMap.get(e.class_id) : undefined,
  }));
}

export async function fetchCompletedLessonsCount(studentId: string): Promise<number> {
  if (!isSupabaseEnvConfigured()) return 0;

  const { count, error } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("status", "completed");

  if (error) return 0;
  return count ?? 0;
}

export async function fetchMaterials(options: { isPremium?: boolean; limit?: number } = {}): Promise<Material[]> {
  if (!isSupabaseEnvConfigured()) return [];

  let query = supabase
    .from("materials")
    .select("*")
    .eq("status", "published")
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false });

  if (options.isPremium !== undefined) {
    query = query.eq("is_premium", options.isPremium);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as Material[];
}

export async function fetchSubjects(): Promise<Subject[]> {
  if (!isSupabaseEnvConfigured()) return [];

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data as Subject[];
}

export async function fetchTeacherStats(teacherId: string) {
  if (!isSupabaseEnvConfigured()) {
    return {
      lessons_today: 0,
      total_students: 0,
      lessons_week: 0,
      earnings_month: 0,
      nextjump_level: 1,
      hours_to_next: 0,
      total_hours: 0,
    };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [statsRes, todayRes, weekRes, studentsRes] = await Promise.all([
    supabase.from("teacher_stats").select("*").eq("teacher_id", teacherId).maybeSingle(),
    supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", teacherId)
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString())
      .neq("status", "cancelled"),
    supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", teacherId)
      .gte("start_time", weekAgo.toISOString())
      .neq("status", "cancelled"),
    supabase.from("lessons").select("student_id").eq("teacher_id", teacherId),
  ]);

  const stats = statsRes.data;
  const uniqueStudents = new Set((studentsRes.data || []).map((l: { student_id: string }) => l.student_id));

  const level = stats?.current_bonus_level ?? 1;
  const totalHours = Number(stats?.total_hours ?? 0);
  const hoursThresholds = [0, 20, 50, 100];
  const nextThreshold = hoursThresholds[level] ?? 100;
  const hoursToNext = Math.max(0, nextThreshold - totalHours);

  return {
    lessons_today: todayRes.count ?? 0,
    total_students: uniqueStudents.size,
    lessons_week: weekRes.count ?? 0,
    earnings_month: Number(stats?.earnings_mtd ?? 0),
    nextjump_level: level,
    hours_to_next: Math.round(hoursToNext),
    total_hours: totalHours,
  };
}

export async function fetchTeacherStudents(teacherId: string, locale: string): Promise<TeacherStudentRow[]> {
  if (!isSupabaseEnvConfigured()) return [];

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("student_id, subject_id, start_time, status")
    .eq("teacher_id", teacherId)
    .order("start_time", { ascending: true });

  if (error || !lessons?.length) return [];

  const now = new Date();
  const studentIds = new Set<string>();
  const nextByStudent = new Map<string, { subject_id: string; start_time: string }>();
  const latestByStudent = new Map<string, { subject_id: string }>();

  for (const l of lessons) {
    if (!l.student_id) continue;
    studentIds.add(l.student_id);
    latestByStudent.set(l.student_id, { subject_id: l.subject_id });

    if (l.status === "cancelled" || l.status === "completed") continue;
    const startTime = new Date(l.start_time);
    if (startTime < now) continue;

    const existing = nextByStudent.get(l.student_id);
    if (!existing || startTime < new Date(existing.start_time)) {
      nextByStudent.set(l.student_id, { subject_id: l.subject_id, start_time: l.start_time });
    }
  }

  if (!studentIds.size) return [];

  const ids = [...studentIds];
  const subjectIds = [
    ...new Set(
      [...nextByStudent.values(), ...latestByStudent.values()]
        .map((v) => v.subject_id)
        .filter(Boolean)
    ),
  ] as string[];

  const [profilesRes, subjectsRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", ids),
    subjectIds.length
      ? supabase.from("subjects").select("id, name").in("id", subjectIds)
      : Promise.resolve({ data: [] }),
  ]);

  const nameMap = new Map<string, string>(
    (profilesRes.data || []).map((p: { id: string; full_name: string | null }) => [
      p.id,
      p.full_name || "Student",
    ])
  );
  const subjectMap = new Map<string, string>(
    (subjectsRes.data || []).map((s: { id: string; name: string }) => [s.id, s.name])
  );

  const dateLocale = locale.startsWith("de") ? "de-DE" : "en-US";

  return ids.map((id) => {
    const upcoming = nextByStudent.get(id);
    const fallback = latestByStudent.get(id);
    const subjectId = upcoming?.subject_id ?? fallback?.subject_id;
    const nextLesson = upcoming
      ? new Date(upcoming.start_time).toLocaleString(dateLocale, {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

    return {
      id,
      name: nameMap.get(id) ?? "Student",
      subject: subjectId ? (subjectMap.get(subjectId) ?? "—") : "—",
      next_lesson: nextLesson,
    };
  });
}

/** Students available when scheduling Zoom classes (not limited to past lessons). */
export async function fetchStudentsForScheduling(): Promise<{ id: string; name: string }[]> {
  const profiles = await fetchProfilesByRole("student");
  return profiles.map((p) => ({
    id: p.id,
    name: p.full_name?.trim() || "Student",
  }));
}

export async function fetchProfilesByRole(role: "student" | "teacher" | "admin"): Promise<DashboardProfile[]> {
  if (!isSupabaseEnvConfigured()) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url, created_at")
    .eq("role", role)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as DashboardProfile[];
}

const EMPTY_ADMIN_STATS: AdminStats = {
  total_students: 0,
  total_teachers: 0,
  active_enrollments: 0,
  total_earnings: 0,
};

/** Single round-trip admin dashboard payload (stats + activity) — server-cached. */
export async function fetchAdminDashboard(activityLimit = 10): Promise<{
  stats: AdminStats;
  activities: ActivityLogRow[];
}> {
  if (!isSupabaseEnvConfigured()) {
    return { stats: EMPTY_ADMIN_STATS, activities: [] };
  }

  try {
    const res = await fetch(`/api/admin/dashboard?activityLimit=${activityLimit}`, {
      credentials: "include",
    });
    if (!res.ok) {
      return { stats: EMPTY_ADMIN_STATS, activities: [] };
    }
    const data = (await res.json()) as { stats?: AdminStats; activities?: ActivityLogRow[] };
    return {
      stats: data.stats ?? EMPTY_ADMIN_STATS,
      activities: Array.isArray(data.activities) ? data.activities : [],
    };
  } catch {
    return { stats: EMPTY_ADMIN_STATS, activities: [] };
  }
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { stats } = await fetchAdminDashboard(1);
  return stats;
}

export async function fetchActivityLogs(limit = 10): Promise<ActivityLogRow[]> {
  if (!isSupabaseEnvConfigured()) return [];

  const { data, error } = await supabase
    .from("activity_logs")
    .select("id, action, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  type ActivityRow = { id: string; action: string; metadata: unknown; created_at: string };
  return (data as ActivityRow[]).map((row) => {
    const meta = (row.metadata as Record<string, string> | null) ?? {};
    let type: ActivityLogRow["type"] = "info";
    if (row.action.includes("payment") || row.action.includes("success")) type = "success";
    if (row.action.includes("warning") || row.action.includes("pending")) type = "warning";

    return {
      id: row.id,
      type,
      title: meta.title || row.action,
      time: new Date(row.created_at).toLocaleString(),
    };
  });
}

export async function fetchNotifications(userId: string, limit = 10): Promise<NotificationRow[]> {
  if (!isSupabaseEnvConfigured()) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as NotificationRow[];
}

export async function fetchCurrentProfile(): Promise<DashboardProfile | null> {
  const userId = await getSessionUserId();
  if (!userId || !isSupabaseEnvConfigured()) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as DashboardProfile;
}

export async function updateProfile(fullName: string): Promise<{ error: string | null }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq("id", userId);

  return { error: error?.message ?? null };
}

export function computeEnrollmentProgress(enrollments: StudentEnrollment[]): number {
  if (!enrollments.length) return 0;
  const active = enrollments.filter((e) => e.status === "active").length;
  return Math.round((active / enrollments.length) * 100);
}

export { getSessionUserId, isSupabaseEnvConfigured, isSupabaseEnvConfigured as isSupabaseConfigured };
