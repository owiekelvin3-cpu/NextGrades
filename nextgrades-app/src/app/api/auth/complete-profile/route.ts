import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { ensureRoleProfile } from "@/lib/auth/profile-setup";
import { resolveUserRole } from "@/lib/auth/roles";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { role?: string };
    const role = body.role === "teacher" ? "teacher" : body.role === "student" ? "student" : null;

    if (!role) {
      return NextResponse.json({ error: "Please select Student or Teacher" }, { status: 400 });
    }

    if (!isSupabaseServiceRoleConfigured()) {
      return NextResponse.json(
        { error: "Profile setup is temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const existingRole = resolveUserRole(existing?.role, user.user_metadata);
    if (existingRole) {
      return NextResponse.json({ error: "Profile already complete", role: existingRole }, { status: 409 });
    }

    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";

    await ensureRoleProfile(admin, user.id, role, {
      fullName,
      email: user.email || "",
      verified: Boolean(user.email_confirmed_at),
    });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
