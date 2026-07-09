import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import {
  AVATARS_BUCKET,
  ALLOWED_AVATAR_MIME_TYPES,
  ALLOWED_RESOURCE_MIME_TYPES,
  ALLOWED_THUMBNAIL_MIME_TYPES,
  MAX_AVATAR_BYTES,
  MAX_RESOURCE_FILE_BYTES,
  MAX_THUMBNAIL_BYTES,
  RESOURCES_BUCKET,
  THUMBNAILS_BUCKET,
} from "@/lib/storage/config";

export type StorageBucketStatus = {
  id: string;
  ok: boolean;
  action: "created" | "updated" | "verified";
  error?: string;
};

export type StorageSetupResult = {
  ok: boolean;
  buckets: StorageBucketStatus[];
  error?: string;
};

type BucketSpec = {
  id: string;
  public: boolean;
  fileSizeLimit: number;
  allowedMimeTypes: readonly string[];
};

const BUCKET_SPECS: BucketSpec[] = [
  {
    id: RESOURCES_BUCKET,
    public: false,
    fileSizeLimit: MAX_RESOURCE_FILE_BYTES,
    allowedMimeTypes: ALLOWED_RESOURCE_MIME_TYPES,
  },
  {
    id: THUMBNAILS_BUCKET,
    public: true,
    fileSizeLimit: MAX_THUMBNAIL_BYTES,
    allowedMimeTypes: ALLOWED_THUMBNAIL_MIME_TYPES,
  },
  {
    id: AVATARS_BUCKET,
    public: true,
    fileSizeLimit: MAX_AVATAR_BYTES,
    allowedMimeTypes: ALLOWED_AVATAR_MIME_TYPES,
  },
];

async function syncBucket(admin: SupabaseClient, spec: BucketSpec): Promise<StorageBucketStatus> {
  const options = {
    public: spec.public,
    fileSizeLimit: spec.fileSizeLimit,
    allowedMimeTypes: [...spec.allowedMimeTypes],
  };

  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) {
    return { id: spec.id, ok: false, action: "verified", error: listError.message };
  }

  const exists = (buckets ?? []).some((b) => b.id === spec.id);

  if (!exists) {
    const { error: createError } = await admin.storage.createBucket(spec.id, options);
    if (createError) {
      return { id: spec.id, ok: false, action: "created", error: createError.message };
    }
    return { id: spec.id, ok: true, action: "created" };
  }

  const { error: updateError } = await admin.storage.updateBucket(spec.id, options);
  if (updateError) {
    return { id: spec.id, ok: false, action: "updated", error: updateError.message };
  }

  return { id: spec.id, ok: true, action: "updated" };
}

/** Create or refresh all app storage buckets (MIME limits, size limits, visibility). */
export async function ensureAllStorageBuckets(admin?: SupabaseClient): Promise<StorageSetupResult> {
  if (!isSupabaseServiceRoleConfigured()) {
    return {
      ok: false,
      buckets: [],
      error: "SUPABASE_SERVICE_ROLE_KEY is not configured",
    };
  }

  const client = admin ?? createAdminClient();
  const buckets: StorageBucketStatus[] = [];

  for (const spec of BUCKET_SPECS) {
    buckets.push(await syncBucket(client, spec));
  }

  const failed = buckets.find((b) => !b.ok);
  return {
    ok: !failed,
    buckets,
    error: failed?.error,
  };
}

/** Teacher publish + avatar uploads - resources + thumbnails only. */
export async function ensureTeacherUploadBuckets(admin?: SupabaseClient): Promise<StorageSetupResult> {
  const full = await ensureAllStorageBuckets(admin);
  return {
    ...full,
    buckets: full.buckets.filter((b) => b.id === RESOURCES_BUCKET || b.id === THUMBNAILS_BUCKET),
  };
}

let warmPromise: Promise<StorageSetupResult> | null = null;

/** Runs once per server process on startup (instrumentation). */
export function warmStorageSetup(): Promise<StorageSetupResult> {
  if (!warmPromise) {
    warmPromise = ensureAllStorageBuckets()
      .then((result) => {
        if (!result.ok) warmPromise = null;
        return result;
      })
      .catch((error: unknown) => {
        warmPromise = null;
        const message = error instanceof Error ? error.message : "Storage setup failed";
        console.error("[storage] Warm setup failed:", message);
        return { ok: false, buckets: [], error: message };
      });
  }
  return warmPromise;
}

/** Call before any teacher file upload; throws if storage is not ready. */
export async function requireTeacherStorageReady(): Promise<void> {
  if (!isSupabaseServiceRoleConfigured()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  const result = await warmStorageSetup();
  if (!result.ok) {
    throw new Error(result.error ?? "Storage buckets could not be verified");
  }

  const resources = result.buckets.find((b) => b.id === RESOURCES_BUCKET);
  const thumbnails = result.buckets.find((b) => b.id === THUMBNAILS_BUCKET);
  if (!resources?.ok || !thumbnails?.ok) {
    throw new Error("Required storage buckets (resources, resource-thumbnails) are not ready");
  }
}
