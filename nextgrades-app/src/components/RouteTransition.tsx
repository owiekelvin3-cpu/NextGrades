"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { PageAnimationsInit } from "@/components/animations/PageAnimationsInit";

/** Applies page enter/exit fade on marketing routes only - dashboards stay instant. */
export default function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const skip =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/api");

  if (skip) {
    return <>{children}</>;
  }

  return (
    <PageTransition>
      <PageAnimationsInit />
      {children}
    </PageTransition>
  );
}
