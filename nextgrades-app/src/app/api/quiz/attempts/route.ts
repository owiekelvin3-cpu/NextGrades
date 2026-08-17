import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";
import { quizDataClient } from "@/lib/quiz/db";

export async function GET() {
  try {
    const supabase = await createClient();
    const { profile, error } = await getAuthProfile(supabase);
    if (!profile) return NextResponse.json({ error }, { status: 401 });
    const db = quizDataClient(supabase);

    let query = db
      .from("quiz_attempts")
      .select("*, generated_quizzes(id, title, difficulty)")
      .order("created_at", { ascending: false });

    if (profile.role === "student") {
      query = query.eq("student_id", profile.id);
    }

    const { data, error: dbError } = await query;
    if (dbError) throw dbError;

    return NextResponse.json(data || []);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load attempts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, profile, error } = await getAuthProfile(supabase);
    if (!user || !profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["student"])) {
      return NextResponse.json({ error: "Only students can start quiz attempts" }, { status: 403 });
    }
    const db = quizDataClient(supabase);

    const { quizId } = await request.json();
    if (!quizId) {
      return NextResponse.json({ error: "quizId is required" }, { status: 400 });
    }

    const { data: quiz, error: quizError } = await db
      .from("generated_quizzes")
      .select("id, is_published, time_limit_minutes")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz?.is_published) {
      return NextResponse.json({ error: "Quiz not available" }, { status: 404 });
    }

    const { data: attempt, error: attemptError } = await db
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        student_id: user.id,
        answers: [],
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    return NextResponse.json({ attempt, timeLimitMinutes: quiz.time_limit_minutes });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to start attempt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
