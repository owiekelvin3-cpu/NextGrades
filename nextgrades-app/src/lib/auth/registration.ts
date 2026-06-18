import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { passwordPolicyError } from "@/lib/auth/password-policy";
import { emailExistsInAuth } from "@/lib/auth/lookup-email";

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
  return passwordPolicyError(password);
}

export function validateSimpleRegistration(data: SimpleRegistrationPayload): string | null {
  if (!data.fullName?.trim() || data.fullName.trim().length < 2) {
    return "Bitte gib deinen vollständigen Namen ein.";
  }
  if (!EMAIL_REGEX.test(normalizeEmail(data.email))) {
    return "Bitte gib eine gültige E-Mail-Adresse ein.";
  }
  const pwdErr = validatePassword(data.password);
  if (pwdErr) return pwdErr;
  if (data.password !== data.confirmPassword) return "Die Passwörter stimmen nicht überein.";
  if (data.role !== "student" && data.role !== "teacher") return "Bitte wähle eine gültige Rolle.";
  return null;
}

export async function emailExists(email: string): Promise<boolean> {
  if (!isSupabaseServiceRoleConfigured()) return false;
  return emailExistsInAuth(email);
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
