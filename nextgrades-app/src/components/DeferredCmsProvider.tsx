"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const CmsProvider = dynamic(
  () => import("@/context/CmsContext").then((m) => m.CmsProvider),
  { ssr: false }
);

/** Client-only CMS provider — code-split so marketing pages load faster. */
export function DeferredCmsProvider({ children }: { children: ReactNode }) {
  return <CmsProvider>{children}</CmsProvider>;
}
