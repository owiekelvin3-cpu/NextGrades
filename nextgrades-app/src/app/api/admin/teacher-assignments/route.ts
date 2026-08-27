import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import {
  createTeacherAssignment,
  listAdminAssignments,
  type AssignmentStatus,
} from "@/lib/teachers/assignments";

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Admin service is not configured." },
    { status: 503 }
  );
}

type CreateBody = {
  teacherId?: string;
  studentId?: string;
  subjectId?: string | null;
  classId?: string | null;
  notes?: string | null;
  status?: AssignmentStatus;
};

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const admin = createAdminClient();
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId")?.trim() || undefined;
  const studentId = searchParams.get("studentId")?.trim() || undefined;
  const statusParam = searchParams.get("status")?.trim();
  const status = statusParam
    ? (statusParam.split(",").map((s) => s.trim()) as AssignmentStatus[])
    : undefined;

  try {
    const assignments = await listAdminAssignments(admin, {
      teacherId,
      studentId,
      status,
    });
    return NextResponse.json({ assignments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load assignments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const admin = createAdminClient();
  const body = (await request.json().catch(() => ({}))) as CreateBody;
  const teacherId = body.teacherId?.trim();
  const studentId = body.studentId?.trim();

  if (!teacherId || !studentId) {
    return NextResponse.json(
      { error: "teacherId and studentId are required." },
      { status: 400 }
    );
  }

  try {
    const [{ data: teacher }, { data: student }] = await Promise.all([
      admin.from("profiles").select("id, role").eq("id", teacherId).maybeSingle(),
      admin.from("profiles").select("id, role").eq("id", studentId).maybeSingle(),
    ]);

    if (!teacher || teacher.role !== "teacher") {
      return NextResponse.json({ error: "Teacher not found." }, { status: 404 });
    }
    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    if (body.status && !["active", "paused", "ended"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const assignment = await createTeacherAssignment(admin, {
      teacherId,
      studentId,
      subjectId: body.subjectId ?? null,
      classId: body.classId ?? null,
      notes: body.notes ?? null,
      status: body.status ?? "active",
      assignedBy: gate.auth!.user.id,
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create assignment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
