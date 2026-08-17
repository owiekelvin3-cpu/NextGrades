import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { isMaterialGrantActive } from "@/lib/resources/access";

const MATERIAL_SELECT =
  "id, title, content_type, type, access_type, is_premium, file_name, status, subject:subjects(id, name), class:classes(id, name, level)";

type GrantBody = {
  studentId?: string;
  materialId?: string;
  expiresAt?: string | null;
};

function serviceUnavailable() {
  return NextResponse.json(
    { error: "Admin service is not configured." },
    { status: 503 }
  );
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
        .from("materials")
        .select(MATERIAL_SELECT)
        .eq("status", "published")
        .order("title", { ascending: true })
        .limit(80);

      if (search) query = query.ilike("title", `%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ materials: data ?? [] });
    }

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required." }, { status: 400 });
    }

    const { data, error } = await admin
      .from("material_grants")
      .select(
        `id, student_id, material_id, granted_at, expires_at, status, granted_by,
         material:materials(${MATERIAL_SELECT})`
      )
      .eq("student_id", studentId)
      .eq("status", "active")
      .order("granted_at", { ascending: false });

    if (error) throw error;

    const grants = (data ?? []).filter((row) =>
      isMaterialGrantActive((row as { expires_at?: string | null }).expires_at)
    );

    return NextResponse.json({ grants });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load grants";
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
  const materialId = body.materialId?.trim();
  const expiresAt = body.expiresAt?.trim() || null;

  if (!studentId || !materialId) {
    return NextResponse.json({ error: "studentId and materialId are required." }, { status: 400 });
  }

  try {
    const [{ data: student }, { data: material }] = await Promise.all([
      admin.from("profiles").select("id, role").eq("id", studentId).maybeSingle(),
      admin.from("materials").select("id").eq("id", materialId).maybeSingle(),
    ]);

    if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    if (student.role !== "student") {
      return NextResponse.json({ error: "Unlocks can only be granted to students." }, { status: 400 });
    }
    if (!material) return NextResponse.json({ error: "Resource not found." }, { status: 404 });

    const { data, error } = await admin
      .from("material_grants")
      .upsert(
        {
          student_id: studentId,
          material_id: materialId,
          granted_by: gate.auth!.user.id,
          granted_at: new Date().toISOString(),
          expires_at: expiresAt,
          status: "active",
        },
        { onConflict: "student_id,material_id" }
      )
      .select("id, student_id, material_id, granted_at, expires_at, status")
      .single();

    if (error) throw error;
    return NextResponse.json({ grant: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to unlock resource";
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
    const { error } = await admin
      .from("material_grants")
      .update({ status: "revoked" })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to revoke access";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
