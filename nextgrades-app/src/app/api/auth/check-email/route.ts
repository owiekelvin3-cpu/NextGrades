import { NextResponse } from "next/server";
import { emailExists, logRegistrationAttempt, normalizeEmail, EMAIL_REGEX } from "@/lib/auth/registration";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email || "");

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const exists = await emailExists(email);
    await logRegistrationAttempt(email, "check_email", true, undefined, { exists }, request);

    return NextResponse.json({ exists, email });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check failed";
    await logRegistrationAttempt(null, "check_email", false, message, {}, request);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
