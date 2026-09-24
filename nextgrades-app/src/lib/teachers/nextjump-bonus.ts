import type { SupabaseClient } from "@supabase/supabase-js";
import { roundMoney } from "@/lib/teachers/payroll";

/** Milestone bonuses paid once when crossing each threshold within a 200-lesson cycle. */
export const FREQUENCY_MILESTONES: ReadonlyArray<{ lessons: number; bonus: number }> = [
  { lessons: 10, bonus: 10 },
  { lessons: 20, bonus: 12 },
  { lessons: 32, bonus: 24 },
  { lessons: 48, bonus: 37 },
  { lessons: 75, bonus: 58 },
  { lessons: 105, bonus: 75 },
  { lessons: 145, bonus: 110 },
  { lessons: 200, bonus: 150 },
];

export const FREQUENCY_CYCLE_RESET = 200;

export const LOYALTY_MILESTONES: ReadonlyArray<{ lessons: number; bonusPerHour: number }> = [
  { lessons: 150, bonusPerHour: 0.5 },
  { lessons: 220, bonusPerHour: 1.0 },
  { lessons: 290, bonusPerHour: 1.5 },
];

export const MAX_HOURLY_LOWER = 16;
export const MAX_HOURLY_UPPER = 17;
export const LOYALTY_PERIOD_MONTHS = 6;
export const UPPER_SCHOOL_MIN_LEVEL = 9;

export type FrequencyProgress = {
  completedLessons: number;
  currentLevel: number;
  nextTarget: number | null;
  progressPercent: number;
  bonusEarned: number;
  nextBonusAmount: number | null;
};

export function isUpperSchoolLevel(classLevel: number | null | undefined): boolean {
  return classLevel != null && classLevel >= UPPER_SCHOOL_MIN_LEVEL;
}

export function effectiveHourlyRate(
  baseRate: number,
  loyaltyBonusPerHour: number,
  isUpper: boolean
): number {
  const max = isUpper ? MAX_HOURLY_UPPER : MAX_HOURLY_LOWER;
  return roundMoney(Math.min(baseRate + loyaltyBonusPerHour, max));
}

export function loyaltyBonusForLessons(lessonsCompleted: number): number {
  let bonus = 0;
  for (const m of LOYALTY_MILESTONES) {
    if (lessonsCompleted >= m.lessons) bonus = m.bonusPerHour;
  }
  return bonus;
}

/** Bonuses newly earned when moving from prevCount to newCount within the same cycle. */
export function frequencyBonusesCrossed(
  prevCount: number,
  newCount: number,
  highestMilestonePaid: number
): { bonuses: Array<{ milestone: number; amount: number }>; newHighest: number } {
  const bonuses: Array<{ milestone: number; amount: number }> = [];
  let newHighest = highestMilestonePaid;

  for (const m of FREQUENCY_MILESTONES) {
    if (m.lessons <= highestMilestonePaid) continue;
    if (prevCount < m.lessons && newCount >= m.lessons) {
      bonuses.push({ milestone: m.lessons, amount: m.bonus });
      newHighest = m.lessons;
    }
  }

  return { bonuses, newHighest };
}

export function buildFrequencyProgress(
  lessonsInCycle: number,
  totalBonusEarned: number,
  highestMilestone: number
): FrequencyProgress {
  const nextMilestone = FREQUENCY_MILESTONES.find((m) => m.lessons > lessonsInCycle) ?? null;
  const prevMilestone =
    [...FREQUENCY_MILESTONES].reverse().find((m) => m.lessons <= lessonsInCycle) ?? null;

  const currentLevel = prevMilestone?.lessons ?? 0;
  const nextTarget = nextMilestone?.lessons ?? null;

  let progressPercent = 100;
  if (nextTarget != null) {
    const span = nextTarget - currentLevel;
    progressPercent = span > 0 ? Math.round(((lessonsInCycle - currentLevel) / span) * 100) : 0;
  }

  const currentMilestoneDef = FREQUENCY_MILESTONES.find((m) => m.lessons === highestMilestone);

  return {
    completedLessons: lessonsInCycle,
    currentLevel,
    nextTarget,
    progressPercent: Math.min(100, Math.max(0, progressPercent)),
    bonusEarned: roundMoney(totalBonusEarned),
    nextBonusAmount: nextMilestone?.bonus ?? null,
  };
}

