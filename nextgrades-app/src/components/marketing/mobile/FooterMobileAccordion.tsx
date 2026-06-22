"use client";

import { useState } from "react";
import Link from "next/link";
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
    <div className="overflow-hidden rounded-xl border border-[var(--footer-border)] bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[48px] w-full items-center justify-between px-4 py-3 text-left touch-manipulation"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-[var(--footer-foreground)]">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--footer-muted)] transition-transform duration-200",
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
            <ul className="space-y-1 border-t border-[var(--footer-border)] px-4 py-2">
              {children}
            </ul>
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
        className="block min-h-10 py-2 text-sm text-[var(--footer-link)] transition-colors hover:text-[var(--brand-gold)] touch-manipulation"
      >
        {children}
      </Link>
    </li>
  );
}
