import { NextResponse } from "next/server";
import { getApiAuth } from "@/lib/auth/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { normalizeEmail } from "@/lib/auth/registration";
import { isAdminBootstrapAllowed } from "@/lib/security/env";
import { enforceRateLimit } from "@/lib/security/rate-limit";

/**
 * One-time owner bootstrap: set ADMIN_BOOTSTRAP_EMAIL in .env.local to your login email,
 * then POST here while signed in. Requires SUPABASE_SERVICE_ROLE_KEY.
 * Disabled in production unless ALLOW_ADMIN_BOOTSTRAP=true.
 */
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, { bucket: "admin:bootstrap", limit: 5, windowSec: 3600 });
  if (limited) return limited;

  if (!isAdminBootstrapAllowed()) {
    return NextResponse.json(
      { error: "Admin bootstrap is disabled in production. Grant admin via Supabase SQL instead." },
      { status: 403 }
    );
  }
  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "Server missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local and restart the dev server." },
      { status: 503 }
    );
  }

  const bootstrapEmail = normalizeEmail(process.env.ADMIN_BOOTSTRAP_EMAIL || "");
  if (!bootstrapEmail) {
    return NextResponse.json(
      {
        error: "ADMIN_BOOTSTRAP_EMAIL is not set in .env.local",
        hint: "Add ADMIN_BOOTSTRAP_EMAIL=your@email.com and restart the server.",
      },
      { status: 503 }
    );
  }

  const auth = await getApiAuth();
  if (!auth.user || !auth.profile) {
    return NextResponse.json({ error: "Sign in first, then try again." }, { status: 401 });
  }

  const userEmail = normalizeEmail(auth.profile.email || "");
  if (userEmail !== bootstrapEmail) {
    return NextResponse.json(
      {
        error: "This account is not authorized for admin bootstrap.",
        signedInAs: userEmail || null,
        expectedEmail: bootstrapEmail,
      },
      { status: 403 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: "admin", updated_at: new Date().toISOString() })
    .eq("id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await admin.from("user_activity_log").insert({
    user_id: auth.user.id,
    action: "admin_bootstrap",
    metadata: { email: userEmail },
  });

  return NextResponse.json({
    success: true,
    message: "You are now an admin. Refresh the page or open /portal/admin",
    role: "admin",
  });
}
