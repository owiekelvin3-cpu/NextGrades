import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

const PERMANENT_BAN = "876000h"; // ~100 years

function requireServiceRole() {
  if (!isSupabaseServiceRoleConfigured()) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for suspend/delete. Add it to .env.local and restart the server."
    );
  }
  return createAdminClient();
}

async function logAdminAction(
  admin: SupabaseClient,
  adminUserId: string,
  action: string,
  metadata: Record<string, unknown>
) {
  await admin.from("user_activity_log").insert({
    user_id: adminUserId,
    action,
    metadata,
  });
}

export async function suspendUserAccount(userId: string, adminUserId: string) {
  const admin = requireServiceRole();

  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: PERMANENT_BAN,
  });
  if (banError) throw new Error(banError.message);

  await admin.auth.admin.signOut(userId, "global");

  const { error: profileError } = await admin
    .from("profiles")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (profileError) throw new Error(profileError.message);

  await logAdminAction(admin, adminUserId, "suspend_user", { target_user_id: userId });
}

export async function activateUserAccount(userId: string, adminUserId: string) {
  const admin = requireServiceRole();

  const { error: unbanError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: "none",
  });
  if (unbanError) throw new Error(unbanError.message);

  const { error: profileError } = await admin
    .from("profiles")
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (profileError) throw new Error(profileError.message);

  await logAdminAction(admin, adminUserId, "activate_user", { target_user_id: userId });
}

export async function deleteUserAccount(userId: string, adminUserId: string) {
  const admin = requireServiceRole();

  const { error: rpcError } = await admin.rpc("admin_delete_user", { p_user_id: userId });
  if (rpcError) {
    throw new Error(rpcError.message || "Failed to remove user data");
  }

  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) {
    throw new Error(authError.message || "Failed to delete auth account");
  }

  await logAdminAction(admin, adminUserId, "delete_user", { target_user_id: userId });
}
