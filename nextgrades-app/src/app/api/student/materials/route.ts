import { NextResponse } from "next/server";
import { requireAuthenticatedApi } from "@/lib/auth/api-auth";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import {
  isAssignedStudentMaterial,
  loadAccessContext,
  sanitizePublicMaterial,
  type MaterialAccessRow,
} from "@/lib/resources/access";

const MATERIAL_SELECT = `
  id,
  title,
  description,
  type,
  content_type,
  url,
  storage_path,
  thumbnail_url,
  file_size,
  file_name,
  is_premium,
  access_type,
  subject_id,
  class_id,
  class_ids,
  semester,
  created_by,
  created_at,
  subject:subjects(id, name),
  class:classes(id, name, level)
`;

function subjectName(row: { subject?: { name?: string } | { name?: string }[] | null }): string | null {
  const subject = row.subject;
  if (!subject) return null;
  return Array.isArray(subject) ? subject[0]?.name ?? null : subject.name ?? null;
}

export async function GET(request: Request) {
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;

  const { user, profile, supabase } = gate.auth;
  if (profile.role !== "student" && profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "100", 10)));

  try {
    const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : supabase;
    const ctx = await loadAccessContext(db, user.id, profile.role);

    const { data, error } = await db
      .from("materials")
      .select(MATERIAL_SELECT)
      .eq("status", "published")
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const materials = (data ?? [])
      .filter((row) => isAssignedStudentMaterial(row as MaterialAccessRow, ctx))
      .map((row) => {
        const sanitized = sanitizePublicMaterial(
          row as MaterialAccessRow & Record<string, unknown>,
          ctx
        );
        return {
          ...sanitized,
          subject_name: subjectName(row as { subject?: { name?: string } | { name?: string }[] | null }),
          class_name: (() => {
            const cls = (row as { class?: { name?: string } | { name?: string }[] | null }).class;
            if (!cls) return null;
            return Array.isArray(cls) ? cls[0]?.name ?? null : cls.name ?? null;
          })(),
          content_type: (row as { content_type?: string | null }).content_type ?? null,
          semester: (row as { semester?: number | null }).semester ?? null,
        };
      });

    return NextResponse.json({ materials });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load materials";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
