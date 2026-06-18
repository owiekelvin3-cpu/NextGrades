import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseServiceRoleConfigured,
} from "./env";

let adminClient: SupabaseClient | null = null;

/** Server-only Supabase client that bypasses RLS. Never import from client components. */
export function createAdminClient(): SupabaseClient {
  if (!isSupabaseServiceRoleConfigured()) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Add it to .env.local from Supabase → Settings → API."
    );
  }

  if (!adminClient) {
    adminClient = createSupabaseClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

/** Prefer the caller's Supabase client so RLS applies on public reads. */
export async function createServerReadClient(
  userClient: SupabaseClient
): Promise<SupabaseClient> {
  return userClient;
}

export { isSupabaseServiceRoleConfigured };
