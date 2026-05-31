/** Email verification: required in production unless explicitly disabled. */
export function isEmailVerificationRequired(): boolean {
  if (process.env.REQUIRE_EMAIL_VERIFICATION === "false") return false;
  if (process.env.REQUIRE_EMAIL_VERIFICATION === "true") return true;
  return process.env.NODE_ENV === "production";
}
