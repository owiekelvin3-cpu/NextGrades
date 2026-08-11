"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { mobile } from "@/lib/mobile/tokens";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
};

export function MobileAuthShell({
  children,
  title,
  subtitle,
  backHref = "/",
  backLabel = "Back",
  className,
}: Props) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-surface-dashboard text-foreground">
      <header
        className={cn(
          "flex items-center justify-between border-b border-border-default/60 bg-surface-elevated/80 px-4 backdrop-blur-md",
          mobile.topSafe,
          "h-14 shrink-0"
        )}
      >
        <BrandLogo href={backHref} size="lg" />
      </header>

      <main
        className={cn(
          "flex flex-1 flex-col justify-center overflow-y-auto overflow-x-hidden",
          mobile.pageX,
          "py-8",
          className
        )}
      >
        {(title || subtitle) && (
          <div className="mb-8 text-center">
            {title && <h1 className={mobile.pageTitle}>{title}</h1>}
            {subtitle && <p className={cn(mobile.caption, "mt-2")}>{subtitle}</p>}
          </div>
        )}
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>

      <footer className="shrink-0 border-t border-border-default/60 px-4 py-4 text-center safe-bottom">
        <Link
          href={backHref}
          className="text-sm font-medium text-[#D4AF37] touch-manipulation min-h-12 inline-flex items-center"
        >
          ← {backLabel}
        </Link>
      </footer>
    </div>
  );
}
