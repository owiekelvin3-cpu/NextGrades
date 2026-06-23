"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const linkClass =
  "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] leading-tight text-text-muted transition-colors hover:text-[var(--brand-gold)] touch-manipulation";

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
        "site-footer border-t border-border-default bg-surface-muted px-4 py-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2">
        <nav className="flex flex-wrap justify-center gap-x-2 gap-y-0">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-center text-[10px] leading-snug text-text-muted/90">{t("footer.copyright")}</p>
      </div>
    </footer>
  );
}
