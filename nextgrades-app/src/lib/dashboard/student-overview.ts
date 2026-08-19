import { supabase } from "@/lib/supabase/client";
import type { Material } from "@/lib/api/client";
import { LESSON_QUERY_LIMIT, lessonHistorySinceIso } from "@/lib/dashboard/limits";
import {
  fetchStudentEnrollments,
  fetchStudentLessons,
  fetchStudentUnits,
  fetchNotifications,
  fetchCurrentProfile,
  getSessionUserId,
  isSupabaseConfigured,
  type DashboardLesson,
  type NotificationRow,
  type StudentEnrollment,
} from "@/lib/dashboard/data";

export type StudentCourseRow = {
  enrollmentId: string;
  subjectName: string;
  teacherName?: string;
  lessonCount: number;
  progressPercent: number;
};

export type StudentTaskRow = {
  id: string;
  title: string;
  topic?: string | null;
  status: "open" | "in_progress";
  dueLabel?: string;
};

export type StudentOverviewData = {
  profile: { fullName: string; avatarUrl?: string | null };
  learningGoal: string | null;
  units: { total: number; remaining: number } | null;
  lessons: DashboardLesson[];
  nextLesson: DashboardLesson | null;
  materials: Material[];
  enrollments: StudentEnrollment[];
  courses: StudentCourseRow[];
  tasks: StudentTaskRow[];
  openTaskCount: number;
  overallProgress: number;
  progressSparkline: number[];
  notifications: NotificationRow[];
  unreadNotifications: number;
};

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export { formatBytes };

type LessonRow = {
  id: string;
  teacher_id: string | null;
  subject_id: string | null;
  start_time: string;
  duration: number | null;
  zoom_link: string | null;
  zoom_meeting_id: string | null;
  meeting_url: string | null;
  meeting_provider: string | null;
  meeting_title: string | null;
  status: string | null;
};

async function fetchAllStudentLessons(studentId: string): Promise<DashboardLesson[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id, teacher_id, subject_id, start_time, duration, zoom_link, zoom_meeting_id, meeting_url, meeting_provider, meeting_title, status"
    )
    .eq("student_id", studentId)
    .neq("status", "cancelled")
    .gte("start_time", lessonHistorySinceIso())
    .order("start_time", { ascending: true })
    .limit(LESSON_QUERY_LIMIT);

  if (error || !data) return [];

  const rows = data as LessonRow[];
  const teacherIds = [...new Set(rows.map((r) => r.teacher_id).filter(Boolean))] as string[];
  const subjectIds = [...new Set(rows.map((r) => r.subject_id).filter(Boolean))] as string[];

  const [teachers, subjects] = await Promise.all([
    teacherIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", teacherIds)
      : Promise.resolve({ data: [] }),
    subjectIds.length
      ? supabase.from("subjects").select("id, name").in("id", subjectIds)
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
    zoom_meeting_id: r.zoom_meeting_id,
    meeting_url: r.meeting_url,
    meeting_provider: r.meeting_provider,
    meeting_title: r.meeting_title,
    status: r.status ?? "scheduled",
    teacher_name: r.teacher_id ? (teacherMap.get(r.teacher_id) as string | undefined) : undefined,
    subject_name: r.subject_id ? (subjectMap.get(r.subject_id) as string | undefined) : undefined,
  }));
}

