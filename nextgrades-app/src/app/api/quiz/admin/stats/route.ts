import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";

export async function GET() {
  try {
    const supabase = await createClient();
    const { profile, error } = await getAuthProfile(supabase);
    if (!profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [materials, quizzes, attempts, jobs, scores] = await Promise.all([
      supabase.from("uploaded_materials").select("*", { count: "exact", head: true }),
      supabase.from("generated_quizzes").select("*", { count: "exact", head: true }),
      supabase.from("quiz_attempts").select("*", { count: "exact", head: true }),
      supabase
        .from("quiz_generation_jobs")
        .select("id, status, mode, created_at, completed_at, error_message, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("student_scores").select("*", { count: "exact", head: true }),
    ]);

    const { data: recentMaterials } = await supabase
      .from("uploaded_materials")
      .select("id, title, file_type, extraction_status, created_at, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: recentQuizzes } = await supabase
      .from("generated_quizzes")
      .select("id, title, is_published, ai_model, created_at, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(10);

    const completedJobs = (jobs.data || []).filter((j: { status: string }) => j.status === "completed").length;
    const failedJobs = (jobs.data || []).filter((j: { status: string }) => j.status === "failed").length;

    return NextResponse.json({
      counts: {
        materials: materials.count ?? 0,
        quizzes: quizzes.count ?? 0,
        attempts: attempts.count ?? 0,
        studentScores: scores.count ?? 0,
      },
      generation: {
        recentJobs: jobs.data || [],
        completedJobs,
        failedJobs,
        engine: "rule-based-v1",
      },
      recentMaterials: recentMaterials || [],
      recentQuizzes: recentQuizzes || [],
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
