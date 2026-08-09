import type { SupabaseClient } from "@supabase/supabase-js";
import type { EmailOtpType } from "@supabase/supabase-js";

export type RecoveryBootstrapResult =
  | { ok: true }
  | { ok: false; error: string };

const OTP_TYPES = new Set<string>(["recovery", "invite", "signup", "magiclink", "email"]);

function isOtpType(value: string | null): value is EmailOtpType {
  return value !== null && OTP_TYPES.has(value);
}

function hasRecoveryParams(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("token_hash") || params.get("code") || params.get("token")) return true;
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (!hash) return false;
  const hashParams = new URLSearchParams(hash);
  return Boolean(hashParams.get("access_token") && hashParams.get("refresh_token"));
}

async function clearConflictingSession(client: SupabaseClient): Promise<void> {
  try {
    await client.auth.signOut({ scope: "local" });
  } catch {
    /* non-blocking */
  }
}

function stripRecoveryParamsFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  const setup = params.get("setup");
  const next = setup === "required" ? "/reset-password?setup=required" : "/reset-password";
  window.history.replaceState({}, document.title, next);
}

/** Establish a Supabase recovery session from the reset / invite email link. */
export async function bootstrapRecoverySession(
  client: SupabaseClient
): Promise<RecoveryBootstrapResult> {
  if (typeof window === "undefined") {
    return { ok: false, error: "Recovery must run in the browser." };
  }

  const params = new URLSearchParams(window.location.search);
  const tokenHash = params.get("token_hash");
  const otpType = params.get("type");
  const legacyToken = params.get("token");

  if (hasRecoveryParams()) {
    await clearConflictingSession(client);
  }

  if (tokenHash && isOtpType(otpType)) {
    const { data, error } = await client.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    if (error) return { ok: false, error: error.message };
    if (!data.session) {
      return { ok: false, error: "Could not start a password reset session. Please request a new link." };
    }
    stripRecoveryParamsFromUrl();
    return { ok: true };
  }

  if (legacyToken && isOtpType(otpType)) {
    const email = params.get("email")?.trim();
    if (email) {
      const { data, error } = await client.auth.verifyOtp({
        token: legacyToken,
        type: otpType,
        email,
      });
      if (error) return { ok: false, error: error.message };
      if (!data.session) {
        return { ok: false, error: "Could not start a password reset session. Please request a new link." };
      }
      stripRecoveryParamsFromUrl();
      return { ok: true };
    }
  }

  const code = params.get("code");
  if (code) {
    const { data, error } = await client.auth.exchangeCodeForSession(code);
    if (error) {
      return {
        ok: false,
        error:
          "This reset link is invalid or expired. Please request a new one from the forgot password page.",
      };
    }
    if (!data.session) {
      return { ok: false, error: "Could not start a password reset session. Please request a new link." };
    }
    stripRecoveryParamsFromUrl();
    return { ok: true };
  }

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (hash) {
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const type = hashParams.get("type");

    if (accessToken && refreshToken && (type === "recovery" || type === "invite" || type === "signup")) {
      const { data, error } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return { ok: false, error: error.message };
      if (!data.session) {
        return { ok: false, error: "Could not start a password reset session. Please request a new link." };
      }
      stripRecoveryParamsFromUrl();
      return { ok: true };
    }
  }

  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession();

  if (sessionError) return { ok: false, error: sessionError.message };
  if (session?.user) return { ok: true };

  return {
    ok: false,
    error: "This reset link is invalid or has expired. Please request a new one.",
  };
}
