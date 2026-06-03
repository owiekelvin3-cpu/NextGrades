"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Home, GraduationCap, BookOpen, Tag, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { isMarketingRoute, openMarketingMenu } from "@/lib/marketing-nav";

const tabs = [
  { href: "/", key: "home", icon: Home, match: (p: string) => p === "/" },
  { href: "/programs", key: "programs", icon: GraduationCap, match: (p: string) => p.startsWith("/programs") },
  { href: "/subjects", key: "subjects", icon: BookOpen, match: (p: string) => p.startsWith("/subjects") },
  { href: "/pricing", key: "pricing", icon: Tag, match: (p: string) => p.startsWith("/pricing") },
] as const;

export function MarketingBottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const show = isMarketingRoute(pathname);

  useEffect(() => {
    if (!show) {
      document.documentElement.classList.remove("marketing-has-bottom-nav");
      return;
    }
    document.documentElement.classList.add("marketing-has-bottom-nav");
    return () => document.documentElement.classList.remove("marketing-has-bottom-nav");
  }, [show]);

  if (!show) return null;

  const isDark = theme === "dark";

  return (
    <nav
      aria-label={t("marketingNav.bottomLabel")}
      className={cn(
        "marketing-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t md:hidden",
        isDark ? "border-white/10 bg-[#0D1B2A]/98 backdrop-blur-lg" : "border-gray-200/90 bg-white/98 backdrop-blur-lg"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto flex h-[3.25rem] max-w-lg items-stretch justify-around px-1">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex min-w-0 flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium leading-tight touch-manipulation",
                  active ? "text-[#D4AF37]" : isDark ? "text-gray-400" : "text-gray-500"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", active && "stroke-[2.25]")} aria-hidden />
                <span className="max-w-full truncate">{t(`common.${tab.key}`)}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex min-w-0 flex-1">
          <button
            type="button"
            onClick={openMarketingMenu}
            className={cn(
              "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium leading-tight touch-manipulation",
              isDark ? "text-gray-400" : "text-gray-500"
            )}
          >
            <Menu className="h-5 w-5 shrink-0" aria-hidden />
            <span>{t("marketingNav.more")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
