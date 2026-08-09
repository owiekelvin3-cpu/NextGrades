import { isVideoResource } from "@/lib/resources/video";

export type MediaKind = "video" | "pdf" | "image" | "text" | "document" | "unknown";

const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v", ".ogg", ".ogv"]);
const PDF_EXTENSIONS = new Set([".pdf"]);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp"]);
const TEXT_EXTENSIONS = new Set([".txt", ".md", ".csv", ".log"]);
const DOCUMENT_EXTENSIONS = new Set([
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".odt",
  ".ods",
  ".odp",
]);

export type MediaResource = {
  content_type?: string | null;
  type?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
};

export function fileExtension(fileName?: string | null): string {
  if (!fileName) return "";
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
}

function mediaKindFromMime(mime?: string | null): MediaKind | null {
  if (!mime) return null;
  const normalized = mime.toLowerCase().split(";")[0]?.trim() ?? "";
  if (normalized.startsWith("video/")) return "video";
  if (normalized === "application/pdf") return "pdf";
  if (normalized.startsWith("image/")) return "image";
  if (normalized.startsWith("text/")) return "text";
  if (
    normalized.includes("word") ||
    normalized.includes("presentation") ||
    normalized.includes("spreadsheet") ||
    normalized.includes("msword") ||
    normalized.includes("officedocument")
  ) {
    return "document";
  }
  return null;
}

function mediaKindFromExtension(ext: string): MediaKind | null {
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (PDF_EXTENSIONS.has(ext)) return "pdf";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (TEXT_EXTENSIONS.has(ext)) return "text";
  if (DOCUMENT_EXTENSIONS.has(ext)) return "document";
  return null;
}

/** Resolve how a library resource should be displayed in the viewer. */
export function resolveMediaKind(resource: MediaResource): MediaKind {
  const fromMime = mediaKindFromMime(resource.mime_type);
  if (fromMime) return fromMime;

  const ext = fileExtension(resource.file_name);
  const fromExt = mediaKindFromExtension(ext);
  if (fromExt) return fromExt;

  if (isVideoResource(resource)) return "video";

  const legacy = (resource.type || "").toLowerCase();
  if (legacy === "video") return "video";
  if (legacy === "pdf") return "pdf";
  if (legacy === "image") return "image";

  return "unknown";
}

export function isLibraryViewable(kind: MediaKind): boolean {
  return kind !== "unknown";
}

export function resourceViewPath(id: string): string {
  return `/resources/watch/${id}`;
}

export function viewActionKey(kind: MediaKind): "watch" | "read" | "view" {
  if (kind === "video") return "watch";
  if (kind === "pdf" || kind === "text") return "read";
  return "view";
}
