import { NextResponse } from "next/server";
import { getApiAuth } from "@/lib/auth/api-auth";
import { createServerReadClient } from "@/lib/supabase/admin";
import { loadAccessContext, sanitizePublicMaterial } from "@/lib/resources/access";
import { enrichSubject } from "@/lib/catalog/subjects";
import { isVideoResource } from "@/lib/resources/video";

type RouteParams = { params: Promise<{ id: string }> };

const DETAIL_SELECT = `
  id,
  title,
  description,
  short_description,
  full_description,
  type,
  content_type,
  thumbnail_url,
  access_type,
  is_premium,
  estimated_minutes,
  difficulty_level,
  language,
  semester,
  view_count,
  download_count,
  created_at,
  subject_id,
  class_id,
  created_by,
  status,
  moderation_status,
  subject:subjects(id, name, sort_order),
  class:classes(id, name, level),
  category:resource_categories(id, name, icon),
  author:profiles!materials_created_by_fkey(id, full_name, avatar_url)
`;

const DETAIL_SELECT_FALLBACK = `
  id,
  title,
  description,
  short_description,
  full_description,
  type,
  content_type,
  thumbnail_url,
  access_type,
  is_premium,
  estimated_minutes,
  difficulty_level,
  language,
  semester,
  view_count,
  download_count,
  created_at,
  subject_id,
  class_id,
  created_by,
  status,
  moderation_status,
  subject:subjects(id, name, sort_order),
  class:classes(id, name, level),
  category:resource_categories(id, name, icon)
`;

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, profile, supabase } = await getApiAuth();
    const db = await createServerReadClient(supabase);

    let { data: material, error } = await db
      .from("materials")
      .select(DETAIL_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      const fallback = await db
        .from("materials")
        .select(DETAIL_SELECT_FALLBACK)
        .eq("id", id)
        .maybeSingle();
      material = (fallback.data ?? null) as typeof material;
      error = fallback.error;
    }

    if (error) throw error;
    if (!material || material.status !== "published" || material.moderation_status !== "approved") {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const row = { ...(material as Record<string, unknown>) };
    const subject = row.subject;
    if (subject && typeof subject === "object" && !Array.isArray(subject)) {
      row.subject = enrichSubject(subject as { id: string; name: string; sort_order?: number | null });
    }

    const ctx = await loadAccessContext(db, user?.id ?? null, profile?.role ?? null);
    const sanitized = sanitizePublicMaterial(row as Record<string, unknown> & typeof material, ctx);

    return NextResponse.json({
      ...sanitized,
      isVideo: isVideoResource(material),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load resource";
    console.error("[resources/detail]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
