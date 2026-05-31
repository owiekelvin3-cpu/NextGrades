"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/notifications/push-client";

/** Registers SW for PWA + push; safe to call on every load */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    void registerServiceWorker();
  }, []);
  return null;
}
