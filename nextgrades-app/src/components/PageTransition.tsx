"use client";

import { ReactNode, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: ReactNode;
}

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/** Lightweight route fade (CSS only — no framer-motion on marketing routes). */
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const isAppShell =
    pathname.startsWith("/dashboard") || pathname.startsWith("/portal");
  const systemReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  if (isAppShell) {
    return <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">{children}</div>;
  }

  if (systemReducedMotion) {
    return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
  }

  return (
    <div key={pathname} className="page-route-enter flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-x-clip">
      {children}
    </div>
  );
}
