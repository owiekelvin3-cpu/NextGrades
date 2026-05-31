import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SimpleRegistrationPayload = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "student" | "teacher";
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

export function validateSimpleRegistration(data: SimpleRegistrationPayload): string | null {
  if (!data.fullName?.trim() || data.fullName.trim().length < 2) {
    return "Please enter your full name";
  }
  if (!EMAIL_REGEX.test(normalizeEmail(data.email))) {
    return "Please enter a valid email address";
  }
  const pwdErr = validatePassword(data.password);
  if (pwdErr) return pwdErr;
  if (data.password !== data.confirmPassword) return "Passwords do not match";
  if (data.role !== "student" && data.role !== "teacher") return "Please select a valid role";
  return null;
}

export async function emailExists(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);

  if (isSupabaseServiceRoleConfigured()) {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (!error && data.users.some((u) => u.email?.toLowerCase() === normalized)) return true;

    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", normalized)
      .maybeSingle();
    if (profile) return true;
    return false;
  }

  return false;
}

export async function logRegistrationAttempt(
  email: string | null,
  action: string,
  success: boolean,
  errorMessage?: string,
  metadata?: Record<string, unknown>,
  request?: Request
) {
  if (!isSupabaseServiceRoleConfigured()) return;
  try {
    const admin = createAdminClient();
    await admin.from("registration_logs").insert({
      email,
      action,
      success,
      error_message: errorMessage ?? null,
      ip_address: request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      user_agent: request?.headers.get("user-agent") ?? null,
      metadata: metadata ?? {},
    });
  } catch {
    /* non-blocking */
  }
}
