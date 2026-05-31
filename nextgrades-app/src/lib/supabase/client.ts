import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseEnvConfigured, requireSupabaseEnv } from "./env";

const GLOBAL_CLIENT_KEY = "__nextgrades_supabase_browser_client__";

type GlobalWithSupabase = typeof globalThis & {
  [GLOBAL_CLIENT_KEY]?: SupabaseClient;
};

function getStoredClient(): SupabaseClient | null {
  return (globalThis as GlobalWithSupabase)[GLOBAL_CLIENT_KEY] ?? null;
}

function storeClient(client: SupabaseClient): void {
  (globalThis as GlobalWithSupabase)[GLOBAL_CLIENT_KEY] = client;
}

/** Returns the browser client, or null when env vars are missing. */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseEnvConfigured()) return null;

  const existing = getStoredClient();
  if (existing) return existing;

  const { url, anonKey } = requireSupabaseEnv();
  const client = createSupabaseBrowserClient(url, anonKey);
  storeClient(client);
  return client;
}

export function createBrowserClient(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }
  return client;
}

const noopSubscription = { unsubscribe: () => {} };

/** Minimal auth stub so public pages render when Supabase env is missing. */
function createAuthStub() {
  const notConfigured = { message: "Supabase is not configured" };
  return {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: (_cb: unknown) => ({ data: { subscription: noopSubscription } }),
    signInWithPassword: async () => ({ data: { session: null, user: null }, error: notConfigured }),
    signUp: async () => ({ data: { session: null, user: null }, error: notConfigured }),
    signInWithOAuth: async () => ({ data: { provider: null, url: null }, error: notConfigured }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ data: {}, error: notConfigured }),
    updateUser: async () => ({ data: { user: null }, error: notConfigured }),
    exchangeCodeForSession: async () => ({ data: { session: null }, error: notConfigured }),
  };
}

function createQueryStub() {
  const empty = async () => ({ data: null, error: null, count: 0 });
  const chain = {
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    delete: () => chain,
    eq: () => chain,
    neq: () => chain,
    in: () => chain,
    order: () => chain,
    limit: () => chain,
    range: () => chain,
    maybeSingle: empty,
    single: empty,
    then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null }),
  };
  return chain;
}

/**
 * Browser singleton. Public pages stay usable when env is missing;
 * auth/dashboard features return empty data or configuration errors.
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      if (prop === "auth") return createAuthStub();
      if (prop === "from") return () => createQueryStub();
      if (prop === "storage") {
        return {
          from: () => ({
            upload: async () => ({ data: null, error: { message: "Supabase is not configured" } }),
            getPublicUrl: () => ({ data: { publicUrl: "" } }),
          }),
        };
      }
      return undefined;
    }
    const value = client[prop as keyof SupabaseClient];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export { isSupabaseEnvConfigured };
