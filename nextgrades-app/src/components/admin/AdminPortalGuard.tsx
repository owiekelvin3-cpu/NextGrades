"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { fetchProfileRole } from "@/lib/auth/redirect";
import { ADMIN_PORTAL_LOGIN } from "@/lib/admin/portal-paths";

type Props = {
  children: React.ReactNode;
};

/** Client-side admin session check before rendering portal content. */
export function AdminPortalGuard({ children }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (!cancelled) {
          setStatus("denied");
          router.replace(`${ADMIN_PORTAL_LOGIN}?redirect=${encodeURIComponent(window.location.pathname)}`);
        }
        return;
      }

      const role = await fetchProfileRole(session.user.id);
      if (role !== "admin") {
        await supabase.auth.signOut();
        if (!cancelled) {
          setStatus("denied");
          router.replace("/admin-access?return=" + encodeURIComponent(window.location.pathname));
        }
        return;
      }

      if (!cancelled) setStatus("allowed");
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === "loading") {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#0D1B2A]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
          <p className="text-sm text-gray-400">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (status === "denied") return null;

  return <>{children}</>;
}
