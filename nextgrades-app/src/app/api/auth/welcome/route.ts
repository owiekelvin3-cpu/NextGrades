import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isResendConfigured, sendWelcomeEmail } from "@/lib/email";

/** Send welcome email after successful verification (server-only). */
export async function POST(request: Request) {
  try {
    if (!isResendConfigured()) {
      return NextResponse.json({ skipped: true });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meta = user.user_metadata ?? {};
    const fullName =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      undefined;
    const role = meta.role === "teacher" ? "teacher" : "student";

    await sendWelcomeEmail(user.email, fullName, role);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send welcome email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
