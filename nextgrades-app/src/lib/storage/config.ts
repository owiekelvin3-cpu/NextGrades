/**
 * Single source of truth for Supabase storage buckets used by teacher uploads.
 * Keep in sync with supabase/migrations/00021_storage_upload_fix.sql
 */

export const RESOURCES_BUCKET = "resources";
export const THUMBNAILS_BUCKET = "resource-thumbnails";
export const AVATARS_BUCKET = "avatars";

export const MAX_RESOURCE_FILE_BYTES = 52_428_800; // 50 MB
export const MAX_THUMBNAIL_BYTES = 5_242_880; // 5 MB
export const MAX_AVATAR_BYTES = 5_242_880;

export const ALLOWED_RESOURCE_MIME_TYPES = [
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
] as const;

export const ALLOWED_THUMBNAIL_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const ALLOWED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

/** File picker accept attribute for teacher resource uploads */
export const RESOURCE_FILE_ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.mp4,.webm,.mov,.jpg,.jpeg,.png,.webp,.txt";

export const EXT_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
};

const GENERIC_MIME_TYPES = new Set(["", "application/octet-stream", "binary/octet-stream"]);

export function extensionFromName(name: string): string {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? (parts.pop() ?? "") : "";
}

export function resolveUploadMimeType(file: Pick<File, "name" | "type">): string {
  const ext = extensionFromName(file.name);
  const fromExt = ext ? EXT_TO_MIME[ext] : undefined;
  const raw = (file.type || "").toLowerCase().split(";")[0].trim();

  if (raw && !GENERIC_MIME_TYPES.has(raw)) return raw;
  if (fromExt) return fromExt;
  return raw || "application/octet-stream";
}

export function isAllowedResourceMime(mime: string): boolean {
  return (ALLOWED_RESOURCE_MIME_TYPES as readonly string[]).includes(mime);
}

export function isAllowedThumbnailMime(mime: string): boolean {
  return (ALLOWED_THUMBNAIL_MIME_TYPES as readonly string[]).includes(mime);
}

export function isAllowedResourceFile(file: Pick<File, "name" | "type" | "size">): boolean {
  if (file.size <= 0 || file.size > MAX_RESOURCE_FILE_BYTES) return false;
  return isAllowedResourceMime(resolveUploadMimeType(file));
}

export function resourceFileValidationError(file: Pick<File, "name" | "type" | "size">): string | null {
  if (file.size <= 0) return "File is empty.";
  if (file.size > MAX_RESOURCE_FILE_BYTES) return "File exceeds the 50 MB limit.";
  const mime = resolveUploadMimeType(file);
  if (!isAllowedResourceMime(mime)) {
    return `Unsupported file type (${mime}). Use PDF, video, Word, PowerPoint, Excel, or image files.`;
  }
  return null;
}

export const SERVICE_ROLE_REQUIRED_MESSAGE =
  "Teacher file uploads require SUPABASE_SERVICE_ROLE_KEY in .env.local (Supabase → Settings → API → service_role). Restart the dev server after adding it.";

export const BUCKET_SETUP_HINT =
  " Storage buckets auto-sync on server start when the service role key is set. You can also run: npm run storage:verify";

export function storageErrorHint(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("bucket not found") || lower.includes("not found")) {
    return BUCKET_SETUP_HINT;
  }
  if (lower.includes("mime") || lower.includes("content type") || lower.includes("invalid file type")) {
    return " Supported: PDF, MP4, WebM, Word, PowerPoint, Excel, images, and plain text.";
  }
  if (lower.includes("row-level security") || lower.includes("policy")) {
    return " Ensure your account role is teacher or admin in profiles.";
  }
  if (lower.includes("service_role") || lower.includes("service role")) {
    return ` ${SERVICE_ROLE_REQUIRED_MESSAGE}`;
  }
  return "";
}
