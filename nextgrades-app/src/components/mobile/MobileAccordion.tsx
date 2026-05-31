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
};

export function MobileAccordion({ items, defaultOpenId, className }: Props) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? items[0]?.id ?? null);

  return (
    <div className={cn("space-y-3 md:hidden", className)}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className={cn(mobile.card, "overflow-hidden")}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left touch-manipulation"
            >
              {item.icon && (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/12 text-[#D4AF37]">
                  {item.icon}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-foreground">{item.title}</span>
                {item.summary && !open && (
                  <span className="mt-0.5 block truncate text-sm text-text-muted">{item.summary}</span>
                )}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-text-muted transition-transform duration-200",
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
                  <div className="border-t border-border-default/60 px-5 py-4">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
