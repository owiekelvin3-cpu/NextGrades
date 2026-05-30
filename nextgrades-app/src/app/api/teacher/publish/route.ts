import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireTeacherOrAdmin } from "@/lib/auth/auth-utils";
import { LEGACY_TYPE_MAP, DEFAULT_THUMBNAIL, type ContentType } from "@/lib/resources/constants";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 52_428_800; // 50MB
const MAX_THUMB_BYTES = 5_242_880; // 5MB

const OPTIONAL_FILE_TYPES = new Set(["live_class", "webinar", "workshop", "article", "other"]);

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const auth = await requireTeacherOrAdmin(supabase);
    if (!auth.user) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: auth.error === "Forbidden" ? 403 : 401 });
    }

    const formData = await request.formData();
    const title = String(formData.get("title") || "").trim();
    const shortDescription = String(formData.get("short_description") || "").trim();
    const fullDescription = String(formData.get("full_description") || "").trim();
    const contentType = String(formData.get("content_type") || "learning_material") as ContentType;
    const categoryId = formData.get("category_id") ? String(formData.get("category_id")) : null;
    const tagIdsRaw = formData.get("tag_ids");
    const tagIds: string[] = tagIdsRaw ? JSON.parse(String(tagIdsRaw)) : [];
    const difficultyLevel = String(formData.get("difficulty_level") || "beginner");
    const ageRange = String(formData.get("age_range") || "all_ages");
    const estimatedMinutes = formData.get("estimated_minutes")
      ? parseInt(String(formData.get("estimated_minutes")), 10)
      : null;
    const language = String(formData.get("language") || "en");
    const status = String(formData.get("status") || "draft");
    const accessType = String(formData.get("access_type") || "free");
    const price = accessType === "premium" ? parseFloat(String(formData.get("price") || "0")) : 0;
    const externalUrl = String(formData.get("external_url") || "").trim();
    const file = formData.get("file") as File | null;
    const thumbnail = formData.get("thumbnail") as File | null;
    const resourceId = formData.get("resource_id") ? String(formData.get("resource_id")) : null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const fileRequired = !OPTIONAL_FILE_TYPES.has(contentType);
    if (fileRequired && (!file || file.size === 0) && !externalUrl && !resourceId) {
      return NextResponse.json({ error: "Please upload a file or provide a URL" }, { status: 400 });
    }

    if (file && file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File exceeds 50MB limit" }, { status: 400 });
    }
    if (thumbnail && thumbnail.size > MAX_THUMB_BYTES) {
      return NextResponse.json({ error: "Thumbnail exceeds 5MB limit" }, { status: 400 });
    }

    const dupQuery = supabase
      .from("materials")
      .select("id")
      .eq("created_by", auth.user.id)
      .ilike("title", title)
      .neq("status", "archived");

    if (resourceId) dupQuery.neq("id", resourceId);

    const { data: duplicate } = await dupQuery.maybeSingle();

    if (duplicate && !resourceId) {
      return NextResponse.json(
        { error: "You already have a resource with this title. Choose a different title or edit the existing resource." },
        { status: 409 }
      );
    }

    let fileUrl = externalUrl || "";
    let storagePath: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;
    let mimeType: string | null = null;

    if (file && file.size > 0) {
      fileName = file.name;
      fileSize = file.size;
      mimeType = file.type || "application/octet-stream";
      storagePath = `${auth.user.id}/${Date.now()}-${sanitizeName(file.name)}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("resources")
        .upload(storagePath, buffer, { contentType: mimeType, upsert: false });

      if (uploadError) {
        return NextResponse.json({ error: `File upload failed: ${uploadError.message}` }, { status: 500 });
      }

      const { data: urlData } = supabase.storage.from("resources").getPublicUrl(storagePath);
      fileUrl = urlData.publicUrl;
    }

    let thumbnailUrl: string | null = null;
    if (thumbnail && thumbnail.size > 0) {
      const thumbPath = `${auth.user.id}/${Date.now()}-thumb-${sanitizeName(thumbnail.name)}`;
      const thumbBuffer = Buffer.from(await thumbnail.arrayBuffer());
      const { error: thumbError } = await supabase.storage
        .from("resource-thumbnails")
        .upload(thumbPath, thumbBuffer, {
          contentType: thumbnail.type || "image/jpeg",
          upsert: false,
        });

      if (thumbError) {
        return NextResponse.json({ error: `Thumbnail upload failed: ${thumbError.message}` }, { status: 500 });
      }

      const { data: thumbUrlData } = supabase.storage.from("resource-thumbnails").getPublicUrl(thumbPath);
      thumbnailUrl = thumbUrlData.publicUrl;
    }

    const legacyType = LEGACY_TYPE_MAP[contentType] || "other";
    const isPublished = status === "published";
    const payload = {
      title,
      description: shortDescription || fullDescription || null,
      short_description: shortDescription || null,
      full_description: fullDescription || null,
      content_type: contentType,
      type: legacyType,
      url: fileUrl,
      thumbnail_url: thumbnailUrl || DEFAULT_THUMBNAIL,
      file_size: fileSize,
      file_name: fileName,
      storage_path: storagePath,
      category_id: categoryId,
      difficulty_level: difficultyLevel,
      age_range: ageRange,
      estimated_minutes: estimatedMinutes,
      language,
      status,
      access_type: accessType,
      price,
      is_premium: accessType === "premium",
      created_by: auth.user.id,
      moderation_status: isPublished ? "approved" : "pending",
      publish_date: isPublished ? new Date().toISOString() : null,
    };

    let resource;
    if (resourceId) {
      const { data: existing } = await supabase
        .from("materials")
        .select("created_by, thumbnail_url, url, storage_path")
        .eq("id", resourceId)
        .single();

      if (!existing || (existing.created_by !== auth.user.id && auth.profile?.role !== "admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const updatePayload: Record<string, unknown> = { ...payload };
      if (!thumbnailUrl) updatePayload.thumbnail_url = existing.thumbnail_url;
      if (!fileUrl || fileUrl === DEFAULT_THUMBNAIL) {
        updatePayload.url = existing.url;
        updatePayload.storage_path = existing.storage_path;
        updatePayload.file_name = fileName ?? undefined;
      }

      const { data, error } = await supabase
        .from("materials")
        .update(updatePayload)
        .eq("id", resourceId)
        .select()
        .single();

      if (error) throw error;
      resource = data;
    } else {
      const { data, error } = await supabase.from("materials").insert(payload).select().single();
      if (error) throw error;
      resource = data;
    }

    if (storagePath && fileName) {
      await supabase.from("resource_files").insert({
        resource_id: resource.id,
        file_name: fileName,
        storage_path: storagePath,
        mime_type: mimeType,
        file_size: fileSize,
        kind: "primary",
      });
    }

    if (tagIds.length > 0) {
      await supabase.from("resource_tag_relations").delete().eq("resource_id", resource.id);
      await supabase.from("resource_tag_relations").insert(
        tagIds.map((tagId) => ({ resource_id: resource.id, tag_id: tagId }))
      );
    }

    return NextResponse.json(resource, { status: resourceId ? 200 : 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to publish resource";
    console.error("Publish error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
