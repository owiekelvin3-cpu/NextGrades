import { NextResponse } from "next/server";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { isStudentAssignedToTeacher } from "@/lib/teachers/assignments";

type RouteParams = { params: Promise<{ id: string }> };

/** Latest internal note for an assigned student (teacher portal). */
export async function GET(_request: Request, { params }: RouteParams) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const { id: studentId } = await params;
  if (!studentId) {
    return NextResponse.json({ error: "Student id is required." }, { status: 400 });
  }

  const teacherId = gate.auth!.profile!.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;

  try {
    const assigned = await isStudentAssignedToTeacher(db, teacherId, studentId);
    if (!assigned) {
      return NextResponse.json({ error: "Student is not assigned to you." }, { status: 403 });
    }

    const { data, error } = await db
      .from("teacher_student_notes")
      .select("id, body, updated_at")
      .eq("teacher_id", teacherId)
      .eq("student_id", studentId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      noteId: (data?.id as string | undefined) ?? null,
      body: (data?.body as string | undefined)?.trim() || null,
      updatedAt: (data?.updated_at as string | undefined) ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load notes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type Body = { body?: string };

/** Upsert internal note for teacher + assigned student. */
export async function POST(request: Request, { params }: RouteParams) {
  const gate = await requireTeacherOrAdminApi();
  if (gate.error) return gate.error;

  const { id: studentId } = await params;
  if (!studentId) {
    return NextResponse.json({ error: "Student id is required." }, { status: 400 });
  }

  const payload = (await request.json().catch(() => ({}))) as Body;
  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  if (!body) {
    return NextResponse.json({ error: "Note body is required." }, { status: 400 });
  }

  const teacherId = gate.auth!.profile!.id;
  const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
  const now = new Date().toISOString();

  try {
    const assigned = await isStudentAssignedToTeacher(db, teacherId, studentId);
    if (!assigned) {
      return NextResponse.json({ error: "Student is not assigned to you." }, { status: 403 });
    }

    const { data: existing, error: findError } = await db
      .from("teacher_student_notes")
      .select("id")
      .eq("teacher_id", teacherId)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (existing?.id) {
      const { data, error } = await db
        .from("teacher_student_notes")
        .update({ body, updated_at: now })
        .eq("id", existing.id as string)
        .select("id, body, updated_at")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        noteId: data.id as string,
        body: data.body as string,
        updatedAt: data.updated_at as string,
      });
    }

    const { data, error } = await db
      .from("teacher_student_notes")
      .insert({ teacher_id: teacherId, student_id: studentId, body })
      .select("id, body, updated_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      noteId: data.id as string,
      body: data.body as string,
      updatedAt: data.updated_at as string,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save notes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