export function buildCourseRows(
  enrollments: StudentEnrollment[],
  lessons: DashboardLesson[]
): StudentCourseRow[] {
  return enrollments.map((e) => {
    const subjectLessons = lessons.filter((l) => l.subject_name === e.subject_name);
    const completed = subjectLessons.filter((l) => l.status === "completed").length;
    const total = subjectLessons.length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const latest = [...subjectLessons].sort(
      (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    )[0];

    return {
      enrollmentId: e.id,
      subjectName: e.subject_name ?? "-",
      teacherName: latest?.teacher_name,
      lessonCount: total,
      progressPercent,
    };
  });
}

async function fetchStudentQuizTasks(studentId: string): Promise<StudentTaskRow[]> {
  if (!isSupabaseConfigured()) return [];

  const [quizzesRes, attemptsRes] = await Promise.all([
    supabase
      .from("generated_quizzes")
      .select("id, title, topic, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("quiz_attempts")
      .select("quiz_id, completed_at")
      .eq("student_id", studentId),
  ]);

  if (quizzesRes.error || !quizzesRes.data) return [];

  const attempts = attemptsRes.data || [];
  const completedIds = new Set(
    attempts.filter((a: { completed_at: string | null }) => a.completed_at).map((a: { quiz_id: string }) => a.quiz_id)
  );
  const inProgressIds = new Set(
    attempts
      .filter((a: { completed_at: string | null }) => !a.completed_at)
      .map((a: { quiz_id: string }) => a.quiz_id)
  );

  return quizzesRes.data
    .filter((q: { id: string }) => !completedIds.has(q.id))
    .slice(0, 5)
    .map((q: { id: string; title: string; topic: string | null; created_at: string }) => ({
      id: q.id,
      title: q.title,
      topic: q.topic,
      status: inProgressIds.has(q.id) ? ("in_progress" as const) : ("open" as const),
      dueLabel: q.created_at,
    }));
}

async function computeOverallProgress(studentId: string, lessons: DashboardLesson[]): Promise<{
  percent: number;
  sparkline: number[];
}> {
  if (!isSupabaseConfigured()) return { percent: 0, sparkline: [] };

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("score_percent, completed_at")
    .eq("student_id", studentId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: true })
    .limit(12);

  const scores = (attempts || [])
    .map((a: { score_percent: number | null }) => Number(a.score_percent ?? 0))
    .filter((s: number) => !Number.isNaN(s));

  if (scores.length > 0) {
    const avg = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
    return { percent: avg, sparkline: scores };
  }

  const total = lessons.length;
  const completed = lessons.filter((l) => l.status === "completed").length;
  if (total > 0) {
    const pct = Math.round((completed / total) * 100);
    return { percent: pct, sparkline: [pct] };
  }

  return { percent: 0, sparkline: [] };
}

async function fetchLearningGoal(userId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("learning_goal")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  const row = data as { learning_goal?: string | null } | null;
  return row?.learning_goal?.trim() || null;
}

export async function updateLearningGoal(goal: string): Promise<{ error: string | null }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ learning_goal: goal.trim() || null, updated_at: new Date().toISOString() })
    .eq("id", userId);

  return { error: error?.message ?? null };
}

export async function fetchStudentOverviewData(): Promise<StudentOverviewData | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const [
    profile,
    learningGoal,
    units,
    upcomingLessons,
    allLessons,
    materials,
    enrollments,
    tasks,
    notifications,
  ] = await Promise.all([
    fetchCurrentProfile(),
    fetchLearningGoal(userId),
    fetchStudentUnits(userId),
    fetchStudentLessons(userId),
    fetchAllStudentLessons(userId),
    fetchAssignedStudentMaterials(8),
    fetchStudentEnrollments(userId),
    fetchStudentQuizTasks(userId),
    fetchNotifications(userId, 5),
  ]);

  const { percent, sparkline } = await computeOverallProgress(userId, allLessons);
  const courses = buildCourseRows(enrollments, allLessons);
  const unreadNotifications = notifications.filter((n) => !n.is_read).length;

  return {
    profile: {
      fullName: profile?.full_name ?? "",
      avatarUrl: profile?.avatar_url,
    },
    learningGoal,
    units,
    lessons: upcomingLessons,
    nextLesson: upcomingLessons[0] ?? null,
    materials,
    enrollments,
    courses,
    tasks,
    openTaskCount: tasks.length,
    overallProgress: percent,
    progressSparkline: sparkline,
    notifications,
    unreadNotifications,
  };
}

export type StudentCourseDetail = StudentCourseRow & {
  status: string;
  className?: string;
  semester?: number | null;
  nextLesson: DashboardLesson | null;
  completedLessons: number;
};

export type StudentAppointmentsData = {
  profile: { fullName: string; avatarUrl?: string | null };
  units: { total: number; remaining: number } | null;
  upcoming: DashboardLesson[];
  past: DashboardLesson[];
  nextLesson: DashboardLesson | null;
  primaryTeacher: { name: string; subject?: string } | null;
};

export type StudentCoursesPageData = {
  courses: StudentCourseDetail[];
  overallProgress: number;
  activeCount: number;
  remainingUnits: number;
  learnedHours: number;
  progressBreakdown: { completed: number; inProgress: number; planned: number };
};

export async function fetchAllStudentLessonsForStudent(studentId: string): Promise<DashboardLesson[]> {
  return fetchAllStudentLessons(studentId);
}

