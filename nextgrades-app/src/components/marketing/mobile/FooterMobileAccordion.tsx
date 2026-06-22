"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function FooterMobileAccordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[var(--footer-border)]",
        open ? "bg-[var(--footer-card)]" : "bg-[var(--footer-card)]/60"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-3 text-left touch-manipulation"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold tracking-tight text-[var(--footer-foreground)]">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--brand-gold)] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="space-y-0.5 border-t border-[var(--footer-border)] px-3 py-2">{children}</ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FooterAccordionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="footer-nav-link block min-h-10 rounded-xl px-2 py-2.5 touch-manipulation hover:bg-[var(--brand-gold-muted)]"
      >
        {children}
      </Link>
    </li>
  );
}
