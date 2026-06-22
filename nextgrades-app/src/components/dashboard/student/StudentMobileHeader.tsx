"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MobileMenuSheet } from "@/components/mobile/MobileMenuSheet";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  searchHref?: string;
};

/** Reference-style mobile header: menu · title · search */
export function StudentMobileHeader({ title, searchHref = "/dashboard/student/resources" }: Props) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-border-default bg-surface-elevated/95 backdrop-blur-md md:hidden"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      >
        <div className="grid h-14 grid-cols-[3rem_1fr_auto] items-center gap-1 px-3">
          <button
            type="button"
            aria-label={t("mobileNav.menu", { defaultValue: "Menu" })}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition active:scale-95 hover:bg-[var(--table-row-hover)]"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="truncate text-center text-base font-bold tracking-tight text-foreground">
            {title}
          </h1>

          <div className="flex items-center justify-end gap-0.5">
            <NotificationBell />
            <Link
              href={searchHref}
              aria-label={t("studentDashboard.searchMaterials", { defaultValue: "Search" })}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition active:scale-95 hover:bg-[var(--table-row-hover)]"
            >
              <Search className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <MobileMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} role="student" />
    </>
  );
}
