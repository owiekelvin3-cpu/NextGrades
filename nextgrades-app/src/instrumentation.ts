/** Server startup: storage warmup + production security checks. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { validateProductionEnv } = await import("@/lib/security/env");
  const issues = validateProductionEnv();
  for (const issue of issues) {
    const prefix = issue.level === "error" ? "[security ERROR]" : "[security WARN]";
    console.warn(`${prefix} ${issue.message}`);
  }

  const { warmStorageSetup } = await import("@/lib/storage/ensure-buckets");
  const { isSupabaseServiceRoleConfigured } = await import("@/lib/supabase/admin");

  if (!isSupabaseServiceRoleConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.error("[security] SUPABASE_SERVICE_ROLE_KEY missing in production.");
    } else {
      console.warn(
        "[storage] SUPABASE_SERVICE_ROLE_KEY missing — teacher file uploads will fail until it is set in .env.local"
      );
    }
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
