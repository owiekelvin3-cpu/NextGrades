import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/env";
import { hashTrustedDeviceToken } from "@/lib/auth/otp-crypto";
import { isLoginEmailVerificationRequired } from "@/lib/auth/config";

export const MFA_COOKIE = "ng_mfa_verified";
export const TRUSTED_DEVICE_COOKIE = "ng_trusted_device";

const MFA_TTL_SEC = 60 * 60 * 24; // 24h
const TRUSTED_DEVICE_TTL_SEC = 60 * 60 * 24 * 30; // 30d

import { getAuthSessionSecret } from "@/lib/security/auth-secret";

function getSigningSecret(): string {
  return getAuthSessionSecret();
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSigningSecret()).update(payload).digest("base64url");
}

function buildSignedValue(userId: string, expiresAt: number): string {
  const payload = `${userId}:${expiresAt}`;
  return `${payload}:${signPayload(payload)}`;
}

function parseSignedValue(value: string, expectedUserId: string): boolean {
  const parts = value.split(":");
  if (parts.length !== 3) return false;
  const [userId, expiresStr, signature] = parts;
  if (userId !== expectedUserId) return false;
  const expiresAt = Number(expiresStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const payload = `${userId}:${expiresAt}`;
  const expected = signPayload(payload);
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function setMfaVerifiedCookie(userId: string) {
  const store = await cookies();
  const expiresAt = Date.now() + MFA_TTL_SEC * 1000;
  store.set(MFA_COOKIE, buildSignedValue(userId, expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MFA_TTL_SEC,
  });
}

export async function clearMfaCookies() {
  const store = await cookies();
  store.delete(MFA_COOKIE);
}

function readMfaCookieValue(getter: (name: string) => string | undefined, userId: string): boolean {
  const value = getter(MFA_COOKIE);
  if (!value) return false;
  return parseSignedValue(value, userId);
}

export async function hasValidMfaCookie(userId: string): Promise<boolean> {
  const store = await cookies();
  return readMfaCookieValue((name) => store.get(name)?.value, userId);
}

export function hasValidMfaCookieFromRequest(
  request: { cookies: { get: (name: string) => { value: string } | undefined } },
  userId: string
): boolean {
  return readMfaCookieValue((name) => request.cookies.get(name)?.value, userId);
}

export async function setTrustedDeviceCookie(userId: string, rawToken: string) {
  const store = await cookies();
  const expiresAt = Date.now() + TRUSTED_DEVICE_TTL_SEC * 1000;
  store.set(TRUSTED_DEVICE_COOKIE, buildSignedValue(userId, expiresAt) + `:${rawToken}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TRUSTED_DEVICE_TTL_SEC,
  });
}

async function validateTrustedDeviceCookieValue(value: string | undefined, userId: string): Promise<boolean> {
  if (!value || !isSupabaseServiceRoleConfigured()) return false;

  const lastColon = value.lastIndexOf(":");
  if (lastColon <= 0) return false;

  const signedPart = value.slice(0, lastColon);
  const rawToken = value.slice(lastColon + 1);
  if (!parseSignedValue(signedPart, userId)) return false;

  const tokenHash = hashTrustedDeviceToken(rawToken);
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data } = await admin
    .from("user_trusted_devices")
    .select("id")
    .eq("user_id", userId)
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .gt("expires_at", now)
    .maybeSingle();

  if (data?.id) {
    void admin
      .from("user_trusted_devices")
      .update({ last_used_at: now })
      .eq("id", data.id);
    return true;
  }

  return false;
}

export async function hasValidTrustedDevice(userId: string): Promise<boolean> {
  const store = await cookies();
  return validateTrustedDeviceCookieValue(store.get(TRUSTED_DEVICE_COOKIE)?.value, userId);
}

export async function hasValidTrustedDeviceFromRequest(
  request: { cookies: { get: (name: string) => { value: string } | undefined } },
  userId: string
): Promise<boolean> {
  return validateTrustedDeviceCookieValue(request.cookies.get(TRUSTED_DEVICE_COOKIE)?.value, userId);
}

export async function isLoginMfaSatisfied(userId: string): Promise<boolean> {
  if (!isLoginEmailVerificationRequired()) return true;
  if (await hasValidMfaCookie(userId)) return true;
  if (await hasValidTrustedDevice(userId)) return true;
  return false;
}

export async function isLoginMfaSatisfiedFromRequest(
  request: { cookies: { get: (name: string) => { value: string } | undefined } },
  userId: string
): Promise<boolean> {
  if (!isLoginEmailVerificationRequired()) return true;
  if (hasValidMfaCookieFromRequest(request, userId)) return true;
  if (await hasValidTrustedDeviceFromRequest(request, userId)) return true;
  return false;
}
