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
          ? "text-gray-300 hover:bg-white/10 hover:text-white"
          : "text-gray-600 hover:bg-gray-50 hover:text-[#0D1B2A]",
        className
      )}
    >
      <Home className="h-5 w-5 shrink-0" />
      <span>{t("dashboardNav.backToHomepage", { defaultValue: "Back to Homepage" })}</span>
    </Link>
  );
}
