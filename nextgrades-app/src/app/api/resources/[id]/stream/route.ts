import { NextResponse } from "next/server";
import { getApiAuth } from "@/lib/auth/api-auth";
import { createAdminClient, createServerReadClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import {
  canAccessMaterial,
  loadAccessContext,
  resolveMaterialDownloadUrl,
  type MaterialAccessRow,
} from "@/lib/resources/access";
import { EXT_TO_MIME, extensionFromName } from "@/lib/storage/config";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

function resolveStreamMime(fileName?: string | null, mimeType?: string | null): string {
  const normalized = (mimeType || "").toLowerCase().split(";")[0]?.trim();
  if (normalized && !normalized.includes("octet-stream")) return normalized;
  const ext = extensionFromName(fileName || "");
  return EXT_TO_MIME[ext] || "application/octet-stream";
}

/** Same-origin stream proxy with Range support for in-browser video playback. */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { user, profile, supabase } = await getApiAuth();
    const db = await createServerReadClient(supabase);

    const { data: material, error } = await db
      .from("materials")
      .select(
        "id, url, storage_path, file_name, access_type, is_premium, subject_id, class_id, semester, created_by, status, moderation_status"
      )
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
      return NextResponse.json({ error: "Stream service unavailable" }, { status: 503 });
    }

    const { data: primaryFile } = await db
      .from("resource_files")
      .select("mime_type")
      .eq("resource_id", id)
      .eq("kind", "primary")
      .maybeSingle();

    const admin = createAdminClient();
    const signedUrl = await resolveMaterialDownloadUrl(admin, material as MaterialAccessRow);
    if (!signedUrl) {
      return NextResponse.json({ error: "File not available" }, { status: 404 });
    }

    const range = request.headers.get("range");
    const upstream = await fetch(signedUrl, {
      headers: range ? { Range: range } : undefined,
    });

    if (!upstream.ok && upstream.status !== 206) {
      console.error("[resources/stream]", id, upstream.status, upstream.statusText);
      return NextResponse.json({ error: "Failed to load media" }, { status: 502 });
    }

    const headers = new Headers();
    headers.set("Content-Type", resolveStreamMime(material.file_name, primaryFile?.mime_type as string | null));
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "private, max-age=300");

    const contentLength = upstream.headers.get("content-length");
    const contentRange = upstream.headers.get("content-range");
    if (contentLength) headers.set("Content-Length", contentLength);
    if (contentRange) headers.set("Content-Range", contentRange);

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to stream resource";
    console.error("[resources/stream]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
