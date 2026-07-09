import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { normalizeEmail } from "@/lib/auth/registration";
import type { User } from "@supabase/supabase-js";

/** Indexed profile lookup - avoids auth.admin.listUsers() which breaks past 1000 users. */
export async function lookupAuthUserIdByEmail(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  if (!normalized || !isSupabaseServiceRoleConfigured()) return null;

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();

  if (profile?.id) return profile.id;

  const { data: authUserId, error } = await admin.rpc("auth_user_id_by_email", {
    check_email: normalized,
  });

  if (error || !authUserId) return null;
  return String(authUserId);
}

export async function emailExistsInAuth(email: string): Promise<boolean> {
  const id = await lookupAuthUserIdByEmail(email);
  return Boolean(id);
}

export async function findAuthUserByEmail(email: string): Promise<User | null> {
  const userId = await lookupAuthUserIdByEmail(email);
  if (!userId || !isSupabaseServiceRoleConfigured()) return null;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) return null;

  const normalized = normalizeEmail(email);
  if (data.user.email?.toLowerCase() !== normalized) return null;
  return data.user;
}
