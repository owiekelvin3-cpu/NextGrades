import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import {
  endTeacherAssignment,
  updateTeacherAssignment,
  type AssignmentStatus,
} from "@/lib/teachers/assignments";

type RouteParams = { params: Promise<{ id: string }> };

type PatchBody = {
  status?: AssignmentStatus;
  subjectId?: string | null;
  classId?: string | null;
  notes?: string | null;
};

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Admin service is not configured." },
    { status: 503 }
  );
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as PatchBody;
  if (body.status && !["active", "paused", "ended"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    const assignment = await updateTeacherAssignment(admin, id, {
      status: body.status,
      subjectId: body.subjectId,
      classId: body.classId,
      notes: body.notes,
    });
    return NextResponse.json({ assignment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update assignment";
    const status = message.toLowerCase().includes("no rows") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;
  if (!isSupabaseServiceRoleConfigured()) return serviceUnavailable();

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const admin = createAdminClient();

  try {
    const assignment = await endTeacherAssignment(admin, id);
    return NextResponse.json({ assignment, ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to end assignment";
    const status = message.toLowerCase().includes("no rows") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
