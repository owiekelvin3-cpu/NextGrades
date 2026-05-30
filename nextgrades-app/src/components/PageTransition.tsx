"use client";

import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

/** Lightweight wrapper — removed 600ms framer-motion delay that made the site feel slow */
export default function PageTransition({ children }: PageTransitionProps) {
  return <>{children}</>;
}
