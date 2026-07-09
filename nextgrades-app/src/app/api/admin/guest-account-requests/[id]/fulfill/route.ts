import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { isResendConfigured } from "@/lib/email";
import { fulfillGuestAccountRequest } from "@/lib/guest-account-requests/fulfill";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const gate = await requireAdminApi();
  if (gate.error) return gate.error;

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY required." }, { status: 503 });
  }

  if (!isResendConfigured()) {
    return NextResponse.json({ error: "E-Mail-Dienst ist nicht konfiguriert." }, { status: 503 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { role?: "student" | "teacher" };
    const admin = createAdminClient();

    const result = await fulfillGuestAccountRequest(admin, {
      requestId: id,
      adminUserId: gate.auth!.user.id,
      role: body.role,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      user: { id: result.userId, email: result.email },
    });
  } catch (error: unknown) {
    console.error("Fulfill guest request error:", error);
    const message = error instanceof Error ? error.message : "Failed to fulfill request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
