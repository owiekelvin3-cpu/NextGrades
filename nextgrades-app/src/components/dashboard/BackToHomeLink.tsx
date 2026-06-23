"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  darkSidebar?: boolean;
  onNavigate?: () => void;
};

export function BackToHomeLink({ className, darkSidebar = false, onNavigate }: Props) {
  const { t } = useTranslation();

  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-all",
        darkSidebar
          ? "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-surface)] hover:text-[var(--sidebar-text-active)]"
          : "text-text-muted hover:bg-[var(--table-row-hover)] hover:text-foreground",
        className
      )}
    >
      <Home className="h-5 w-5 shrink-0" />
      <span>{t("dashboardNav.backToHomepage", { defaultValue: "Back to Homepage" })}</span>
    </Link>
  );
}