function buildCourseDetails(
  enrollments: StudentEnrollment[],
  lessons: DashboardLesson[]
): StudentCourseDetail[] {
  const now = Date.now();
  return enrollments.map((e) => {
    const subjectLessons = lessons.filter((l) => l.subject_name === e.subject_name);
    const completed = subjectLessons.filter((l) => l.status === "completed").length;
    const total = subjectLessons.length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const upcoming = subjectLessons
      .filter((l) => l.status === "scheduled" && new Date(l.start_time).getTime() >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    const latest = [...subjectLessons].sort(
      (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    )[0];

    return {
      enrollmentId: e.id,
      subjectName: e.subject_name ?? "-",
      teacherName: latest?.teacher_name,
      lessonCount: total,
      progressPercent,
      status: e.status,
      className: e.class_name,
      semester: e.semester,
      nextLesson: upcoming[0] ?? null,
      completedLessons: completed,
    };
  });
}

export async function fetchStudentAppointmentsData(): Promise<StudentAppointmentsData | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const profile = await fetchCurrentProfile();
  const [units, allLessons] = await Promise.all([
    fetchStudentUnits(userId),
    fetchAllStudentLessons(userId),
  ]);

  const now = Date.now();
  const upcoming = allLessons
    .filter((l) => {
      if (l.status !== "scheduled") return false;
      if (!l.meeting_url && !l.zoom_link && !l.zoom_meeting_id) return true;
      return new Date(l.start_time).getTime() >= now;
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const past = allLessons
    .filter((l) => {
      const hasLink = Boolean(l.meeting_url || l.zoom_link || l.zoom_meeting_id);
      if (l.status === "scheduled" && !hasLink) return false;
      return l.status === "completed" || new Date(l.start_time).getTime() < now;
    })
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const next = upcoming[0] ?? null;
  const primaryTeacher = next?.teacher_name
    ? { name: next.teacher_name, subject: next.subject_name }
    : allLessons.find((l) => l.teacher_name)?.teacher_name
      ? {
          name: allLessons.find((l) => l.teacher_name)!.teacher_name!,
          subject: allLessons.find((l) => l.teacher_name)!.subject_name,
        }
      : null;

  return {
    profile: {
      fullName: profile?.full_name ?? "",
      avatarUrl: profile?.avatar_url,
    },
    units,
    upcoming,
    past,
    nextLesson: next,
    primaryTeacher,
  };
}

export async function fetchStudentCoursesPageData(): Promise<StudentCoursesPageData | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const [enrollments, allLessons, units] = await Promise.all([
    fetchStudentEnrollments(userId),
    fetchAllStudentLessons(userId),
    fetchStudentUnits(userId),
  ]);

  const courses = buildCourseDetails(enrollments, allLessons);
  const activeCount = enrollments.filter((e) => e.status === "active").length;
  const completedLessons = allLessons.filter((l) => l.status === "completed").length;
  const scheduledLessons = allLessons.filter((l) => l.status === "scheduled").length;
  const learnedMinutes = allLessons
    .filter((l) => l.status === "completed")
    .reduce((sum, l) => sum + (l.duration ?? 60), 0);

  const { percent } = await computeOverallProgress(userId, allLessons);

  return {
    courses,
    overallProgress: percent,
    activeCount,
    remainingUnits: units?.remaining ?? 0,
    learnedHours: Math.round(learnedMinutes / 60),
    progressBreakdown: {
      completed: completedLessons,
      inProgress: scheduledLessons,
      planned: Math.max(0, (units?.total ?? 0) - completedLessons - scheduledLessons),
    },
  };
}

export async function fetchStudentResourcesPageData(): Promise<{
  materials: Material[];
  enrollments: StudentEnrollment[];
} | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const [materials, enrollments] = await Promise.all([
    fetchAssignedStudentMaterials(),
    fetchStudentEnrollments(userId),
  ]);

  return { materials, enrollments };
}

async function fetchAssignedStudentMaterials(limit?: number): Promise<Material[]> {
  try {
    const params = limit ? `?limit=${limit}` : "";
    const res = await fetch(`/api/student/materials${params}`);
    if (!res.ok) return [];
    const json = (await res.json()) as { materials?: Material[] };
    return Array.isArray(json.materials) ? json.materials : [];
  } catch {
    return [];
  }
}

export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName || "-";
}
