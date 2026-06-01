"use client";

import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTheme } from "@/context/ThemeContext";
import { appShell } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  /** Muted background variant for inner pages */
  muted?: boolean;
};

/** Standard marketing page shell: fixed nav, safe-area padding, footer. */
export function MarketingPageLayout({ children, className, muted }: Props) {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        muted ? appShell.marketingPageMuted : appShell.marketingPage,
        theme === "dark" && !muted && "bg-[#0D1B2A]",
        theme === "light" && !muted && "bg-white",
        className
      )}
    >
      <Navbar />
      <main className="site-main flex min-w-0 flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}
