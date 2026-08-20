import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { profile, error } = await getAuthProfile(supabase);
    if (!profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: job, error: jobError } = await supabase
      .from("quiz_generation_jobs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (jobError) throw jobError;
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    let result = null;
    if (job.status === "completed") {
      if (job.result_quiz_id) {
        const { data } = await supabase
          .from("generated_quizzes")
          .select("*, quiz_questions(*)")
          .eq("id", job.result_quiz_id)
          .single();
        result = { quiz: data };
      } else if (job.result_flashcard_set_id) {
        const { data } = await supabase
          .from("flashcard_sets")
          .select("*, flashcards(*)")
          .eq("id", job.result_flashcard_set_id)
          .single();
        result = { flashcardSet: data };
      }
    }

    return NextResponse.json({ job, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
