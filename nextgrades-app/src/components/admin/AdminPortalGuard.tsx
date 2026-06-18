"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseEnvConfigured } from "@/lib/supabase/client";
import { fetchProfileRole } from "@/lib/auth/redirect";
import { ADMIN_PORTAL_LOGIN } from "@/lib/admin/portal-paths";
import { Button } from "@/components/ui/Button";

type Props = {
  children: React.ReactNode;
};

const VERIFY_TIMEOUT_MS = 8_000;
const ADMIN_CACHE_KEY = "ng_admin_verified_v1";
const ADMIN_CACHE_MS = 20 * 60 * 1000;

function readAdminCache(userId: string): boolean {
  try {
    const raw = sessionStorage.getItem(ADMIN_CACHE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { userId?: string; at?: number };
    return parsed.userId === userId && typeof parsed.at === "number" && Date.now() - parsed.at < ADMIN_CACHE_MS;
  } catch {
    return false;
  }
}

function writeAdminCache(userId: string): void {
  try {
    sessionStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify({ userId, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

/** Client-side admin session check before rendering portal content. */
export function AdminPortalGuard({ children }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "allowed" | "denied" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let resolved = false;

    const timeout = window.setTimeout(() => {
      if (!cancelled && !resolved) {
        setErrorMessage("Verification took too long. Check your connection and try again.");
        setStatus("error");
      }
    }, VERIFY_TIMEOUT_MS);

    void (async () => {
      try {
        if (!isSupabaseEnvConfigured()) {
          if (!cancelled) {
            setErrorMessage(
              "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
            );
            setStatus("error");
          }
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          try {
            sessionStorage.removeItem(ADMIN_CACHE_KEY);
          } catch {
            /* ignore */
          }
          if (!cancelled) {
            setStatus("denied");
            router.replace(`${ADMIN_PORTAL_LOGIN}?redirect=${encodeURIComponent(window.location.pathname)}`);
          }
          return;
        }

        if (readAdminCache(session.user.id)) {
          if (!cancelled) {
            resolved = true;
            setStatus("allowed");
          }
          return;
        }

        const role = await fetchProfileRole(session.user.id);
        if (role !== "admin") {
          await supabase.auth.signOut();
          try {
            sessionStorage.removeItem(ADMIN_CACHE_KEY);
          } catch {
            /* ignore */
          }
          if (!cancelled) {
            setStatus("denied");
            router.replace("/admin-access?return=" + encodeURIComponent(window.location.pathname));
          }
          return;
        }

        writeAdminCache(session.user.id);

        if (!cancelled) {
          resolved = true;
          setStatus("allowed");
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err instanceof Error ? err.message : "Could not verify admin access.");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [router]);

  if (status === "loading") {
    return (
      <div className="flex h-full min-h-[50vh] flex-1 items-center justify-center bg-[#0D1B2A]">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
          <p className="text-sm text-gray-400">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full min-h-[50vh] flex-1 items-center justify-center bg-[#0D1B2A] px-6">
        <div className="max-w-md rounded-2xl border border-white/10 bg-[#112240] p-8 text-center">
          <h2 className="text-lg font-bold text-white">Admin could not load</h2>
          <p className="mt-2 text-sm text-gray-400">{errorMessage}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="gold" size="md" onClick={() => window.location.reload()}>
              Try again
            </Button>
            <Button variant="outline" size="md" href={ADMIN_PORTAL_LOGIN}>
              Admin login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "denied") return null;

  return <>{children}</>;
}
