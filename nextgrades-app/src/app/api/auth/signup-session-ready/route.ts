import { NextResponse } from "next/server";
import { requireAuthenticatedApi } from "@/lib/auth/api-auth";
import { isAuthUserEmailVerified } from "@/lib/auth/config";
import { setMfaVerifiedCookie } from "@/lib/auth/mfa-cookies";

/** After signup email verification + sign-in, treat email OTP as login MFA for this session. */
export async function POST() {
  const gate = await requireAuthenticatedApi();
  if (gate.error) return gate.error;

  const user = gate.auth!.user;
  if (!isAuthUserEmailVerified(user)) {
    return NextResponse.json({ error: "Email not verified" }, { status: 400 });
  }

  await setMfaVerifiedCookie(user.id);
  return NextResponse.json({ ok: true });
}
