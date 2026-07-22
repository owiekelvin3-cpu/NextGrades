import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { normalizeEmail } from "@/lib/auth/registration";
import type { User } from "@supabase/supabase-js";

async function authUserIdFromRpc(email: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: authUserId, error } = await admin.rpc("auth_user_id_by_email", {
    check_email: email,
  });
  if (error || !authUserId) return null;
  return String(authUserId);
}

/** Indexed profile lookup - avoids auth.admin.listUsers() which breaks past 1000 users. */
export async function lookupAuthUserIdByEmail(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  if (!normalized || !isSupabaseServiceRoleConfigured()) return null;

  const fromAuth = await authUserIdFromRpc(normalized);
  if (fromAuth) return fromAuth;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", normalized)
    .maybeSingle();

  return profile?.id ?? null;
}

export async function emailExistsInAuth(email: string): Promise<boolean> {
  if (!isSupabaseServiceRoleConfigured()) return false;
  return Boolean(await lookupAuthUserIdByEmail(email));
}

export async function findAuthUserByEmail(email: string): Promise<User | null> {
  const userId = await lookupAuthUserIdByEmail(email);
  if (!userId || !isSupabaseServiceRoleConfigured()) return null;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  return data.user;
}
