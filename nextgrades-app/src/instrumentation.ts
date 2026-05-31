/** Server startup: auto-create/sync Supabase storage buckets so teacher uploads never hit "bucket not found". */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { warmStorageSetup } = await import("@/lib/storage/ensure-buckets");
  const { isSupabaseServiceRoleConfigured } = await import("@/lib/supabase/admin");

  if (!isSupabaseServiceRoleConfigured()) {
    console.warn(
      "[storage] SUPABASE_SERVICE_ROLE_KEY missing — teacher file uploads will fail until it is set in .env.local"
    );
    return;
  }

  const result = await warmStorageSetup();
  if (result.ok) {
    const summary = result.buckets.map((b) => `${b.id}:${b.action}`).join(", ");
    console.log(`[storage] Buckets ready (${summary})`);
  } else {
    console.error("[storage] Bucket sync failed:", result.error);
  }
}
