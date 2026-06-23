"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase, isSupabaseEnvConfigured } from "@/lib/supabase/client";
import {
  buildLoginUrl,
  canRoleAccessPath,
  fetchProfileRole,
  getDashboardPathForRole,
} from "@/lib/auth/redirect";
import { Button } from "@/components/ui/Button";

type Props = {
  children: React.ReactNode;
};

const VERIFY_TIMEOUT_MS = 10_000;
const AUTH_TIMEOUT_MS = 6_000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Client-side session + role guard for student/teacher dashboard routes. */
export function DashboardAuthGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "allowed" | "denied" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let resolved = false;

    const timeout = window.setTimeout(() => {
      if (!cancelled && !resolved) {
        setErrorMessage("Session verification took too long. Check your connection and try again.");
        setStatus("error");
      }
    }, VERIFY_TIMEOUT_MS);

    void (async () => {
      try {
        if (!isSupabaseEnvConfigured()) {
          if (!cancelled) {
            setErrorMessage(
              "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
            );
            setStatus("error");
          }
          return;
        }

        const userResult = await withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS);
        const user = userResult?.data?.user ?? null;

        if (!user) {
          if (!cancelled) {
            setStatus("denied");
            router.replace(buildLoginUrl(pathname));
          }
          return;
        }

        const role = await fetchProfileRole(user.id, user.user_metadata);
        if (!role) {
          if (!cancelled) {
            setStatus("denied");
            router.replace("/choose-role");
          }
          return;
        }

        if (role === "admin") {
          if (!cancelled) {
            setStatus("denied");
            router.replace("/portal/admin");
          }
          return;
        }

        if (!canRoleAccessPath(role, pathname)) {
          if (!cancelled) {
            setStatus("denied");
            router.replace(getDashboardPathForRole(role));
          }
          return;
        }

        if (!cancelled) {
          resolved = true;
          setStatus("allowed");
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err instanceof Error ? err.message : "Could not verify your session.");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [pathname, router]);

  if (status === "loading") {
    return (
      <div className="flex h-full min-h-[50vh] flex-1 items-center justify-center bg-surface-dashboard">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--brand-gold)] border-t-transparent" />
          <p className="text-sm text-text-muted">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full min-h-[50vh] flex-1 items-center justify-center bg-surface-dashboard px-6">
        <div className="max-w-md rounded-2xl border border-border-default bg-surface-elevated p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold text-foreground">Dashboard could not load</h2>
          <p className="mt-2 text-sm text-text-muted">{errorMessage}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="gold" size="md" onClick={() => window.location.reload()}>
              Try again
            </Button>
            <Button variant="outline" size="md" href="/login">
              Sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "denied") return null;

  return <>{children}</>;
}
