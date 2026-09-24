import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { isStudentAssignedToTeacher } from "@/lib/teachers/assignments";
import { isQuizGrantActive } from "@/lib/quiz/access";

type GrantBody = {
  studentId?: string;
  studentIds?: string[];
  groupId?: string;
  quizId?: string;
  dueDate?: string | null;
  expiresAt?: string | null;
};

async function verifyTeacherOwnsQuiz(
  db: ReturnType<typeof createAdminClient>,
  teacherId: string,
  quizId: string
): Promise<boolean> {
  const { data } = await db
    .from("generated_quizzes")
    .select("id, created_by, is_published")
    .eq("id", quizId)
    .maybeSingle();
  return Boolean(data?.created_by === teacherId);
}

export async function GET(request: Request) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const teacherId = gate.auth!.profile!.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
  const { searchParams } = new URL(request.url);
  const quizId = (searchParams.get("quizId") || "").trim();

  try {
    if (quizId) {
      const { data, error } = await db
        .from("quiz_grants")
        .select(
          `id, student_id, quiz_id, granted_at, expires_at, due_date, status,
           student:profiles!quiz_grants_student_id_fkey(id, full_name, email)`
        )
        .eq("quiz_id", quizId)
        .eq("status", "active");
      if (error) throw error;
      const grants = (data ?? []).filter((g) =>
        isQuizGrantActive((g as { expires_at?: string | null }).expires_at)
      );
      return NextResponse.json({ grants });
    }

    const { data: quizzes } = await db
      .from("generated_quizzes")
      .select("id, title, is_published, created_at")
      .eq("created_by", teacherId)
      .order("created_at", { ascending: false });

    return NextResponse.json({ quizzes: quizzes ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load quiz grants";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Service not configured." }, { status: 503 });
  }

  const teacherId = gate.auth!.profile!.id;
  const admin = createAdminClient();
  const body = (await request.json().catch(() => ({}))) as GrantBody;
  const quizId = body.quizId?.trim();
  const dueDate = body.dueDate?.trim() || null;
  const expiresAt = body.expiresAt?.trim() || dueDate;

  if (!quizId) {
    return NextResponse.json({ error: "quizId is required." }, { status: 400 });
  }

  const ownsQuiz = await verifyTeacherOwnsQuiz(admin, teacherId, quizId);
  if (!ownsQuiz && gate.auth!.profile!.role !== "admin") {
    return NextResponse.json({ error: "You can only assign quizzes you created." }, { status: 403 });
  }

  const { data: quiz } = await admin
    .from("generated_quizzes")
    .select("id, is_published")
    .eq("id", quizId)
    .maybeSingle();
  if (!quiz?.is_published) {
    return NextResponse.json({ error: "Quiz must be published before assigning." }, { status: 400 });
  }

  let studentIds: string[] = body.studentIds?.filter(Boolean) ?? [];
  if (body.studentId?.trim()) studentIds.push(body.studentId.trim());
  studentIds = [...new Set(studentIds)];

  if (body.groupId?.trim()) {
    const { data: members } = await admin
      .from("tutoring_group_members")
      .select("student_id, group:tutoring_groups!inner(teacher_id)")
      .eq("group_id", body.groupId.trim());
    for (const m of members ?? []) {
      const row = m as { student_id: string; group: { teacher_id: string } | { teacher_id: string }[] };
      const grp = Array.isArray(row.group) ? row.group[0] : row.group;
      if (grp?.teacher_id === teacherId) {
        studentIds.push(row.student_id);
      }
    }
    studentIds = [...new Set(studentIds)];
  }

  if (!studentIds.length) {
    return NextResponse.json({ error: "No students to assign." }, { status: 400 });
  }

  try {
    const grants = [];
    for (const studentId of studentIds) {
      const assigned = await isStudentAssignedToTeacher(admin, teacherId, studentId);
      if (!assigned && gate.auth!.profile!.role !== "admin") continue;

      const { data, error } = await admin
        .from("quiz_grants")
        .upsert(
          {
            student_id: studentId,
            quiz_id: quizId,
            granted_by: gate.auth!.user.id,
            granted_at: new Date().toISOString(),
            expires_at: expiresAt,
            due_date: dueDate,
            status: "active",
          },
          { onConflict: "student_id,quiz_id" }
        )
        .select("id, student_id, quiz_id, due_date, expires_at")
        .single();
      if (error) throw error;
      grants.push(data);
    }

    return NextResponse.json({ grants, assigned: grants.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to assign quiz";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
