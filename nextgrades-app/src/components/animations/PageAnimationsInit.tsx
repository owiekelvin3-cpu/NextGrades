"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isPublicMarketingPath } from "@/lib/marketing/public-routes";

/**
 * Lazy-loads GSAP after hydration and initialises scroll animations
 * for the current marketing page. Re-runs on each route change.
 */
export function PageAnimationsInit() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isPublicMarketingPath(pathname)) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void import("@/lib/animations").then(({ initPageAnimations }) => {
      if (cancelled) return;

      const frame = requestAnimationFrame(() => {
        if (cancelled) return;
        cleanup = initPageAnimations(document.body);
      });

      return () => cancelAnimationFrame(frame);
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [pathname]);

  return null;
}
