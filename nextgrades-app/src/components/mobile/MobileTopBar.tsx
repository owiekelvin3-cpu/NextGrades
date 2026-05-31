"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { MobileMenuSheet } from "@/components/mobile/MobileMenuSheet";
import { mobile } from "@/lib/mobile/tokens";
import { cn } from "@/lib/utils";

type Props = {
  role: "student" | "teacher" | "admin";
  className?: string;
};

function homeHref(role: Props["role"]) {
  if (role === "teacher") return "/dashboard/teacher";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/student";
}

/** Pathora-style minimal header: logo + menu only */
export function MobileTopBar({ role, className }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b border-border-default bg-surface-elevated md:hidden",
          mobile.topSafe,
          className
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <BrandLogo href={homeHref(role)} className="h-9 w-auto" />

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className={cn(
              mobile.touchTarget,
              "flex flex-col items-center justify-center gap-1.5 rounded-2xl active:scale-95"
            )}
          >
            <span className="block h-0.5 w-5 rounded-full bg-foreground" />
            <span className="block h-0.5 w-5 rounded-full bg-foreground" />
          </button>
        </div>
      </header>

      <MobileMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} role={role} />
    </>
  );
}
