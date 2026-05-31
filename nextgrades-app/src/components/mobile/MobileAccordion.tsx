"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mobile } from "@/lib/mobile/tokens";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  icon?: React.ReactNode;
  title: string;
  summary?: string;
  content: React.ReactNode;
};

type Props = {
  items: Item[];
  defaultOpenId?: string;
  className?: string;
  /** Dark navy surface — Pathora-style feature cards on mobile */
  variant?: "light" | "dark";
  /** Show on all breakpoints (default: mobile only) */
  alwaysVisible?: boolean;
};

export function MobileAccordion({
  items,
  defaultOpenId,
  className,
  variant = "light",
  alwaysVisible = false,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? items[0]?.id ?? null);
  const isDark = variant === "dark";

  return (
    <div className={cn("space-y-3", !alwaysVisible && "md:hidden", className)}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div
            key={item.id}
            className={cn(
              "overflow-hidden rounded-3xl border",
              isDark
                ? "border-white/10 bg-white/[0.06] shadow-none"
                : cn(mobile.card, "shadow-[0_2px_24px_rgba(13,27,42,0.06)]")
            )}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left touch-manipulation"
            >
              {item.icon && (
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                    isDark ? "bg-[#D4AF37]/15 text-[#D4AF37]" : "bg-[#D4AF37]/12 text-[#D4AF37]"
                  )}
                >
                  {item.icon}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block font-semibold",
                    isDark ? "text-white" : "text-foreground"
                  )}
                >
                  {item.title}
                </span>
                {item.summary && !open && (
                  <span
                    className={cn(
                      "mt-0.5 block truncate text-sm",
                      isDark ? "text-gray-400" : "text-text-muted"
                    )}
                  >
                    {item.summary}
                  </span>
                )}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200",
                  isDark ? "text-gray-400" : "text-text-muted",
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
                  transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      "border-t px-5 py-4 text-sm leading-relaxed",
                      isDark
                        ? "border-white/10 text-gray-300"
                        : "border-border-default/60 text-text-muted"
                    )}
                  >
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
