import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import {
  ALLOWED_THUMBNAIL_MIME_TYPES,
  MAX_THUMBNAIL_BYTES,
  RESOURCES_BUCKET,
  resolveUploadMimeType,
} from "@/lib/storage/config";

const CMS_PREFIX = "cms";

export async function GET() {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  try {
    const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : gate.auth!.supabase;
    const { data, error } = await db
      .from("cms_media")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY required for uploads. Add it to .env.local." },
      { status: 503 }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (file.size > MAX_THUMBNAIL_BYTES) {
      return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
    }

    const mime = resolveUploadMimeType(file);
    if (!(ALLOWED_THUMBNAIL_MIME_TYPES as readonly string[]).includes(mime)) {
      return NextResponse.json({ error: "Use JPG, PNG, or WebP" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    const path = `${CMS_PREFIX}/${Date.now()}-${safeName}.${ext}`;

    const admin = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(RESOURCES_BUCKET)
      .upload(path, buffer, { contentType: mime, upsert: false, cacheControl: "3600" });

    if (uploadError) throw uploadError;

    const { data: urlData } = admin.storage.from(RESOURCES_BUCKET).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const { data: mediaRow, error: dbError } = await admin
      .from("cms_media")
      .insert({
        file_name: file.name,
        file_path: path,
        file_type: "image",
        file_size: file.size,
        url: publicUrl,
        thumbnail_url: publicUrl,
        uploaded_by: gate.auth!.user.id,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ url: publicUrl, media: mediaRow });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
