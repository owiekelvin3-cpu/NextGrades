const VIDEO_CONTENT_TYPES = new Set([
  "video_course",
  "mini_course",
  "full_course",
  "live_class",
  "webinar",
  "workshop",
]);

const VIDEO_LEGACY_TYPES = new Set(["video"]);

export function isVideoResource(resource: {
  content_type?: string | null;
  type?: string | null;
}): boolean {
  const ct = (resource.content_type || "").toLowerCase();
  const legacy = (resource.type || "").toLowerCase();
  if (VIDEO_CONTENT_TYPES.has(ct)) return true;
  if (VIDEO_LEGACY_TYPES.has(legacy)) return true;
  if (ct.includes("video")) return true;
  return false;
}

export function resourceWatchPath(id: string): string {
  return `/resources/watch/${id}`;
}
