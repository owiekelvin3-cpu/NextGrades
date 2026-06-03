/**
 * Email verification: 6-digit code via Resend + Supabase account (unconfirmed until verified).
 * In Supabase Dashboard → Authentication → Email Templates: disable default
 * "Confirm signup" sends so users receive one NextGrades code email, not a duplicate.
 */
export function isEmailVerificationRequired(): boolean {
  if (process.env.REQUIRE_EMAIL_VERIFICATION === "false") return false;
  if (process.env.REQUIRE_EMAIL_VERIFICATION === "true") return true;
  return process.env.NODE_ENV === "production";
}
