import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

/** After Supabase email confirmation, sync profiles.email_verified (correct order: verify → profile → welcome). */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.email_confirmed_at) {
      return NextResponse.json({ ok: true, synced: false, reason: "not_confirmed" });
    }

    if (!isSupabaseServiceRoleConfigured()) {
      return NextResponse.json({ ok: true, synced: false, reason: "no_service_role" });
    }

    const now = new Date().toISOString();
    const admin = createAdminClient();
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        email_verified: true,
        email_verified_at: now,
        updated_at: now,
      })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, synced: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
