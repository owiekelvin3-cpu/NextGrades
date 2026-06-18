import { isProduction } from "@/lib/security/env";

const DEV_FALLBACK = "dev-only-auth-session-secret-not-for-production";

/** Returns AUTH_SESSION_SECRET; throws in production when unset. */
export function getAuthSessionSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();
  if (secret) return secret;

  if (isProduction()) {
    throw new Error(
      "AUTH_SESSION_SECRET is required in production. Set a 32+ character random secret in Vercel env."
    );
  }

  return DEV_FALLBACK;
}

/** Call during build / startup to fail fast when production secrets are missing. */
export function assertAuthSessionSecretConfigured(): void {
  if (!isProduction()) return;
  getAuthSessionSecret();
}
