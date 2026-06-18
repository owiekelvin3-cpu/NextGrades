"use client";

import { useEffect, useState } from "react";
import type { CmsTeamMember } from "@/lib/cms/types";

export function useCmsTeam() {
  const [team, setTeam] = useState<CmsTeamMember[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/cms/team");
        if (!res.ok) return;
        const data = (await res.json()) as CmsTeamMember[];
        if (!cancelled) {
          setTeam(data.filter((m) => m.is_active !== false));
        }
      } catch {
        /* locale fallback on about page */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { team, loaded };
}
