"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { fetchProfileRole, resolvePostAuthRedirect, sanitizeRedirect } from "@/lib/auth/redirect";
import { isAuthUserEmailVerified, isClientEmailVerificationRequired, isClientLoginOtpRequired } from "@/lib/auth/config";
import { buildVerifyUrl, savePendingVerification } from "@/lib/auth/pending-verification-storage";

function AuthGuestGuardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const redirectIfSignedIn = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setAllowed(true);
        return;
      }

      const redirectTo = sanitizeRedirect(searchParams.get("redirect"));

      if (isClientEmailVerificationRequired() && !isAuthUserEmailVerified(user)) {
        savePendingVerification({
          step: "signup",
          email: user.email || "",
          redirect: redirectTo,
        });
        router.replace(buildVerifyUrl("signup", user.email || "", redirectTo));
        return;
      }

      if (isClientLoginOtpRequired()) {
        try {
          const res = await fetch("/api/auth/login/status");
          const data = (await res.json()) as { mfaRequired?: boolean };
          if (data.mfaRequired) {
            savePendingVerification({
              step: "login",
              email: user.email || "",
              redirect: redirectTo,
            });
            router.replace(buildVerifyUrl("login", user.email || "", redirectTo));
            return;
          }
        } catch {
          /* continue */
        }
      }

      const role = await fetchProfileRole(user.id);
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

/** Blocks auth pages for fully verified signed-in users. */
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
