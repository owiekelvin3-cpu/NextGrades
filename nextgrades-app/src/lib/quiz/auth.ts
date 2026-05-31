import type { User } from "@supabase/supabase-js";

export type AuthProfile = {
  id: string;
  role: "student" | "teacher" | "admin";
  full_name: string | null;
};

type AuthSupabase = {
  auth: { getUser: () => Promise<{ data: { user: User | null }; error: unknown }> };
  from: (table: string) => unknown;
};

export async function getAuthProfile(supabase: AuthSupabase): Promise<{
  user: { id: string } | null;
  profile: AuthProfile | null;
  error: string | null;
}> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, profile: null, error: "Unauthorized" };
  }

  const { data: profile, error: profileError } = await (supabase.from("profiles") as {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: AuthProfile | null; error: unknown }>;
      };
    };
  })
    .select("id, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { user: null, profile: null, error: "Profile not found" };
  }

  return { user, profile: profile as AuthProfile, error: null };
}

export function requireRole(profile: AuthProfile, roles: AuthProfile["role"][]) {
  return roles.includes(profile.role);
}
