import { NextResponse } from "next/server";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { requireLibraryPublishApi } from "@/lib/auth/api-auth";
import type { ContentType } from "@/lib/resources/constants";
import {
  checkDuplicateTitle,
  optionalUuid,
  resolveClassIds,
  validatePublishInput,
} from "@/lib/resources/publish-validation";

export const runtime = "nodejs";

/** Validate publish metadata before the client uploads files to storage. */
export async function POST(request: Request) {
  try {
    const gate = await requireLibraryPublishApi();
    if (gate.error) return gate.error;
    const auth = gate.auth;

    const body = await request.json();
    const title = String(body.title || "").trim();
    const status = String(body.status || "draft");
    const contentType = String(body.content_type || "learning_material") as ContentType;
    const subjectId = optionalUuid(body.subject_id);
    const classIds = resolveClassIds(body.class_ids, body.class_id);
    const classId = classIds[0] ?? null;
    const resourceId = optionalUuid(body.resource_id);
    const externalUrl = String(body.external_url || "").trim();
    const fileSize = body.file_size != null ? Number(body.file_size) : null;
    const hasNewFile = Boolean(body.has_new_file);
    const hasNewThumbnail = Boolean(body.has_new_thumbnail);

    const validation = validatePublishInput(auth.user.id, {
      title,
      contentType,
      status,
      subjectId,
      classId,
      classIds,
      externalUrl,
      resourceId,
      storagePath: null,
      fileName: hasNewFile ? "pending" : null,
      fileSize,
      thumbPath: null,
      hasNewFile,
      hasNewThumbnail,
    });

    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    const db = isSupabaseServiceRoleConfigured() ? createAdminClient() : auth.supabase;
    const duplicate = await checkDuplicateTitle(db, auth.user.id, title, resourceId);
    if (!duplicate.ok) {
      return NextResponse.json({ error: duplicate.error }, { status: duplicate.status });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Validation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
