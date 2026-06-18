import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getAuthSessionSecret } from "@/lib/security/auth-secret";

export function generateSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashOtpCode(code: string, email: string): string {
  const secret = getAuthSessionSecret();
  return createHash("sha256").update(`${secret}:${email.toLowerCase()}:${code}`).digest("hex");
}

export function verifyOtpHash(code: string, email: string, storedHash: string): boolean {
  const computed = hashOtpCode(code, email);
  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
  } catch {
    return false;
  }
}

export function generateTrustedDeviceToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashTrustedDeviceToken(token: string): string {
  const secret = getAuthSessionSecret();
  return createHash("sha256").update(`${secret}:device:${token}`).digest("hex");
}
