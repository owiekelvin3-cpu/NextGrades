import type { User } from "@supabase/supabase-js";

// Accepts real Supabase client and the local mock client from createClient().
export async function requireAdmin(
  supabase: {
    auth: { getUser: () => Promise<{ data: { user: User | null }; error: unknown }> };
    from: (table: string) => unknown;
  }
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, error: "Unauthorized" as const };
  }

  const { data: profile, error: profileError } = await (supabase.from("profiles") as {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: { role?: string } | null; error: unknown }>;
      };
    };
  })
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return { user: null, error: "Forbidden" as const };
  }

  return { user, error: null };
}

export function rowsToOverrideMap(
  rows: { i18n_key: string; content_json: { en?: unknown; de?: unknown } | null; content_value?: string | null; field_type: string }[]
) {
  const map: Record<string, { en?: unknown; de?: unknown }> = {};
  for (const row of rows) {
    if (!row.i18n_key) continue;
    if (row.content_json && (row.content_json.en !== undefined || row.content_json.de !== undefined)) {
      map[row.i18n_key] = row.content_json;
    } else if (row.content_value) {
      map[row.i18n_key] = {
        en: row.field_type === "json" ? JSON.parse(row.content_value) : row.content_value,
        de: row.field_type === "json" ? JSON.parse(row.content_value) : row.content_value,
      };
    }
  }
  return map;
}
