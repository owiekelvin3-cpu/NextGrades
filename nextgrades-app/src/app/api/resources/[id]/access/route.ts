import { NextResponse } from "next/server";
import { getApiAuth } from "@/lib/auth/api-auth";
import { createAdminClient, createServerReadClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import {
  canAccessMaterial,
  loadAccessContext,
  resolveMaterialDownloadUrl,
  type MaterialAccessRow,
} from "@/lib/resources/access";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, profile, supabase } = await getApiAuth();
    const db = await createServerReadClient(supabase);

    const { data: material, error } = await db
      .from("materials")
      .select("id, url, storage_path, access_type, is_premium, subject_id, class_id, semester, created_by, status, moderation_status")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!material || material.status !== "published" || material.moderation_status !== "approved") {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const ctx = await loadAccessContext(db, user?.id ?? null, profile?.role ?? null);

    if (!canAccessMaterial(material as MaterialAccessRow, ctx)) {
      if (!user) {
        return NextResponse.json({ error: "Sign in to access this resource", code: "auth_required" }, { status: 401 });
      }
      return NextResponse.json(
        { error: "Premium membership or course enrollment required", code: "entitlement_required" },
        { status: 403 }
      );
    }

    if (!isSupabaseServiceRoleConfigured()) {
      const row = material as MaterialAccessRow;
      if (row.url?.startsWith("http")) {
        return NextResponse.json({ url: row.url });
      }
      return NextResponse.json({ error: "Download service unavailable" }, { status: 503 });
    }

    const admin = createAdminClient();
    const url = await resolveMaterialDownloadUrl(admin, material as MaterialAccessRow);
    if (!url) {
      return NextResponse.json({ error: "File not available" }, { status: 404 });
    }

    return NextResponse.json({ url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to resolve access";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
