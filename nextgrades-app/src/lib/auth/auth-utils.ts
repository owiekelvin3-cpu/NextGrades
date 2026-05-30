import { createClient } from "@/lib/supabase/server";

export async function requireAuth(supabase: any) {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return { user: null, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return { user: session.user, profile, error: null };
}

export async function requireRole(supabase: any, role: string) {
  const auth = await requireAuth(supabase);
  
  if (!auth.user) {
    return { user: null, error: "Unauthorized" };
  }

  if (auth.profile?.role !== role) {
    return { user: null, error: "Forbidden" };
  }

  return auth;
}
