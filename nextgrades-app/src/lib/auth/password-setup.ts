import type { SupabaseClient } from "@supabase/supabase-js";

export const PASSWORD_SETUP_PATH = "/reset-password";

export function isPasswordSetupPath(path: string): boolean {
  return path === PASSWORD_SETUP_PATH || path.startsWith(`${PASSWORD_SETUP_PATH}/`);
}

export function buildPasswordSetupUrl(): string {
  return `${PASSWORD_SETUP_PATH}?setup=required`;
}

export async function isPasswordSetupRequired(
  client: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await client
    .from("profiles")
    .select("password_setup_required")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("password_setup_required lookup failed:", error.message);
    return false;
  }

  return data?.password_setup_required === true;
}

export async function markPasswordSetupComplete(
  admin: SupabaseClient,
  userId: string
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await admin
    .from("profiles")
    .update({
      password_setup_required: false,
      password_set_at: now,
      updated_at: now,
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}
