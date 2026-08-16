import { NextResponse } from "next/server";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { requireLibraryPublishApi } from "@/lib/auth/api-auth";
import { LEGACY_TYPE_MAP, type ContentType } from "@/lib/resources/constants";
import { buildAutoShortDescription } from "@/lib/resources/library-display";
import {
  checkDuplicateTitle,
  optionalUuid,
  resolveClassIds,
  validatePublishInput,
  MAX_FILE_BYTES,
  MAX_THUMB_BYTES,
} from "@/lib/resources/publish-validation";
import {
  RESOURCES_BUCKET,
  THUMBNAILS_BUCKET,
  BUCKET_SETUP_HINT,
  SERVICE_ROLE_REQUIRED_MESSAGE,
  requireTeacherStorageReady,
  isAllowedResourceMime,
  isAllowedThumbnailMime,
  removeFromBucket,
  resolveUploadMimeType,
  storageErrorHint,
  uploadToBucket,
} from "@/lib/resources/storage-upload";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PublishInput = {
  title: string;
  shortDescription: string;
  fullDescription: string;
  contentType: ContentType;
  categoryId: string | null;
  tagIds: string[];
  difficultyLevel: string;
  ageRange: string;
  estimatedMinutes: number | null;
  language: string;
  status: string;
  accessType: string;
  price: number;
  externalUrl: string;
  subjectId: string | null;
  classId: string | null;
  classIds: string[];
  semester: number | null;
  resourceId: string | null;
  storagePath: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  thumbPath: string | null;
  thumbnailUrl: string | null;
  file: File | null;
  thumbnail: File | null;
};

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function parseOptionalInt(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parsePrice(value: unknown, accessType: string): number {
  if (accessType !== "premium") return 0;
  const n = parseFloat(String(value ?? "0"));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function parseTagIds(raw: unknown): string[] {
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) {
    return raw.map((id) => String(id).trim()).filter((id) => UUID_RE.test(id));
  }
  try {
    const parsed = JSON.parse(String(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed.map((id) => String(id).trim()).filter((id) => UUID_RE.test(id));
  } catch {
    return [];
  }
}

function formatDbError(error: { message?: string; code?: string; details?: string; hint?: string }): string {
  const parts = [error.message, error.details, error.hint].filter(Boolean);
  return parts.join(" — ") || "Database error while saving resource";
}

async function parsePublishInput(request: Request): Promise<PublishInput> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    const semesterRaw = body.semester;
    const classIds = resolveClassIds(body.class_ids, body.class_id);
    return {
      title: String(body.title || "").trim(),
      shortDescription: String(body.short_description || "").trim(),
      fullDescription: String(body.full_description || "").trim(),
      contentType: String(body.content_type || "learning_material") as ContentType,
      categoryId: optionalUuid(body.category_id),
      tagIds: parseTagIds(body.tag_ids),
      difficultyLevel: String(body.difficulty_level || "beginner"),
      ageRange: String(body.age_range || "all_ages"),
      estimatedMinutes: parseOptionalInt(body.estimated_minutes),
      language: String(body.language || "en"),
      status: String(body.status || "draft"),
      accessType: String(body.access_type || "free"),
      price: parsePrice(body.price, String(body.access_type || "free")),
      externalUrl: String(body.external_url || "").trim(),
      subjectId: optionalUuid(body.subject_id),
      classIds,
      classId: classIds[0] ?? null,
      semester: semesterRaw === 1 || semesterRaw === "1" || semesterRaw === 2 || semesterRaw === "2"
        ? parseInt(String(semesterRaw), 10)
        : null,
      resourceId: optionalUuid(body.resource_id),
      storagePath: body.storage_path ? String(body.storage_path).trim() : null,
      fileName: body.file_name ? String(body.file_name) : null,
      fileSize: body.file_size != null ? Number(body.file_size) : null,
      mimeType: body.mime_type ? String(body.mime_type) : null,
      thumbPath: body.thumbnail_storage_path ? String(body.thumbnail_storage_path).trim() : null,
      thumbnailUrl: body.thumbnail_url ? String(body.thumbnail_url) : null,
      file: null,
      thumbnail: null,
    };
  }

  const formData = await request.formData();
  const semesterRaw = formData.get("semester");
  const classIds = resolveClassIds(formData.get("class_ids"), formData.get("class_id"));
  return {
    title: String(formData.get("title") || "").trim(),
    shortDescription: String(formData.get("short_description") || "").trim(),
    fullDescription: String(formData.get("full_description") || "").trim(),
    contentType: String(formData.get("content_type") || "learning_material") as ContentType,
    categoryId: optionalUuid(formData.get("category_id")),
    tagIds: parseTagIds(formData.get("tag_ids")),
    difficultyLevel: String(formData.get("difficulty_level") || "beginner"),
    ageRange: String(formData.get("age_range") || "all_ages"),
    estimatedMinutes: parseOptionalInt(formData.get("estimated_minutes")),
    language: String(formData.get("language") || "en"),
    status: String(formData.get("status") || "draft"),
    accessType: String(formData.get("access_type") || "free"),
    price: parsePrice(formData.get("price"), String(formData.get("access_type") || "free")),
    externalUrl: String(formData.get("external_url") || "").trim(),
    subjectId: optionalUuid(formData.get("subject_id")),
    classIds,
    classId: classIds[0] ?? null,
    semester: semesterRaw === "1" || semesterRaw === "2" ? parseInt(String(semesterRaw), 10) : null,
    resourceId: optionalUuid(formData.get("resource_id")),
    storagePath: formData.get("storage_path") ? String(formData.get("storage_path")).trim() : null,
    fileName: formData.get("file_name") ? String(formData.get("file_name")) : null,
    fileSize: formData.get("file_size") ? parseInt(String(formData.get("file_size")), 10) : null,
    mimeType: formData.get("mime_type") ? String(formData.get("mime_type")) : null,
    thumbPath: formData.get("thumbnail_storage_path")
      ? String(formData.get("thumbnail_storage_path")).trim()
      : null,
    thumbnailUrl: formData.get("thumbnail_url") ? String(formData.get("thumbnail_url")) : null,
    file: (formData.get("file") as File | null) ?? null,
    thumbnail: (formData.get("thumbnail") as File | null) ?? null,
  };
}

export async function POST(request: Request) {
  try {
    const gate = await requireLibraryPublishApi();
    if (gate.error) return gate.error;
    const auth = gate.auth;
    const supabase = auth.supabase;

    let input: PublishInput;
    try {
      input = await parsePublishInput(request);
    } catch (parseError: unknown) {
      const message = parseError instanceof Error ? parseError.message : "Invalid request body";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : supabase;
    const {
      title,
      shortDescription,
      fullDescription,
      contentType,
      categoryId,
      tagIds,
      difficultyLevel,
      ageRange,
      estimatedMinutes,
      language,
      status,
      accessType,
      price,
      externalUrl,
      subjectId,
      classId,
      classIds,
      semester,
      resourceId,
      file,
      thumbnail,
    } = input;

    let storagePath = input.storagePath;
    let fileName = input.fileName;
    let fileSize = input.fileSize;
    let mimeType = input.mimeType;
    let thumbPath = input.thumbPath;
    let thumbnailUrl = input.thumbnailUrl;
    const wantsPublish = status === "published";

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const validation = validatePublishInput(auth.user.id, {
      title,
      contentType,
      status,
      subjectId,
      classId,
      classIds,
      externalUrl,
      resourceId,
      storagePath,
      fileName,
      fileSize,
      thumbPath,
      hasNewFile: Boolean(file && file.size > 0),
      hasNewThumbnail: Boolean(thumbnail && thumbnail.size > 0),
    });
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    const duplicate = await checkDuplicateTitle(db, auth.user.id, title, resourceId);
    if (!duplicate.ok) {
      return NextResponse.json({ error: duplicate.error }, { status: duplicate.status });
    }

    if (thumbnail && thumbnail.size > MAX_THUMB_BYTES) {
      return NextResponse.json({ error: "Thumbnail exceeds 5MB limit" }, { status: 400 });
    }

    let fileUrl = externalUrl || "";
    const needsServerStorage =
      (!storagePath && file && file.size > 0) || (!thumbPath && thumbnail && thumbnail.size > 0);

    if (needsServerStorage && !isSupabaseServiceRoleConfigured()) {
      return NextResponse.json({ error: SERVICE_ROLE_REQUIRED_MESSAGE }, { status: 503 });
    }

    const storageClient = isSupabaseServiceRoleConfigured() ? createAdminClient() : supabase;

    if (needsServerStorage) {
      try {
        await requireTeacherStorageReady();
      } catch (bucketError) {
        const message = bucketError instanceof Error ? bucketError.message : "Storage is not configured";
        return NextResponse.json(
          { error: `${message}${storageErrorHint(message)}${BUCKET_SETUP_HINT}` },
          { status: 500 }
        );
      }
    }

    if (!storagePath && file && file.size > 0) {
      fileName = file.name;
      fileSize = file.size;
      mimeType = resolveUploadMimeType(file);

      if (!isAllowedResourceMime(mimeType)) {
        return NextResponse.json(
          {
            error: `Unsupported file type (${mimeType || "unknown"}). Use PDF, video, Word, PowerPoint, Excel, or image files.`,
          },
          { status: 400 }
        );
      }

      storagePath = `${auth.user.id}/${Date.now()}-${sanitizeName(file.name)}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await uploadToBucket(
        storageClient,
        RESOURCES_BUCKET,
        storagePath,
        buffer,
        mimeType
      );

      if (uploadError) {
        return NextResponse.json(
          { error: `File upload failed: ${uploadError}${storageErrorHint(uploadError)}` },
          { status: 500 }
        );
      }

      fileUrl = "";
    } else if (Boolean(storagePath && fileName)) {
      fileUrl = externalUrl || "";
    }

    if (!thumbPath && thumbnail && thumbnail.size > 0) {
      const thumbMime = resolveUploadMimeType(thumbnail);
      if (!isAllowedThumbnailMime(thumbMime)) {
        if (storagePath) await removeFromBucket(storageClient, RESOURCES_BUCKET, storagePath);
        return NextResponse.json({ error: "Thumbnail must be JPG, PNG, or WebP." }, { status: 400 });
      }

      thumbPath = `${auth.user.id}/${Date.now()}-thumb-${sanitizeName(thumbnail.name)}`;
      const thumbBuffer = Buffer.from(await thumbnail.arrayBuffer());
      const { error: thumbError } = await uploadToBucket(
        storageClient,
        THUMBNAILS_BUCKET,
        thumbPath,
        thumbBuffer,
        thumbMime
      );

      if (thumbError) {
        if (storagePath) await removeFromBucket(storageClient, RESOURCES_BUCKET, storagePath);
        return NextResponse.json(
          { error: `Thumbnail upload failed: ${thumbError}${storageErrorHint(thumbError)}` },
          { status: 500 }
        );
      }

      const { data: thumbUrlData } = supabase.storage.from(THUMBNAILS_BUCKET).getPublicUrl(thumbPath);
      thumbnailUrl = thumbUrlData.publicUrl;
    }

    const legacyType = LEGACY_TYPE_MAP[contentType] || "other";
    const isAdmin = auth.profile?.role === "admin";
    const isPublished = wantsPublish && isAdmin;

    let subjectName: string | null = null;
    let className: string | null = null;
    if (subjectId) {
      const { data: subjectRow } = await db.from("subjects").select("name").eq("id", subjectId).maybeSingle();
      subjectName = subjectRow?.name ?? null;
    }
    if (classIds.length > 0) {
      const { data: classRows } = await db.from("classes").select("name").in("id", classIds);
      className = (classRows ?? []).map((row: { name: string }) => row.name).filter(Boolean).join(", ") || null;
    }

    const resolvedShort =
      shortDescription ||
      buildAutoShortDescription({ title, subjectName, className, semester });
    const resolvedDescription = shortDescription || fullDescription || resolvedShort;
    const resolvedFull = fullDescription || resolvedShort;

    const payload = {
      title,
      description: resolvedDescription,
      short_description: resolvedShort,
      full_description: resolvedFull,
      content_type: contentType,
      type: legacyType,
      url: fileUrl,
      thumbnail_url: thumbnailUrl || null,
      file_size: fileSize,
      file_name: fileName,
      storage_path: storagePath,
      subject_id: subjectId,
      class_id: classId,
      class_ids: classIds,
      semester,
      category_id: categoryId,
      difficulty_level: difficultyLevel,
      age_range: ageRange,
      estimated_minutes: estimatedMinutes,
      language,
      status: isPublished ? "published" : wantsPublish && !isAdmin ? "draft" : status || "draft",
      access_type: accessType,
      price,
      is_premium: accessType === "premium",
      created_by: auth.user.id,
      moderation_status: isPublished ? "approved" : wantsPublish && !isAdmin ? "pending" : null,
      publish_date: isPublished ? new Date().toISOString() : null,
    };

    let resource;
    if (resourceId) {
      const { data: existing } = await db
        .from("materials")
        .select("created_by, thumbnail_url, url, storage_path")
        .eq("id", resourceId)
        .single();

      if (!existing || (existing.created_by !== auth.user.id && auth.profile?.role !== "admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const updatePayload: Record<string, unknown> = { ...payload };
      if (!thumbnailUrl) updatePayload.thumbnail_url = existing.thumbnail_url;
      if (!storagePath && !externalUrl) {
        updatePayload.url = existing.url;
        updatePayload.storage_path = existing.storage_path;
      }

      const { data, error } = await db
        .from("materials")
        .update(updatePayload)
        .eq("id", resourceId)
        .select()
        .single();

      if (error) {
        if (storagePath) await removeFromBucket(storageClient, RESOURCES_BUCKET, storagePath);
        if (thumbPath) await removeFromBucket(storageClient, THUMBNAILS_BUCKET, thumbPath);
        return NextResponse.json({ error: formatDbError(error) }, { status: 500 });
      }
      resource = data;
    } else {
      const { data, error } = await db.from("materials").insert(payload).select().single();
      if (error) {
        if (storagePath) await removeFromBucket(storageClient, RESOURCES_BUCKET, storagePath);
        if (thumbPath) await removeFromBucket(storageClient, THUMBNAILS_BUCKET, thumbPath);
        return NextResponse.json({ error: formatDbError(error) }, { status: 500 });
      }
      resource = data;
    }

    if (storagePath && fileName) {
      const { error: fileRowError } = await db.from("resource_files").insert({
        resource_id: resource.id,
        file_name: fileName,
        storage_path: storagePath,
        mime_type: mimeType,
        file_size: fileSize,
        kind: "primary",
      });
      if (fileRowError) {
        console.error("resource_files insert:", fileRowError);
      }
    }

    if (tagIds.length > 0) {
      await db.from("resource_tag_relations").delete().eq("resource_id", resource.id);
      const { error: tagError } = await db.from("resource_tag_relations").insert(
        tagIds.map((tagId) => ({ resource_id: resource.id, tag_id: tagId }))
      );
      if (tagError) {
        console.error("resource_tag_relations insert:", tagError);
      }
    }

    const {
      notifyTeacherResourceUploaded,
      notifyAdminModerationPending,
      notifyResourcePublished,
      notifyAssignmentAssigned,
      notifyExamPublished,
    } = await import("@/lib/notifications/triggers");

    const submittedForReview = wantsPublish && !isAdmin;

    void notifyTeacherResourceUploaded({
      teacherId: auth.user.id,
      materialId: resource.id,
      title,
      status,
      submittedForReview,
      isUpdate: Boolean(resourceId),
    });

    if (submittedForReview) {
      void notifyAdminModerationPending({
        materialId: resource.id,
        title,
        accessType,
        teacherName: auth.profile?.full_name ?? undefined,
      });
    }

    if (isPublished) {
      const studentIds = await import("@/lib/notifications/server").then((m) =>
        m.getStudentIdsForEnrollment(subjectId)
      );
      void notifyResourcePublished({
        materialId: resource.id,
        title,
        teacherId: auth.user.id,
        subjectId,
        isPublished: true,
      });
      if (contentType === "assignment") {
        void notifyAssignmentAssigned({ studentIds, title, materialId: resource.id });
      }
      if (contentType === "exam_preparation" || contentType === "practice_questions") {
        void notifyExamPublished({ studentIds, title, materialId: resource.id });
      }
    }

    return NextResponse.json(resource, { status: resourceId ? 200 : 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to publish resource";
    console.error("Publish error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
