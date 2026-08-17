import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";

/** Prefer service role after the caller has already authenticated the user. */
export function quizDataClient(userClient: SupabaseClient): SupabaseClient {
  return isSupabaseServiceRoleConfigured() ? createAdminClient() : userClient;
}
