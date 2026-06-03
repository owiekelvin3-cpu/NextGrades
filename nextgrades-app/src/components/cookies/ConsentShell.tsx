"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ConsentProvider } from "@/context/ConsentContext";
import { CookieConsentRoot } from "./CookieConsentRoot";
import type { ConsentScriptConfig } from "@/lib/consent/scripts";

type Props = {
  children: ReactNode;
};

export function ConsentShell({ children }: Props) {
  const [scriptConfig, setScriptConfig] = useState<ConsentScriptConfig>({
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null,
  });

  useEffect(() => {
    void fetch("/api/consent/settings")
      .then((r) => r.json())
      .then((data: { scripts?: ConsentScriptConfig }) => {
        if (data.scripts) setScriptConfig(data.scripts);
      })
      .catch(() => {
        /* env fallback already set */
      });
  }, []);

  return (
    <ConsentProvider scriptConfig={scriptConfig}>
      {children}
      <CookieConsentRoot />
    </ConsentProvider>
  );
}
