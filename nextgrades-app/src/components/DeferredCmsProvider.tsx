"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { runWhenIdle } from "@/lib/performance/idle";

const CmsProvider = dynamic(
  () => import("@/context/CmsContext").then((m) => m.CmsProvider),
  { ssr: false }
);

function isMarketingRoute(pathname: string | null): boolean {
  if (!pathname) return true;
  if (pathname.startsWith("/dashboard")) return false;
  if (pathname.startsWith("/portal")) return false;
  return true;
}

/**
 * CMS overrides only on marketing routes, mounted after idle so LCP is not blocked.
 */
export function DeferredCmsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const marketing = isMarketingRoute(pathname);
  const [mountCms, setMountCms] = useState(false);

  useEffect(() => {
    if (!marketing) {
      setMountCms(false);
      return;
    }
    return runWhenIdle(() => setMountCms(true), 2000);
  }, [marketing, pathname]);

  if (!marketing) {
    return <>{children}</>;
  }

  if (!mountCms) {
    return <>{children}</>;
  }

  return <CmsProvider>{children}</CmsProvider>;
}
