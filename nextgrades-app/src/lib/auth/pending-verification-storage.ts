const STORAGE_KEY = "ng_pending_verification";
const WELCOME_FLAG_KEY = "ng_show_welcome";
const TTL_MS = 30 * 60 * 1000;

export type VerificationStep = "signup" | "login";

export type PendingVerification = {
  step: VerificationStep;
  email: string;
  password?: string;
  redirect?: string | null;
  createdAt: number;
};

export function savePendingVerification(
  data: Omit<PendingVerification, "createdAt">
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...data, createdAt: Date.now() })
  );
}

export function loadPendingVerification(): PendingVerification | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingVerification;
    if (!parsed.email || !parsed.step) return null;
    if (Date.now() - parsed.createdAt > TTL_MS) {
      clearPendingVerification();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingVerification(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function markWelcomeAfterVerification(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(WELCOME_FLAG_KEY, "1");
}

export function consumeWelcomeFlag(): boolean {
  if (typeof window === "undefined") return false;
  const v = sessionStorage.getItem(WELCOME_FLAG_KEY);
  if (v === "1") {
    sessionStorage.removeItem(WELCOME_FLAG_KEY);
    return true;
  }
  return false;
}

export function buildVerifyUrl(
  step: VerificationStep,
  email: string,
  redirect?: string | null
): string {
  const params = new URLSearchParams({ step, email: email.trim().toLowerCase() });
  if (redirect) params.set("redirect", redirect);
  return `/verify?${params.toString()}`;
}
