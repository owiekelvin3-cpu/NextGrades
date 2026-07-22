import type { SupabaseClient } from "@supabase/supabase-js";

export type RecoveryBootstrapResult =
  | { ok: true }
  | { ok: false; error: string };

/** Establish a Supabase recovery session from the reset email link (PKCE code or hash tokens). */
export async function bootstrapRecoverySession(
  client: SupabaseClient
): Promise<RecoveryBootstrapResult> {
  if (typeof window === "undefined") {
    return { ok: false, error: "Recovery must run in the browser." };
  }

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) return { ok: false, error: error.message };
    window.history.replaceState({}, document.title, "/reset-password");
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

    if (accessToken && refreshToken && type === "recovery") {
      const { error } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return { ok: false, error: error.message };
      window.history.replaceState({}, document.title, "/reset-password");
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
