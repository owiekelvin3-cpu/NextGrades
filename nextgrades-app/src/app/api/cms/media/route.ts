import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import {
  ALLOWED_THUMBNAIL_MIME_TYPES,
  MAX_THUMBNAIL_BYTES,
  THUMBNAILS_BUCKET,
  resolveUploadMimeType,
  storageErrorHint,
} from "@/lib/storage/config";

const CMS_PREFIX = "cms";

function getStorageClient(gate: NonNullable<Awaited<ReturnType<typeof requireAdminApi>>["auth"]>) {
  if (isSupabaseServiceRoleConfigured()) {
    return createAdminClient();
  }
  return gate.supabase;
}

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase();
  const type = searchParams.get("type");

  try {
    const db = getStorageClient(gate.auth!);
    let query = db.from("cms_media").select("*").order("created_at", { ascending: false }).limit(200);

    if (type) query = query.eq("file_type", type);

    const { data, error } = await query;
    if (error) throw error;

    let items = data ?? [];
    if (q) {
      items = items.filter(
        (m) => m.file_name?.toLowerCase().includes(q) || m.url?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(items);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

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

    const ext = extensionFromName(file.name) || "jpg";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.[^.]+$/, "").slice(0, 80);
    const path = `${CMS_PREFIX}/${Date.now()}-${safeName}.${ext}`;

    const storage = getStorageClient(gate.auth!);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await storage.storage
      .from(THUMBNAILS_BUCKET)
      .upload(path, buffer, { contentType: mime, upsert: false, cacheControl: "31536000" });

    if (uploadError) {
      const hint = storageErrorHint(uploadError.message);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}${hint}` },
        { status: 500 }
      );
    }

    const { data: urlData } = storage.storage.from(THUMBNAILS_BUCKET).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const { data: mediaRow, error: dbError } = await storage
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

    if (dbError) {
      return NextResponse.json(
        {
          error: `Image uploaded but catalog save failed: ${dbError.message}. URL: ${publicUrl}`,
          url: publicUrl,
        },
        { status: 207 }
      );
    }

    return NextResponse.json({ url: publicUrl, media: mediaRow });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: `${message}${storageErrorHint(message)}` }, { status: 500 });
  }
}

function extensionFromName(name: string): string {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? (parts.pop() ?? "") : "";
}

export async function DELETE(request: Request) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const storage = getStorageClient(gate.auth!);
    const { data: row, error: fetchErr } = await storage
      .from("cms_media")
      .select("file_path")
      .eq("id", id)
      .single();

    if (fetchErr || !row) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (row.file_path) {
      await storage.storage.from(THUMBNAILS_BUCKET).remove([row.file_path]);
    }

    const { error } = await storage.from("cms_media").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
