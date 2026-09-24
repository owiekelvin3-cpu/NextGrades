import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";

export type SubjectProgressPayload = {
  subjectName: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  materialsCount: number;
  quizAverage: number | null;
  quizCount: number;
};

/** Per-subject progress breakdown for the student progress page. */
export async function GET() {
  try {
    const supabase = await createClient();
    const { profile, error } = await getAuthProfile(supabase);
    if (!profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["student"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const studentId = profile.id;

    const [enrollmentsRes, lessonsRes, materialsRes, attemptsRes] = await Promise.all([
      supabase
        .from("enrollments")
        .select("subject_id, subjects(name)")
        .eq("student_id", studentId)
        .in("status", ["active", "completed"]),
      supabase
        .from("lessons")
        .select("subject_id, status, subjects(name)")
        .eq("student_id", studentId)
        .neq("status", "cancelled"),
      supabase
        .from("material_grants")
        .select("material:uploaded_materials(subject_id, subjects(name))")
        .eq("student_id", studentId)
        .eq("status", "active"),
      supabase
        .from("quiz_attempts")
        .select("score_percent, teacher_score_percent, completed_at, generated_quizzes(subject_id, subjects(name))")
        .eq("student_id", studentId)
        .not("completed_at", "is", null),
    ]);

    if (enrollmentsRes.error) throw enrollmentsRes.error;
    if (lessonsRes.error) throw lessonsRes.error;
    if (materialsRes.error) throw materialsRes.error;
    if (attemptsRes.error) throw attemptsRes.error;

    const subjectNames = new Map<string, string>();
    for (const e of enrollmentsRes.data ?? []) {
      const row = e as { subject_id: string; subjects: { name: string } | { name: string }[] | null };
      const embed = row.subjects;
      const name = Array.isArray(embed) ? embed[0]?.name : embed?.name;
      if (name) subjectNames.set(row.subject_id, name);
    }

    type SubjectBucket = {
      completedLessons: number;
      totalLessons: number;
      materialsCount: number;
      quizScores: number[];
    };

    const buckets = new Map<string, SubjectBucket>();

    const ensure = (subjectId: string, subjectName: string) => {
      if (!subjectNames.has(subjectId)) subjectNames.set(subjectId, subjectName);
      if (!buckets.has(subjectId)) {
        buckets.set(subjectId, {
          completedLessons: 0,
          totalLessons: 0,
          materialsCount: 0,
          quizScores: [],
        });
      }
      return buckets.get(subjectId)!;
    };

    for (const l of lessonsRes.data ?? []) {
      const row = l as {
        subject_id: string | null;
        status: string;
        subjects: { name: string } | { name: string }[] | null;
      };
      if (!row.subject_id) continue;
      const embed = row.subjects;
      const name = Array.isArray(embed) ? embed[0]?.name : embed?.name;
      if (!name) continue;
      const bucket = ensure(row.subject_id, name);
      bucket.totalLessons += 1;
      if (row.status === "completed") bucket.completedLessons += 1;
    }

    for (const m of materialsRes.data ?? []) {
      const row = m as unknown as {
        material: {
          subject_id: string | null;
          subjects: { name: string } | { name: string }[] | null;
        } | {
          subject_id: string | null;
          subjects: { name: string } | { name: string }[] | null;
        }[] | null;
      };
      const matRaw = row.material;
      const mat = Array.isArray(matRaw) ? matRaw[0] : matRaw;
      if (!mat?.subject_id) continue;
      const embed = mat.subjects;
      const name = Array.isArray(embed) ? embed[0]?.name : embed?.name;
      if (!name) continue;
      ensure(mat.subject_id, name).materialsCount += 1;
    }

    for (const a of attemptsRes.data ?? []) {
      const row = a as unknown as {
        score_percent: number | null;
        teacher_score_percent: number | null;
        generated_quizzes: {
          subject_id: string | null;
          subjects: { name: string } | { name: string }[] | null;
        } | {
          subject_id: string | null;
          subjects: { name: string } | { name: string }[] | null;
        }[] | null;
      };
      const quizRaw = row.generated_quizzes;
      const quiz = Array.isArray(quizRaw) ? quizRaw[0] : quizRaw;
      if (!quiz?.subject_id) continue;
      const embed = quiz.subjects;
      const name = Array.isArray(embed) ? embed[0]?.name : embed?.name;
      if (!name) continue;
      const score = row.teacher_score_percent ?? row.score_percent;
      if (score == null) continue;
      ensure(quiz.subject_id, name).quizScores.push(Number(score));
    }

    const subjects: SubjectProgressPayload[] = [...subjectNames.entries()].map(
      ([subjectId, subjectName]) => {
        const bucket = buckets.get(subjectId) ?? {
          completedLessons: 0,
          totalLessons: 0,
          materialsCount: 0,
          quizScores: [],
        };
        const lessonPct =
          bucket.totalLessons > 0
            ? Math.round((bucket.completedLessons / bucket.totalLessons) * 100)
            : 0;
        const quizAvg =
          bucket.quizScores.length > 0
            ? Math.round(
                bucket.quizScores.reduce((s, v) => s + v, 0) / bucket.quizScores.length
              )
            : null;
        const progressPercent =
          quizAvg != null
            ? Math.round((lessonPct + quizAvg) / 2)
            : lessonPct;

        return {
          subjectName,
          progressPercent,
          completedLessons: bucket.completedLessons,
          totalLessons: bucket.totalLessons,
          materialsCount: bucket.materialsCount,
          quizAverage: quizAvg,
          quizCount: bucket.quizScores.length,
        };
      }
    );

    subjects.sort((a, b) => a.subjectName.localeCompare(b.subjectName, "de"));

    return NextResponse.json({ subjects });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load progress";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
