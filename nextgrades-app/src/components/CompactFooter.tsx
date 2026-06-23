"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const linkClass =
  "text-xs text-[#0D1B2A]/55 transition-colors duration-200 hover:text-[var(--brand-gold)] dark:text-zinc-400 dark:hover:text-[var(--brand-gold)]";

/** Minimal footer for login/auth pages (owner spec P11-06). */
export function CompactFooter() {
  const { t } = useTranslation();

  const links = [
    { href: "/privacy", label: t("footer.privacy") },
    { href: "/terms", label: t("footer.terms") },
    { href: "/imprint", label: t("footer.imprint") },
    { href: "/contact", label: t("common.contact") },
  ] as const;

  return (
    <footer
      className={cn(
        "site-footer border-t border-black/[0.08] bg-[#F8F8F6] dark:border-white/10 dark:bg-[#0D1B2A]",
        "px-6 py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2">
        <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-center text-[10px] leading-snug text-[#0D1B2A]/50 dark:text-zinc-500">
          {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
