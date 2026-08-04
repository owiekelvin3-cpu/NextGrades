import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentType } from "@/lib/resources/constants";
import { isOwnedStoragePath } from "@/lib/resources/client-upload";

export const MAX_FILE_BYTES = 52_428_800; // 50MB
export const MAX_THUMB_BYTES = 5_242_880; // 5MB
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const OPTIONAL_FILE_TYPES = new Set([
  "live_class",
  "webinar",
  "workshop",
  "article",
  "other",
]);

export type PublishValidationInput = {
  title: string;
  contentType: ContentType | string;
  status: string;
  subjectId: string | null;
  classId: string | null;
  externalUrl: string;
  resourceId: string | null;
  storagePath: string | null;
  fileName: string | null;
  fileSize: number | null;
  thumbPath: string | null;
  hasNewFile: boolean;
  hasNewThumbnail: boolean;
};

export type PublishValidationResult =
  | { ok: true }
  | { ok: false; error: string; status: number };

export function optionalUuid(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return UUID_RE.test(s) ? s : null;
}

export function validatePublishInput(
  userId: string,
  input: PublishValidationInput
): PublishValidationResult {
  if (!input.title.trim()) {
    return { ok: false, error: "Title is required", status: 400 };
  }

  const wantsPublish = input.status === "published";
  if (wantsPublish && (!input.subjectId || !input.classId)) {
    return {
      ok: false,
      error:
        "Subject and grade are required to publish. Learners find materials in the Library by subject, grade, and search.",
      status: 400,
    };
  }

  if (input.storagePath && !isOwnedStoragePath(input.storagePath, userId)) {
    return { ok: false, error: "Invalid file storage path", status: 400 };
  }
  if (input.thumbPath && !isOwnedStoragePath(input.thumbPath, userId)) {
    return { ok: false, error: "Invalid thumbnail storage path", status: 400 };
  }

  const hasUploadedFile = Boolean(input.storagePath && input.fileName);
  const fileRequired = !OPTIONAL_FILE_TYPES.has(String(input.contentType));
  if (
    fileRequired &&
    !hasUploadedFile &&
    !input.hasNewFile &&
    !input.externalUrl.trim() &&
    !input.resourceId
  ) {
    return { ok: false, error: "Please upload a file or provide a URL", status: 400 };
  }

  if (input.fileSize != null && input.fileSize > MAX_FILE_BYTES) {
    return { ok: false, error: "File exceeds 50MB limit", status: 400 };
  }

  return { ok: true };
}

export async function checkDuplicateTitle(
  db: SupabaseClient,
  userId: string,
  title: string,
  resourceId: string | null
): Promise<PublishValidationResult> {
  let query = db
    .from("materials")
    .select("id")
    .eq("created_by", userId)
    .ilike("title", title.trim())
    .neq("status", "archived");

  if (resourceId) query = query.neq("id", resourceId);

  const { data: duplicate, error } = await query.maybeSingle();
  if (error) {
    return { ok: false, error: "Could not verify title availability", status: 500 };
  }

  if (duplicate && !resourceId) {
    return {
      ok: false,
      error:
        "You already have a resource with this title. Choose a different title or edit the existing resource.",
      status: 409,
    };
  }

  return { ok: true };
}
