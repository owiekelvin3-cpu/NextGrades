"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const FloatingChatWidget = dynamic(
  () => import("@/components/chat/ChatPanel").then((m) => m.FloatingChatWidget),
  { ssr: false }
);

/** Loads chat UI after idle so dashboard first paint stays fast. */
export function DeferredChatWidget() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const enable = () => setShow(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(enable, { timeout: 8000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(enable, 4000);
    return () => window.clearTimeout(t);
  }, []);

  if (!show) return null;
  return <FloatingChatWidget />;
}