export function loyaltyPeriodBounds(from: Date = new Date()): { start: string; end: string } {
  const start = new Date(from.getFullYear(), from.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(from.getFullYear(), from.getMonth() + LOYALTY_PERIOD_MONTHS, 1, 0, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

type BonusRow = {
  teacher_id: string;
  student_id: string;
  lessons_in_cycle: number;
  highest_milestone: number;
  total_frequency_bonus: number;
};

type LoyaltyRow = {
  id: string;
  period_start: string;
  period_end: string;
  lessons_completed: number;
  bonus_per_hour: number;
};

async function getStudentClassLevel(
  db: SupabaseClient,
  studentId: string
): Promise<number | null> {
  const { data: assignment } = await db
    .from("teacher_student_assignments")
    .select("class:classes(level)")
    .eq("student_id", studentId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cls = assignment?.class as { level?: number } | { level?: number }[] | null;
  const level = Array.isArray(cls) ? cls[0]?.level : cls?.level;
  return level != null ? Number(level) : null;
}

async function ensureLoyaltyPeriod(
  db: SupabaseClient,
  teacherId: string
): Promise<LoyaltyRow> {
  const now = new Date();
  const { data: existing } = await db
    .from("teacher_loyalty_periods")
    .select("id, period_start, period_end, lessons_completed, bonus_per_hour")
    .eq("teacher_id", teacherId)
    .gte("period_end", now.toISOString())
    .lte("period_start", now.toISOString())
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing as LoyaltyRow;

  const bounds = loyaltyPeriodBounds(now);
  const { data: created, error } = await db
    .from("teacher_loyalty_periods")
    .insert({
      teacher_id: teacherId,
      period_start: bounds.start,
      period_end: bounds.end,
      lessons_completed: 0,
      bonus_per_hour: 0,
    })
    .select("id, period_start, period_end, lessons_completed, bonus_per_hour")
    .single();

  if (error) throw new Error(error.message);
  return created as LoyaltyRow;
}

export async function resolveLessonPayRate(
  db: SupabaseClient,
  teacherId: string,
  studentId: string
): Promise<{ hourlyRate: number; isUpper: boolean; loyaltyBonusPerHour: number }> {
  const [statsRes, classLevel, loyalty] = await Promise.all([
    db
      .from("teacher_stats")
      .select("hourly_rate, rate_lower_level, rate_upper_level")
      .eq("teacher_id", teacherId)
      .maybeSingle(),
    getStudentClassLevel(db, studentId),
    ensureLoyaltyPeriod(db, teacherId),
  ]);

  const stats = statsRes.data;
  const fallback = Number(stats?.hourly_rate ?? 35);
  const isUpper = isUpperSchoolLevel(classLevel);
  const baseRate = isUpper
    ? Number(stats?.rate_upper_level ?? fallback)
    : Number(stats?.rate_lower_level ?? fallback);
  const loyaltyBonusPerHour = Number(loyalty.bonus_per_hour ?? 0);
  const hourlyRate = effectiveHourlyRate(baseRate, loyaltyBonusPerHour, isUpper);

  return { hourlyRate, isUpper, loyaltyBonusPerHour };
}

export type LessonBonusResult = {
  frequencyBonuses: number;
  loyaltyBonusPerHour: number;
};

/** Apply frequency + loyalty updates after a billable lesson completion. */
export async function applyLessonBonusUpdates(
  db: SupabaseClient,
  opts: {
    teacherId: string;
    studentId: string;
    lessonId: string;
  }
): Promise<LessonBonusResult> {
  const now = new Date().toISOString();
  let frequencyBonusesTotal = 0;

  const { data: existing } = await db
    .from("teacher_student_bonus")
    .select("lessons_in_cycle, highest_milestone, total_frequency_bonus")
    .eq("teacher_id", opts.teacherId)
    .eq("student_id", opts.studentId)
    .maybeSingle();

  const prevCount = Number(existing?.lessons_in_cycle ?? 0);
  const highestPaid = Number(existing?.highest_milestone ?? 0);
  const prevTotalBonus = Number(existing?.total_frequency_bonus ?? 0);

  let newCount = prevCount + 1;
  let newHighest = highestPaid;
  let cycleBonusEarned = 0;

  const { bonuses, newHighest: crossedHighest } = frequencyBonusesCrossed(
    prevCount,
    newCount,
    highestPaid
  );
  newHighest = crossedHighest;

  for (const b of bonuses) {
    cycleBonusEarned += b.amount;
    frequencyBonusesTotal += b.amount;

    const { error: ledgerError } = await db.from("teacher_earnings_ledger").insert({
      teacher_id: opts.teacherId,
      lesson_id: opts.lessonId,
      amount: b.amount,
      currency: "EUR",
      entry_type: "bonus",
      status: "pending",
      note: `Frequency bonus (${b.milestone} lessons with student)`,
    });
    if (ledgerError) throw new Error(ledgerError.message);
  }

  if (newCount >= FREQUENCY_CYCLE_RESET) {
    newCount = 0;
    newHighest = 0;
  }

  const { error: bonusUpsertError } = await db.from("teacher_student_bonus").upsert(
    {
      teacher_id: opts.teacherId,
      student_id: opts.studentId,
      lessons_in_cycle: newCount,
      highest_milestone: newHighest,
      total_frequency_bonus: roundMoney(prevTotalBonus + cycleBonusEarned),
      updated_at: now,
    },
    { onConflict: "teacher_id,student_id" }
  );
  if (bonusUpsertError) throw new Error(bonusUpsertError.message);

  const loyalty = await ensureLoyaltyPeriod(db, opts.teacherId);
  const newLoyaltyLessons = Number(loyalty.lessons_completed) + 1;
  const newLoyaltyBonus = loyaltyBonusForLessons(newLoyaltyLessons);

  const { error: loyaltyError } = await db
    .from("teacher_loyalty_periods")
    .update({
      lessons_completed: newLoyaltyLessons,
      bonus_per_hour: newLoyaltyBonus,
      updated_at: now,
    })
    .eq("id", loyalty.id);
  if (loyaltyError) throw new Error(loyaltyError.message);

  if (frequencyBonusesTotal > 0) {
    const { data: stats } = await db
      .from("teacher_stats")
      .select("pending_earnings, earnings_mtd")
      .eq("teacher_id", opts.teacherId)
      .maybeSingle();

    if (stats) {
      await db
        .from("teacher_stats")
        .update({
          pending_earnings: roundMoney(Number(stats.pending_earnings ?? 0) + frequencyBonusesTotal),
          earnings_mtd: roundMoney(Number(stats.earnings_mtd ?? 0) + frequencyBonusesTotal),
          updated_at: now,
        })
        .eq("teacher_id", opts.teacherId);
    }
  }

  return { frequencyBonuses: frequencyBonusesTotal, loyaltyBonusPerHour: newLoyaltyBonus };
}

export async function fetchTeacherBonusOverview(
  db: SupabaseClient,
  teacherId: string
): Promise<{
  loyalty: { lessonsCompleted: number; bonusPerHour: number; periodEnd: string; nextTarget: number | null };
  students: Array<{
    studentId: string;
    studentName: string;
    progress: FrequencyProgress;
  }>;
}> {
  const [bonusRows, studentsRes, loyalty] = await Promise.all([
    db
      .from("teacher_student_bonus")
      .select("student_id, lessons_in_cycle, highest_milestone, total_frequency_bonus")
      .eq("teacher_id", teacherId),
    db
      .from("teacher_student_assignments")
      .select("student_id, student:profiles!teacher_student_assignments_student_id_fkey(id, full_name)")
      .eq("teacher_id", teacherId)
      .eq("status", "active"),
    ensureLoyaltyPeriod(db, teacherId),
  ]);

  const studentNameById = new Map<string, string>();
  for (const row of studentsRes.data ?? []) {
    const r = row as { student_id: string; student: { full_name?: string } | { full_name?: string }[] };
    const st = Array.isArray(r.student) ? r.student[0] : r.student;
    studentNameById.set(r.student_id, st?.full_name?.trim() || "Student");
  }

  const bonusByStudent = new Map(
    (bonusRows.data ?? []).map((r) => [
      (r as BonusRow).student_id,
      r as BonusRow,
    ])
  );

  const students = [...studentNameById.entries()].map(([studentId, studentName]) => {
    const b = bonusByStudent.get(studentId);
    const lessonsInCycle = Number(b?.lessons_in_cycle ?? 0);
    const highest = Number(b?.highest_milestone ?? 0);
    const totalBonus = Number(b?.total_frequency_bonus ?? 0);
    return {
      studentId,
      studentName,
      progress: buildFrequencyProgress(lessonsInCycle, totalBonus, highest),
    };
  });

  const loyaltyLessons = Number(loyalty.lessons_completed);
  const nextLoyalty = LOYALTY_MILESTONES.find((m) => m.lessons > loyaltyLessons);

  return {
    loyalty: {
      lessonsCompleted: loyaltyLessons,
      bonusPerHour: Number(loyalty.bonus_per_hour),
      periodEnd: loyalty.period_end,
      nextTarget: nextLoyalty?.lessons ?? null,
    },
    students: students.sort((a, b) => a.studentName.localeCompare(b.studentName)),
  };
}
