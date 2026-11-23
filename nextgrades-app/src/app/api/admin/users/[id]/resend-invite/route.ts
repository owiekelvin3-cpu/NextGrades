import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { generateInviteLinkForEmail } from "@/lib/auth/auth-links";
import { sendAccountInvitationEmail, isResendConfigured } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

type RouteParams = { params: Promise<{ id: string }> };

/** Resend the password-setup invitation email for an existing user. */
export async function POST(_request: Request, { params }: RouteParams) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Service role not configured." }, { status: 503 });
  }
  if (!isResendConfigured()) {
    return NextResponse.json(
      { error: "E-Mail-Dienst ist nicht konfiguriert. Einladung kann nicht gesendet werden." },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const admin = createAdminClient();
    const { data: profile, error } = await admin
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", id)
      .maybeSingle();

    if (error || !profile?.email) {
      return NextResponse.json({ error: "Benutzer nicht gefunden." }, { status: 404 });
    }

    const role =
      profile.role === "teacher" || profile.role === "admin" ? profile.role : "student";

    const { actionLink, error: linkError } = await generateInviteLinkForEmail(
      profile.email as string
    );
    if (linkError || !actionLink) {
      return NextResponse.json(
        { error: linkError || "Einladungslink konnte nicht erstellt werden." },
        { status: 500 }
      );
    }

    const emailResult = await sendAccountInvitationEmail({
      email: profile.email as string,
      userName: (profile.full_name as string | null) ?? undefined,
      role,
      setupUrl: actionLink,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || "E-Mail konnte nicht gesendet werden." },
        { status: 500 }
      );
    }

    await admin.from("user_activity_log").insert({
      user_id: id,
      action: "admin_resent_invitation",
      metadata: {
        resent_by: gate.auth!.user.id,
        email: profile.email,
      },
    });

    return NextResponse.json({ success: true, emailSent: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Einladung konnte nicht gesendet werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
