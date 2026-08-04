import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { getAppUrl } from "@/lib/email/config";
import { findAuthUserByEmail } from "@/lib/auth/lookup-email";

export type AuthLinkType = "signup" | "recovery" | "magiclink" | "invite";

export function getAuthCallbackUrl() {
  return `${getAppUrl()}/auth/callback`;
}

/** Redirect target for Supabase action_link fallback (no query params — must match Supabase allow list). */
export function getPasswordResetRedirectUrl() {
  return `${getAppUrl()}/reset-password`;
}

/** App-hosted setup link — avoids Supabase redirect URL / PKCE issues for admin invites and forgot-password. */
export function buildAppPasswordSetupUrl(
  hashedToken: string,
  linkType: "recovery" | "invite" | "signup" = "recovery"
): string {
  const url = new URL("/reset-password", getAppUrl());
  url.searchParams.set("token_hash", hashedToken);
  url.searchParams.set("type", linkType);
  return url.toString();
}

export function getAuthConfigError(): string | null {
  if (!isSupabaseServiceRoleConfigured()) {
    return "SUPABASE_SERVICE_ROLE_KEY is missing. Add it from Supabase → Settings → API (service_role secret).";
  }
  return null;
}

export async function findUserByEmail(email: string) {
  return findAuthUserByEmail(email);
}

export async function generateAuthLink(params: {
  type: AuthLinkType;
  email: string;
  password?: string;
  metadata?: Record<string, unknown>;
  redirectTo?: string;
}) {
  const configError = getAuthConfigError();
  if (configError) {
    return { actionLink: null, userId: null, error: configError };
  }

  const admin = createAdminClient();
  const redirectTo = params.redirectTo ?? getPasswordResetRedirectUrl();
  const linkParams =
    params.type === "signup"
      ? {
          type: "signup" as const,
          email: params.email,
          password: params.password!,
          options: {
            data: params.metadata,
            redirectTo,
          },
        }
      : {
          type: params.type,
          email: params.email,
          options: {
            data: params.metadata,
            redirectTo,
          },
        };

  const { data, error } = await admin.auth.admin.generateLink(linkParams);

  if (error) {
    return { actionLink: null, userId: null, error: error.message };
  }

  const hashedToken = data.properties?.hashed_token;
  if (
    hashedToken &&
    (params.type === "recovery" || params.type === "invite" || params.type === "signup")
  ) {
    return {
      actionLink: buildAppPasswordSetupUrl(hashedToken, params.type),
      userId: data.user?.id ?? null,
      error: null,
    };
  }

  return {
    actionLink: data.properties?.action_link ?? null,
    userId: data.user?.id ?? null,
    error: null,
  };
}

const RECOVERY_LINK_RETRY_MS = 400;

/** Recovery link right after createUser can race auth replication — retry briefly. */
export async function generateRecoveryLinkForEmail(email: string) {
  const maxAttempts = 3;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await generateAuthLink({
      type: "recovery",
      email,
      redirectTo: getPasswordResetRedirectUrl(),
    });

    if (result.actionLink && !result.error) return result;

    lastError = result.error;
    const retryable = lastError?.toLowerCase().includes("not found");
    if (!retryable || attempt === maxAttempts - 1) break;

    await new Promise((resolve) => setTimeout(resolve, RECOVERY_LINK_RETRY_MS * (attempt + 1)));
  }

  return { actionLink: null, userId: null, error: lastError ?? "Failed to generate reset link" };
}

/** Invite / first-time password setup link for admin-created accounts. */
export async function generateInviteLinkForEmail(email: string) {
  const maxAttempts = 3;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await generateAuthLink({
      type: "invite",
      email,
      redirectTo: getPasswordResetRedirectUrl(),
    });

    if (result.actionLink && !result.error) return result;

    lastError = result.error;
    const retryable = lastError?.toLowerCase().includes("not found");
    if (!retryable || attempt === maxAttempts - 1) break;

    await new Promise((resolve) => setTimeout(resolve, RECOVERY_LINK_RETRY_MS * (attempt + 1)));
  }

  return { actionLink: null, userId: null, error: lastError ?? "Failed to generate invite link" };
}
