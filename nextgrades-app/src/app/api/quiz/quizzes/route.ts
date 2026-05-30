import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile } from "@/lib/quiz/auth";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { profile, error } = await getAuthProfile(supabase);
    if (!profile) return NextResponse.json({ error }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";

    if (profile.role === "student") {
      const { data, error: dbError } = await supabase
        .from("generated_quizzes")
        .select("id, title, description, difficulty, time_limit_minutes, topic, created_at, quiz_questions(count)")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (dbError) throw dbError;
      return NextResponse.json(data || []);
    }

    let query = supabase
      .from("generated_quizzes")
      .select("*, quiz_questions(count), uploaded_materials(title)")
      .order("created_at", { ascending: false });

    if (profile.role === "teacher") {
      query = query.eq("created_by", profile.id);
    }
    if (publishedOnly) {
      query = query.eq("is_published", true);
    }

    const { data, error: dbError } = await query;
    if (dbError) throw dbError;

    return NextResponse.json(data || []);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load quizzes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
