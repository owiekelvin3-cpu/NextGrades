"use client";

import dynamic from "next/dynamic";

const CmsPreviewBridge = dynamic(
  () => import("@/components/cms/CmsPreviewBridge").then((m) => m.CmsPreviewBridge),
  { ssr: false }
);

const CmsThemeInjector = dynamic(
  () => import("@/components/cms/CmsThemeInjector").then((m) => m.CmsThemeInjector),
  { ssr: false }
);

/** CMS preview + theme - code-split from the main bundle, client-only. */
export function DeferredCmsExtras() {
  return (
    <>
      <CmsPreviewBridge />
      <CmsThemeInjector />
    </>
  );
}
