import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { isQuizGrantActive } from "@/lib/quiz/access";

const QUIZ_SELECT = "id, title, topic, difficulty, is_published, created_at";

type GrantBody = {
  studentId?: string;
  quizId?: string;
  expiresAt?: string | null;
};

function serviceUnavailable() {
  return NextResponse.json({ error: "Admin service is not configured." }, { status: 503 });
}

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const catalog = searchParams.get("catalog") === "1";
  const search = (searchParams.get("search") || "").trim();
  const studentId = (searchParams.get("studentId") || "").trim();

  try {
    if (catalog) {
      let query = admin
        .from("generated_quizzes")
        .select(QUIZ_SELECT)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(80);

      if (search) query = query.or(`title.ilike.%${search}%,topic.ilike.%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ quizzes: data ?? [] });
    }

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required." }, { status: 400 });
    }

    const { data, error } = await admin
      .from("quiz_grants")
      .select(
        `id, student_id, quiz_id, granted_at, expires_at, status, granted_by,
         quiz:generated_quizzes(${QUIZ_SELECT})`
      )
      .eq("student_id", studentId)
      .eq("status", "active")
      .order("granted_at", { ascending: false });

    if (error) throw error;

    const grants = (data ?? []).filter((row) =>
      isQuizGrantActive((row as { expires_at?: string | null }).expires_at)
    );

    return NextResponse.json({ grants });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load quiz grants";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const admin = createAdminClient();
  const body = (await request.json().catch(() => ({}))) as GrantBody;
  const studentId = body.studentId?.trim();
  const quizId = body.quizId?.trim();
  const expiresAt = body.expiresAt?.trim() || null;

  if (!studentId || !quizId) {
    return NextResponse.json({ error: "studentId and quizId are required." }, { status: 400 });
  }

  try {
    const [{ data: student }, { data: quiz }] = await Promise.all([
      admin.from("profiles").select("id, role").eq("id", studentId).maybeSingle(),
      admin.from("generated_quizzes").select("id, is_published").eq("id", quizId).maybeSingle(),
    ]);

    if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    if (student.role !== "student") {
      return NextResponse.json({ error: "Unlocks can only be granted to students." }, { status: 400 });
    }
    if (!quiz) return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
    if (!quiz.is_published) {
      return NextResponse.json(
        { error: "Quiz muss zuerst veröffentlicht (freigabebereit) sein." },
        { status: 400 }
      );
    }

    const { data, error } = await admin
      .from("quiz_grants")
      .upsert(
        {
          student_id: studentId,
          quiz_id: quizId,
          granted_by: gate.auth!.user.id,
          granted_at: new Date().toISOString(),
          expires_at: expiresAt,
          status: "active",
        },
        { onConflict: "student_id,quiz_id" }
      )
      .select("id, student_id, quiz_id, granted_at, expires_at, status")
      .single();

    if (error) throw error;
    return NextResponse.json({ grant: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to unlock quiz";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = (searchParams.get("id") || "").trim();
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  try {
    const { error } = await admin.from("quiz_grants").update({ status: "revoked" }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to revoke quiz access";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
