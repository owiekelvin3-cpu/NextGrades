import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEmailVerificationRequired } from "@/lib/auth/config";
import { findUserByEmail } from "@/lib/auth/auth-links";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { normalizeEmail, EMAIL_REGEX } from "@/lib/auth/registration";
import { enforceRateLimit } from "@/lib/security/rate-limit";

/** Confirms a user's email when verification is disabled (dev / pre-domain). */
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, { bucket: "auth:confirm-email", limit: 20, windowSec: 600 });
  if (limited) return limited;

  if (isEmailVerificationRequired()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email || "");

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user || user.email_confirmed_at) {
      return NextResponse.json({ ok: true });
    }

    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { error } = await admin.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await admin
      .from("profiles")
      .update({
        email_verified: true,
        email_verified_at: now,
        updated_at: now,
      })
      .eq("id", user.id);

    return NextResponse.json({ ok: true, confirmed: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Confirmation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
