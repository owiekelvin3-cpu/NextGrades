import { supabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

let sessionPromise: Promise<Session | null> | null = null;
let sessionResolvedAt = 0;
const SESSION_CACHE_MS = 30_000;

/** Reuse auth session within a short window - avoids duplicate getSession() on dashboard load. */
export async function getCachedSession(): Promise<Session | null> {
  const now = Date.now();
  if (sessionPromise && now - sessionResolvedAt < SESSION_CACHE_MS) {
    return sessionPromise;
  }

  sessionResolvedAt = now;
  sessionPromise = supabase.auth
    .getSession()
    .then(({ data }) => data.session ?? null)
    .catch(() => null);

  return sessionPromise;
}

export function invalidateSessionCache(): void {
  sessionPromise = null;
  sessionResolvedAt = 0;
}

export function updateSessionCache(session: Session | null): void {
  sessionResolvedAt = Date.now();
  sessionPromise = Promise.resolve(session);
}
