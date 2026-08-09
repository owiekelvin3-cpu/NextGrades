import { fileExtension } from "@/lib/resources/media-type";

const VIDEO_CONTENT_TYPES = new Set([
  "video_course",
  "mini_course",
  "full_course",
  "live_class",
  "webinar",
  "workshop",
]);

const VIDEO_LEGACY_TYPES = new Set(["video"]);

const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v", ".ogg", ".ogv"]);

export function isVideoResource(resource: {
  content_type?: string | null;
  type?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
}): boolean {
  const mime = (resource.mime_type || "").toLowerCase();
  if (mime.startsWith("video/")) return true;

  const ext = fileExtension(resource.file_name);
  if (VIDEO_EXTENSIONS.has(ext)) return true;

  const ct = (resource.content_type || "").toLowerCase();
  const legacy = (resource.type || "").toLowerCase();
  if (VIDEO_CONTENT_TYPES.has(ct)) return true;
  if (VIDEO_LEGACY_TYPES.has(legacy)) return true;
  if (ct.includes("video")) return true;
  return false;
}

const VIDEO_COURSE_CONTENT_TYPES = new Set([
  "video_course",
  "full_course",
  "mini_course",
]);

export function isVideoCourseResource(resource: {
  content_type?: string | null;
  type?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
}): boolean {
  const ct = (resource.content_type || "").toLowerCase();
  if (VIDEO_COURSE_CONTENT_TYPES.has(ct)) return true;
  if (isVideoResource(resource) && ct.includes("course")) return true;
  if (isVideoResource(resource)) return true;
  return false;
}

export function resourceWatchPath(id: string): string {
  return `/resources/watch/${id}`;
}

export function resourceStreamPath(id: string): string {
  return `/api/resources/${id}/stream`;
}
