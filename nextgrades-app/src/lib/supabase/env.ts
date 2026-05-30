export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
}

export function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
}

export function isSupabaseEnvConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return (
    Boolean(url && key) &&
    url.startsWith("http") &&
    url !== "your-supabase-url" &&
    key !== "your-supabase-anon-key"
  );
}

export function requireSupabaseEnv(): { url: string; anonKey: string } {
  if (!isSupabaseEnvConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return { url: getSupabaseUrl(), anonKey: getSupabaseAnonKey() };
}

export function isSupabaseServiceRoleConfigured(): boolean {
  const key = getSupabaseServiceRoleKey();
  return Boolean(key) && key !== "your-service-role-key";
}
