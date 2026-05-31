import type { SupabaseClient } from "@supabase/supabase-js";
import { THUMBNAILS_BUCKET } from "@/lib/storage/config";

export {
  RESOURCES_BUCKET,
  THUMBNAILS_BUCKET,
  BUCKET_SETUP_HINT,
  SERVICE_ROLE_REQUIRED_MESSAGE,
  ALLOWED_RESOURCE_MIME_TYPES,
  ALLOWED_THUMBNAIL_MIME_TYPES,
  resolveUploadMimeType,
  isAllowedResourceMime,
  isAllowedThumbnailMime,
  isAllowedResourceFile,
  resourceFileValidationError,
  storageErrorHint,
  MAX_RESOURCE_FILE_BYTES,
  MAX_THUMBNAIL_BYTES,
  RESOURCE_FILE_ACCEPT,
} from "@/lib/storage/config";

export { requireTeacherStorageReady, ensureTeacherUploadBuckets } from "@/lib/storage/ensure-buckets";

export async function uploadToBucket(
  client: SupabaseClient,
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string,
  upsert = false
): Promise<{ error: string | null }> {
  const { error } = await client.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert,
    cacheControl: bucket === THUMBNAILS_BUCKET ? "3600" : undefined,
  });
  return { error: error?.message ?? null };
}

export async function removeFromBucket(
  client: SupabaseClient,
  bucket: string,
  path: string
): Promise<void> {
  await client.storage.from(bucket).remove([path]);
}
