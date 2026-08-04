import { NextResponse } from "next/server";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { requireTeacherOrAdminApi } from "@/lib/auth/api-auth";
import {
  RESOURCES_BUCKET,
  THUMBNAILS_BUCKET,
  MAX_RESOURCE_FILE_BYTES,
  MAX_THUMBNAIL_BYTES,
  isAllowedResourceMime,
  isAllowedThumbnailMime,
  SERVICE_ROLE_REQUIRED_MESSAGE,
} from "@/lib/storage/config";

export const runtime = "nodejs";

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/** Issue a signed upload URL so teachers can upload directly to Storage (bypasses RLS/size limits on API routes). */
export async function POST(request: Request) {
  try {
    const gate = await requireTeacherOrAdminApi();
    if (gate.error) return gate.error;
    const auth = gate.auth;

    if (!isSupabaseServiceRoleConfigured()) {
      return NextResponse.json({ error: SERVICE_ROLE_REQUIRED_MESSAGE }, { status: 503 });
    }

    const body = await request.json();
    const kind = String(body.kind || "resource");
    const fileName = String(body.file_name || body.fileName || "upload").trim();
    const mimeType = String(body.mime_type || body.mimeType || "application/octet-stream");
    const fileSize = Number(body.file_size ?? body.fileSize ?? 0);

    if (!fileName) {
      return NextResponse.json({ error: "File name is required" }, { status: 400 });
    }

    const isThumbnail = kind === "thumbnail";
    const bucket = isThumbnail ? THUMBNAILS_BUCKET : RESOURCES_BUCKET;
    const maxBytes = isThumbnail ? MAX_THUMBNAIL_BYTES : MAX_RESOURCE_FILE_BYTES;

    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
    }
    if (fileSize > maxBytes) {
      return NextResponse.json(
        { error: isThumbnail ? "Thumbnail exceeds 5MB limit" : "File exceeds 50MB limit" },
        { status: 400 }
      );
    }

    if (isThumbnail) {
      if (!isAllowedThumbnailMime(mimeType)) {
        return NextResponse.json({ error: "Thumbnail must be JPG, PNG, or WebP." }, { status: 400 });
      }
    } else if (!isAllowedResourceMime(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported file type (${mimeType}). Use PDF, video, Word, PowerPoint, Excel, or image files.` },
        { status: 400 }
      );
    }

    const prefix = isThumbnail ? "thumb-" : "";
    const storagePath = `${auth.user.id}/${Date.now()}-${prefix}${sanitizeName(fileName)}`;

    const admin = createAdminClient();
    const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(storagePath);

    if (error || !data?.token) {
      return NextResponse.json({ error: error?.message || "Could not create upload URL" }, { status: 500 });
    }

    let publicUrl: string | null = null;
    if (isThumbnail) {
      const { data: urlData } = admin.storage.from(THUMBNAILS_BUCKET).getPublicUrl(storagePath);
      publicUrl = urlData.publicUrl;
    }

    return NextResponse.json({
      bucket,
      storage_path: storagePath,
      token: data.token,
      signed_url: data.signedUrl ?? null,
      public_url: publicUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to prepare upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
