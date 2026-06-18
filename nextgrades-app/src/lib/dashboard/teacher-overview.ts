import { supabase } from "@/lib/supabase/client";
import { LESSON_QUERY_LIMIT, lessonHistorySinceIso } from "@/lib/dashboard/limits";
import {
  fetchCurrentProfile,
  fetchNotifications,
  fetchTeacherLessons,
  fetchTeacherStats,
  getSessionUserId,
  isSupabaseConfigured,
  type DashboardLesson,
  type NotificationRow,
} from "@/lib/dashboard/data";

export type TeacherStudentOverview = {
  id: string;
  name: string;
  subject: string;
  lessonCount: number;
  totalHours: number;
};

export type TeacherPaymentRow = {
  id: string;
  studentName: string;
  method: string;
  date: string;
  amount: number;
  status: "paid" | "pending";
};

export type TeacherOverviewData = {
  profile: { fullName: string; avatarUrl?: string | null };
  stats: {
    lessonsToday: number;
    hoursToday: number;
    todayUpcoming: number;
    todayCompleted: number;
    weekPlanned: number;
    weekHours: number;
    weekCompleted: number;
    weekPending: number;
    earningsMonth: number;
    earningsGross: number;
    earningsPending: number;
    totalStudents: number;
    nextjumpLevel: number;
    hoursToNext: number;
    totalHours: number;
    bonusProgress: number;
    bonusCurrent: number;
    bonusNextGoal: number;
  };
  upcomingLessons: DashboardLesson[];
  students: TeacherStudentOverview[];
  notifications: NotificationRow[];
  unreadNotifications: number;
  recentPayments: TeacherPaymentRow[];
};

const BONUS_GOALS = [100, 250, 400, 600];

type LessonRow = {
  id: string;
  student_id: string | null;
  subject_id: string | null;
  start_time: string;
  duration: number | null;
  zoom_link: string | null;
  status: string | null;
  notes: string | null;
};

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

async function fetchTeacherAllLessons(teacherId: string): Promise<DashboardLesson[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("teacher_id", teacherId)
    .neq("status", "cancelled")
    .gte("start_time", lessonHistorySinceIso())
    .order("start_time", { ascending: true })
    .limit(LESSON_QUERY_LIMIT);

  if (error || !data) return [];

  const rows = data as LessonRow[];
  const studentIds = [...new Set(rows.map((r) => r.student_id).filter(Boolean))] as string[];
  const subjectIds = [...new Set(rows.map((r) => r.subject_id).filter(Boolean))] as string[];

  const [students, subjects] = await Promise.all([
    studentIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", studentIds)
      : Promise.resolve({ data: [] }),
    subjectIds.length
      ? supabase.from("subjects").select("id, name").in("id", subjectIds)
      : Promise.resolve({ data: [] }),
  ]);

  const studentMap = new Map(
    (students.data || []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name ?? undefined])
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
    student_id: r.student_id,
    teacher_name: undefined,
    student_name: r.student_id ? (studentMap.get(r.student_id) as string | undefined) : undefined,
    subject_name: r.subject_id ? (subjectMap.get(r.subject_id) as string | undefined) : undefined,
    notes: r.notes ?? undefined,
  }));
}

function buildStudentList(lessons: DashboardLesson[]): TeacherStudentOverview[] {
  const byStudent = new Map<
    string,
    { id: string; name: string; subject: string; count: number; minutes: number }
  >();

  for (const lesson of lessons) {
    if (!lesson.student_id || !lesson.student_name) continue;
    const existing = byStudent.get(lesson.student_id) || {
      id: lesson.student_id,
      name: lesson.student_name,
      subject: lesson.subject_name || "—",
      count: 0,
      minutes: 0,
    };
    existing.count += 1;
    existing.minutes += lesson.duration;
    if (lesson.subject_name) existing.subject = lesson.subject_name;
    byStudent.set(lesson.student_id, existing);
  }

  return [...byStudent.values()].map((info) => ({
    id: info.id,
    name: info.name,
    subject: info.subject,
    lessonCount: info.count,
    totalHours: Math.round((info.minutes / 60) * 10) / 10,
  }));
}

