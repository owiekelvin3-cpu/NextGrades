import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { markPasswordSetupComplete } from "@/lib/auth/password-setup";
import { sendPasswordChangedEmail } from "@/lib/email";
import { logSecurityEvent } from "@/lib/auth/audit-log";

const MIN_PASSWORD_LENGTH = 8;

/** Set a new password during recovery / invite setup (uses the session cookie). */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = String(body.password || "");

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Your reset session expired. Please request a new reset link.",
          code: "session_missing",
        },
        { status: 401 }
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (isSupabaseServiceRoleConfigured()) {
      const admin = createAdminClient();
      await markPasswordSetupComplete(admin, user.id);

      await admin.from("user_activity_log").insert({
        user_id: user.id,
        action: "password_reset_completed",
        metadata: { via: "reset-password-api" },
      });
    }

    if (user.email) {
      void sendPasswordChangedEmail(
        user.email,
        (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined)
      );
    }

    void logSecurityEvent(
      { eventType: "password_changed", success: true, userId: user.id, email: user.email },
      request
    );

    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reset password";
    console.error("[auth/reset-password]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
