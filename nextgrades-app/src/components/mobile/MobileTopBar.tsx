"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { MobileMenuSheet } from "@/components/mobile/MobileMenuSheet";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { mobile } from "@/lib/mobile/tokens";
import { cn } from "@/lib/utils";
import { ADMIN_PORTAL_HOME } from "@/lib/admin/portal-paths";

type Props = {
  role: "student" | "teacher" | "admin";
  className?: string;
};

function homeHref(role: Props["role"]) {
  if (role === "teacher") return "/dashboard/teacher";
  if (role === "admin") return ADMIN_PORTAL_HOME;
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
        <div className="flex h-[4.5rem] items-center justify-between px-5 sm:h-20">
          <BrandLogo href={homeHref(role)} size="lg" />

          <div className="flex items-center gap-1">
            <NotificationBell />
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
        </div>
      </header>

      <MobileMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} role={role} />
    </>
  );
}
