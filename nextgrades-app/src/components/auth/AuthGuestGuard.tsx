"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { fetchProfileRole, resolvePostAuthRedirect, sanitizeRedirect } from "@/lib/auth/redirect";

function AuthGuestGuardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const redirectIfSignedIn = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (!cancelled) setAllowed(true);
        return;
      }

      const redirectTo = sanitizeRedirect(searchParams.get("redirect"));
      const role = await fetchProfileRole(session.user.id);
      const target = role ? resolvePostAuthRedirect(role, redirectTo) : "/choose-role";
      router.replace(target);
      router.refresh();
    };

    void redirectIfSignedIn();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void redirectIfSignedIn();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  if (!allowed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

/** Blocks auth pages for signed-in users — redirects to their dashboard. */
export function AuthGuestGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
        </div>
      }
    >
      <AuthGuestGuardInner>{children}</AuthGuestGuardInner>
    </Suspense>
  );
}
