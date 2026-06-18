/** Public self-registration is disabled unless explicitly enabled in env. */
export function isPublicSignupEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_PUBLIC_SIGNUP === "true";
}
