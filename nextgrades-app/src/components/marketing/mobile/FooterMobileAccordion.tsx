"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function FooterMobileAccordion({
  title,
  children,
  isDark,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "md:hidden overflow-hidden rounded-2xl border",
        isDark ? "border-white/10 bg-white/[0.04]" : "border-gray-100 bg-gray-50/80"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[52px] w-full items-center justify-between px-4 py-3 text-left touch-manipulation"
      >
        <span
          className={cn(
            "text-sm font-semibold",
            isDark ? "text-white" : "text-[#0D1B2A]"
          )}
        >
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 transition-transform duration-200",
            isDark ? "text-gray-400" : "text-gray-500",
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
            <ul
              className={cn(
                "space-y-2.5 border-t px-4 py-3",
                isDark ? "border-white/10" : "border-gray-100"
              )}
            >
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
  isDark,
}: {
  href: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "block min-h-10 py-1 text-sm transition-colors hover:text-[#D4AF37] touch-manipulation",
          isDark ? "text-gray-400" : "text-gray-600"
        )}
      >
        {children}
      </Link>
    </li>
  );
}
