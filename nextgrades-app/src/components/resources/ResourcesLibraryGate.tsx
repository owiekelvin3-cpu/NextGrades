"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { ResourcesBibliothekExperience } from "@/components/resources/ResourcesBibliothekExperience";
import { section } from "@/lib/premium/tokens";

import { isSubscriptionCurrentlyActive } from "@/lib/subscriptions/types";

type AccessState = "loading" | "granted" | "locked";

async function resolveLibraryAccess(): Promise<AccessState> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return "locked";

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_ends_at, role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profile?.role === "admin" || profile?.role === "teacher") return "granted";
  if (
    isSubscriptionCurrentlyActive({
      subscription_status: profile?.subscription_status,
      subscription_ends_at: profile?.subscription_ends_at,
    })
  ) {
    return "granted";
  }

  return "locked";
}

/** Full library catalog for members; marketing preview + upgrade path for guests. */
export function ResourcesLibraryGate() {
  const [access, setAccess] = useState<AccessState>("loading");

  useEffect(() => {
    let mounted = true;
    void resolveLibraryAccess().then((state) => {
      if (mounted) setAccess(state);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void resolveLibraryAccess().then((state) => {
        if (mounted) setAccess(state);
      });
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (access === "loading") {
    return (
      <section className="py-16">
        <div className={section.container}>
          <LoadingBlock />
        </div>
      </section>
    );
  }

  return <ResourcesBibliothekExperience access={access === "granted" ? "granted" : "locked"} />;
}
