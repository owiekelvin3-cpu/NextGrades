"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/auth/roles";

type MemberAccessState = {
  loading: boolean;
  loggedIn: boolean;
  hasMemberAccess: boolean;
  role: AppRole | null;
};

function roleHasMemberAccess(role: AppRole | null, subscriptionStatus: string | null): boolean {
  if (!role) return false;
  if (role === "admin" || role === "teacher") return true;
  return subscriptionStatus === "active" || subscriptionStatus === "trialing";
}

export function useResourceMemberAccess(): MemberAccessState {
  const [state, setState] = useState<MemberAccessState>({
    loading: true,
    loggedIn: false,
    hasMemberAccess: false,
    role: null,
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session?.user) {
        if (mounted) {
          setState({ loading: false, loggedIn: false, hasMemberAccess: false, role: null });
        }
        return;
      }

      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          if (mounted) {
            setState({ loading: false, loggedIn: true, hasMemberAccess: false, role: null });
          }
          return;
        }
        const data = (await res.json()) as {
          profile?: { role?: AppRole; subscription_status?: string | null };
        };
        const role = (data.profile?.role ?? null) as AppRole | null;
        const subscriptionStatus = data.profile?.subscription_status ?? null;
        if (mounted) {
          setState({
            loading: false,
            loggedIn: true,
            hasMemberAccess: roleHasMemberAccess(role, subscriptionStatus),
            role,
          });
        }
      } catch {
        if (mounted) {
          setState({ loading: false, loggedIn: true, hasMemberAccess: false, role: null });
        }
      }
    }

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
