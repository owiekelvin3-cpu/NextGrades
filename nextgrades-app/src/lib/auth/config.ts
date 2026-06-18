/**

 * Email verification: 6-digit code via Resend + Supabase account (unconfirmed until verified).

 * In Supabase Dashboard → Authentication → Email Templates: disable default

 * "Confirm signup" sends so users receive one NextGrades code email, not a duplicate.

 */



function parseEnvFlag(value: string | undefined): boolean | null {

  if (value === "true") return true;

  if (value === "false") return false;

  return null;

}



function resolveVerificationFlag(

  specific: string | undefined,

  legacy: string | undefined,

  fallbackProductionDefault: boolean

): boolean {

  const specificFlag = parseEnvFlag(specific);

  if (specificFlag !== null) return specificFlag;



  const legacyFlag = parseEnvFlag(legacy);

  if (legacyFlag !== null) return legacyFlag;



  return fallbackProductionDefault;

}



/** Signup / account activation requires a 6-digit email code. */

export function isSignupEmailVerificationRequired(): boolean {

  return resolveVerificationFlag(

    process.env.REQUIRE_SIGNUP_EMAIL_VERIFICATION,

    process.env.REQUIRE_EMAIL_VERIFICATION,

    process.env.NODE_ENV === "production"

  );

}



/** Second step on login (password + email OTP). On by default in production. */

export function isLoginEmailVerificationRequired(): boolean {

  return resolveVerificationFlag(

    process.env.REQUIRE_LOGIN_EMAIL_VERIFICATION,

    process.env.REQUIRE_EMAIL_VERIFICATION,

    process.env.NODE_ENV === "production"

  );

}



/** Client-safe mirror for login OTP (inlined at build time). */

export function isClientLoginOtpRequired(): boolean {

  return resolveVerificationFlag(

    process.env.NEXT_PUBLIC_REQUIRE_LOGIN_EMAIL_VERIFICATION,

    process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION ?? process.env.REQUIRE_EMAIL_VERIFICATION,

    process.env.NODE_ENV === "production"

  );

}



/** @deprecated Use isSignupEmailVerificationRequired — kept for existing imports. */

export function isEmailVerificationRequired(): boolean {

  return isSignupEmailVerificationRequired();

}



/** Client-safe mirror for signup verification (inlined at build time). */

export function isClientEmailVerificationRequired(): boolean {

  return resolveVerificationFlag(

    process.env.NEXT_PUBLIC_REQUIRE_SIGNUP_EMAIL_VERIFICATION,

    process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION ?? process.env.REQUIRE_EMAIL_VERIFICATION,

    process.env.NODE_ENV === "production"

  );

}



export function isAuthUserEmailVerified(

  user: { email_confirmed_at?: string | null } | null | undefined

): boolean {

  return Boolean(user?.email_confirmed_at);

}