function buildRecentPayments(
  lessons: DashboardLesson[],
  earningsMonth: number
): TeacherPaymentRow[] {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const completed = lessons.filter(
    (l) => l.status === "completed" && new Date(l.start_time) >= monthStart
  );

  const totalMinutes = completed.reduce((s, l) => s + l.duration, 0);
  const ratePerHour = totalMinutes > 0 ? earningsMonth / (totalMinutes / 60) : 0;

  return completed
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, 5)
    .map((l) => ({
      id: l.id,
      studentName: l.student_name || "—",
      method: "Überweisung",
      date: l.start_time,
      amount: Math.round((l.duration / 60) * ratePerHour * 100) / 100,
      status: "paid" as const,
    }));
}

export function getTeacherFirstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0].toLowerCase().includes("herr")) return `${parts[0]} ${parts[1]}`;
  return parts[0] || fullName || "—";
}

export async function fetchTeacherOverviewData(): Promise<TeacherOverviewData | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const profile = await fetchCurrentProfile();
  const [baseStats, upcomingLessons, allLessons, notifications] = await Promise.all([
    fetchTeacherStats(userId),
    fetchTeacherLessons(userId),
    fetchTeacherAllLessons(userId),
    fetchNotifications(userId, 5),
  ]);

  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);

  const todayLessons = allLessons.filter((l) => {
    const t = new Date(l.start_time);
    return t >= dayStart && t <= dayEnd;
  });

  const weekLessons = allLessons.filter((l) => {
    const t = new Date(l.start_time);
    return t >= weekStart;
  });

  const hoursToday = todayLessons.reduce((s, l) => s + l.duration, 0) / 60;
  const todayCompleted = todayLessons.filter((l) => l.status === "completed").length;
  const todayUpcoming = todayLessons.filter(
    (l) => l.status === "scheduled" && new Date(l.start_time) >= now
  ).length;

  const weekCompleted = weekLessons.filter((l) => l.status === "completed").length;
  const weekPending = weekLessons.filter(
    (l) => l.status === "scheduled" && new Date(l.start_time) >= now
  ).length;

  const level = baseStats.nextjump_level;
  const thresholds = [0, 20, 50, 100];
  const nextThreshold = thresholds[level] ?? 100;
  const prevThreshold = thresholds[level - 1] ?? 0;
  const bonusProgress =
    nextThreshold > prevThreshold
      ? Math.min(100, Math.round(((baseStats.total_hours - prevThreshold) / (nextThreshold - prevThreshold)) * 100))
      : 100;

  const bonusCurrent = BONUS_GOALS[Math.min(level - 1, BONUS_GOALS.length - 1)] * (bonusProgress / 100);
  const bonusNextGoal = BONUS_GOALS[Math.min(level, BONUS_GOALS.length - 1)];

  const weekHours = Math.round((weekLessons.reduce((s, l) => s + l.duration, 0) / 60) * 10) / 10;

  const earningsMonth = baseStats.earnings_month;
  const earningsGross = Math.round(earningsMonth * 1.19 * 100) / 100;
  const earningsPending = Math.max(0, Math.round((earningsGross - earningsMonth) * 100) / 100);

  return {
    profile: {
      fullName: profile?.full_name ?? "",
      avatarUrl: profile?.avatar_url,
    },
    stats: {
      lessonsToday: todayLessons.length,
      hoursToday: Math.round(hoursToday * 10) / 10,
      todayUpcoming,
      todayCompleted,
      weekPlanned: weekLessons.length,
      weekHours,
      weekCompleted,
      weekPending,
      earningsMonth,
      earningsGross,
      earningsPending,
      totalStudents: baseStats.total_students,
      nextjumpLevel: level,
      hoursToNext: baseStats.hours_to_next,
      totalHours: baseStats.total_hours,
      bonusProgress,
      bonusCurrent: Math.round(bonusCurrent * 100) / 100,
      bonusNextGoal,
    },
    upcomingLessons: upcomingLessons.slice(0, 6),
    students: buildStudentList(allLessons),
    notifications,
    unreadNotifications: notifications.filter((n) => !n.is_read).length,
    recentPayments: buildRecentPayments(allLessons, earningsMonth),
  };
}
