import type { SupabaseClient } from "@supabase/supabase-js";
import {
  RESOURCES_BUCKET,
  THUMBNAILS_BUCKET,
  isAllowedResourceMime,
  isAllowedThumbnailMime,
  resolveUploadMimeType,
  storageErrorHint,
} from "@/lib/storage/config";

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export type ClientUploadResult = {
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

type SignedUrlResponse = {
  bucket: string;
  storage_path: string;
  token: string;
  public_url?: string | null;
  error?: string;
};

async function requestSignedUpload(input: {
  kind: "resource" | "thumbnail";
  fileName: string;
  mimeType: string;
  fileSize: number;
}): Promise<SignedUrlResponse & { error?: string }> {
  const res = await fetch("/api/teacher/publish/signed-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      kind: input.kind,
      file_name: input.fileName,
      mime_type: input.mimeType,
      file_size: input.fileSize,
    }),
  });

  let data: Partial<SignedUrlResponse> & { error?: string } = {};
  try {
    data = (await res.json()) as Partial<SignedUrlResponse> & { error?: string };
  } catch {
    data = {};
  }

  if (!res.ok) {
    return { bucket: "", storage_path: "", token: "", error: data.error || `Upload setup failed (${res.status})` };
  }

  if (!data.storage_path || !data.token) {
    return { bucket: "", storage_path: "", token: "", error: "Invalid upload URL response from server" };
  }

  return data as SignedUrlResponse;
}

async function uploadWithSignedUrl(
  supabase: SupabaseClient,
  bucket: string,
  storagePath: string,
  token: string,
  file: File,
  mimeType: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(storagePath, token, file, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    const message = error.message || "File upload failed";
    return { error: `${message}${storageErrorHint(message)}` };
  }

  return { error: null };
}

async function uploadDirect(
  supabase: SupabaseClient,
  bucket: string,
  storagePath: string,
  file: File,
  mimeType: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    const message = error.message || "File upload failed";
    return { error: `${message}${storageErrorHint(message)}` };
  }

  return { error: null };
}

export async function uploadResourceFileFromBrowser(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ data: ClientUploadResult | null; error: string | null }> {
  const mimeType = resolveUploadMimeType(file);
  if (!isAllowedResourceMime(mimeType)) {
    return {
      data: null,
      error: `Unsupported file type (${mimeType || "unknown"}). Use PDF, video, Word, PowerPoint, Excel, or image files.`,
    };
  }

  const signed = await requestSignedUpload({
    kind: "resource",
    fileName: file.name,
    mimeType,
    fileSize: file.size,
  });

  if (signed.error || !signed.token || !signed.storage_path) {
    // Fallback: direct upload with user JWT (older environments)
    const storagePath = `${userId}/${Date.now()}-${sanitizeName(file.name)}`;
    const direct = await uploadDirect(supabase, RESOURCES_BUCKET, storagePath, file, mimeType);
    if (direct.error) {
      return { data: null, error: signed.error || direct.error };
    }
    return {
      data: { storagePath, fileName: file.name, fileSize: file.size, mimeType },
      error: null,
    };
  }

  const upload = await uploadWithSignedUrl(
    supabase,
    signed.bucket || RESOURCES_BUCKET,
    signed.storage_path,
    signed.token,
    file,
    mimeType
  );

  if (upload.error) {
    return { data: null, error: upload.error };
  }

  return {
    data: {
      storagePath: signed.storage_path,
      fileName: file.name,
      fileSize: file.size,
      mimeType,
    },
    error: null,
  };
}

export async function uploadThumbnailFromBrowser(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<{ storagePath: string | null; publicUrl: string | null; error: string | null }> {
  const mimeType = resolveUploadMimeType(file);
  if (!isAllowedThumbnailMime(mimeType)) {
    return { storagePath: null, publicUrl: null, error: "Thumbnail must be JPG, PNG, or WebP." };
  }

  const signed = await requestSignedUpload({
    kind: "thumbnail",
    fileName: file.name,
    mimeType,
    fileSize: file.size,
  });

  if (signed.error || !signed.token || !signed.storage_path) {
    const storagePath = `${userId}/${Date.now()}-thumb-${sanitizeName(file.name)}`;
    const direct = await uploadDirect(supabase, THUMBNAILS_BUCKET, storagePath, file, mimeType);
    if (direct.error) {
      return { storagePath: null, publicUrl: null, error: signed.error || direct.error };
    }
    const { data } = supabase.storage.from(THUMBNAILS_BUCKET).getPublicUrl(storagePath);
    return { storagePath, publicUrl: data.publicUrl, error: null };
  }

  const upload = await uploadWithSignedUrl(
    supabase,
    signed.bucket || THUMBNAILS_BUCKET,
    signed.storage_path,
    signed.token,
    file,
    mimeType
  );

  if (upload.error) {
    return { storagePath: null, publicUrl: null, error: upload.error };
  }

  const publicUrl =
    signed.public_url ??
    supabase.storage.from(THUMBNAILS_BUCKET).getPublicUrl(signed.storage_path).data.publicUrl;

  return { storagePath: signed.storage_path, publicUrl, error: null };
}

export async function removeClientUpload(
  supabase: SupabaseClient,
  bucket: string,
  path: string
): Promise<void> {
  await supabase.storage.from(bucket).remove([path]);
}

/** Ensure a pre-uploaded path belongs to the signed-in user. */
export function isOwnedStoragePath(path: string, userId: string): boolean {
  const normalized = path.trim();
  if (!normalized || normalized.includes("..")) return false;
  return normalized.startsWith(`${userId}/`);
}

async function parseApiError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data?.error) return String(data.error);
  } catch {
    try {
      const text = await res.text();
      if (text.trim()) return text.slice(0, 300);
    } catch {
      /* ignore */
    }
  }
  return `Request failed (${res.status})`;
}

export { parseApiError };
