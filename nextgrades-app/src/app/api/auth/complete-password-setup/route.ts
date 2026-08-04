import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { markPasswordSetupComplete } from "@/lib/auth/password-setup";

/** Called after the user sets their password on /reset-password (invite or recovery). */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    if (!isSupabaseServiceRoleConfigured()) {
      return NextResponse.json({ error: "Server configuration error." }, { status: 503 });
    }

    const admin = createAdminClient();
    await markPasswordSetupComplete(admin, user.id);

    await admin.from("user_activity_log").insert({
      user_id: user.id,
      action: "password_setup_completed",
      metadata: { via: "reset-password" },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("complete-password-setup:", error);
    const message = error instanceof Error ? error.message : "Failed to complete password setup";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
