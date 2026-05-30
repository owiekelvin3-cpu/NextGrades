/** When false (default), accounts are active immediately without email verification. */
export function isEmailVerificationRequired(): boolean {
  return process.env.REQUIRE_EMAIL_VERIFICATION === "true";
}
