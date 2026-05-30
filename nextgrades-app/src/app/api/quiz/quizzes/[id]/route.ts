import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile, requireRole } from "@/lib/quiz/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { profile, error } = await getAuthProfile(supabase);
    if (!profile) return NextResponse.json({ error }, { status: 401 });

    const { data: quiz, error: quizError } = await supabase
      .from("generated_quizzes")
      .select("*, quiz_questions(*)")
      .eq("id", id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (profile.role === "student" && !quiz.is_published) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (profile.role === "teacher" && quiz.created_by !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const questions = (quiz.quiz_questions || []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    );

    const safeForStudent =
      profile.role === "student"
        ? questions.map((q: Record<string, unknown>) => {
            const { correct_answer, explanation, ...rest } = q;
            return rest;
          })
        : questions;

    return NextResponse.json({ ...quiz, quiz_questions: safeForStudent });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load quiz";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { profile, error } = await getAuthProfile(supabase);
    if (!profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["teacher", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { questions, publish, ...quizFields } = body as {
      questions?: Array<{
        id?: string;
        question_type: string;
        question_text: string;
        options?: string[] | null;
        correct_answer: string;
        explanation?: string | null;
        points?: number;
        sort_order?: number;
      }>;
      publish?: boolean;
      title?: string;
      description?: string;
      time_limit_minutes?: number | null;
    };

    const { data: existing } = await supabase
      .from("generated_quizzes")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (profile.role === "teacher" && existing.created_by !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatePayload: Record<string, unknown> = {
      ...quizFields,
      updated_at: new Date().toISOString(),
    };

    if (publish === true) {
      updatePayload.is_published = true;
      updatePayload.status = "published";
      updatePayload.published_at = new Date().toISOString();
    } else if (publish === false) {
      updatePayload.is_published = false;
      updatePayload.status = "draft";
    }

    const { error: updateError } = await supabase.from("generated_quizzes").update(updatePayload).eq("id", id);
    if (updateError) throw updateError;

    if (questions?.length) {
      for (const q of questions) {
        if (q.id) {
          await supabase
            .from("quiz_questions")
            .update({
              question_type: q.question_type,
              question_text: q.question_text,
              options: q.options,
              correct_answer: q.correct_answer,
              explanation: q.explanation,
              points: q.points ?? 1,
              sort_order: q.sort_order,
              updated_at: new Date().toISOString(),
            })
            .eq("id", q.id);
        }
      }
    }

    const { data: full } = await supabase
      .from("generated_quizzes")
      .select("*, quiz_questions(*)")
      .eq("id", id)
      .single();

    return NextResponse.json(full);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { profile, error } = await getAuthProfile(supabase);
    if (!profile) return NextResponse.json({ error }, { status: 401 });
    if (!requireRole(profile, ["teacher", "admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: existing } = await supabase
      .from("generated_quizzes")
      .select("created_by")
      .eq("id", id)
      .single();

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (profile.role === "teacher" && existing.created_by !== profile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error: deleteError } = await supabase.from("generated_quizzes").delete().eq("id", id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
