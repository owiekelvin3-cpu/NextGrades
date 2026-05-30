import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { getAppUrl } from "@/lib/email/config";

export type AuthLinkType = "signup" | "recovery" | "magiclink" | "invite";

export function getAuthCallbackUrl() {
  return `${getAppUrl()}/auth/callback`;
}

export function getPasswordResetRedirectUrl() {
  return `${getAppUrl()}/reset-password`;
}

export function getAuthConfigError(): string | null {
  if (!isSupabaseServiceRoleConfigured()) {
    return "SUPABASE_SERVICE_ROLE_KEY is missing. Add it from Supabase → Settings → API (service_role secret).";
  }
  return null;
}

export async function findUserByEmail(email: string) {
  const admin = createAdminClient();
  const normalized = email.trim().toLowerCase();

  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw new Error(error.message);

  return data.users.find((u) => u.email?.toLowerCase() === normalized) ?? null;
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
  const linkParams =
    params.type === "signup"
      ? {
          type: "signup" as const,
          email: params.email,
          password: params.password!,
          options: {
            data: params.metadata,
            redirectTo: params.redirectTo ?? getAuthCallbackUrl(),
          },
        }
      : {
          type: params.type,
          email: params.email,
          options: {
            data: params.metadata,
            redirectTo: params.redirectTo ?? getAuthCallbackUrl(),
          },
        };

  const { data, error } = await admin.auth.admin.generateLink(linkParams);

  if (error) {
    return { actionLink: null, userId: null, error: error.message };
  }

  return {
    actionLink: data.properties?.action_link ?? null,
    userId: data.user?.id ?? null,
    error: null,
  };
}
