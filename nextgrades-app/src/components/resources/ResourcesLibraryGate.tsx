"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { LoadingBlock } from "@/components/dashboard/LoadingBlock";
import { ResourcesBibliothekExperience } from "@/components/resources/ResourcesBibliothekExperience";
import { section } from "@/lib/premium/tokens";

type AccessState = "loading" | "granted" | "locked";

async function resolveLibraryAccess(): Promise<AccessState> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return "locked";

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profile?.role === "admin" || profile?.role === "teacher") return "granted";
  if (profile?.subscription_status === "active") return "granted";

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
