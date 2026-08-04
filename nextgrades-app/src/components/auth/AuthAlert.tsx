"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH_EASE } from "@/components/auth/auth-motion";

type Props = {
  message: string | null;
  className?: string;
  variant?: "error" | "info";
};

export function AuthAlert({ message, className, variant = "error" }: Props) {
  return (
    <AnimatePresence mode="wait">
      {message ? (
        <motion.div
          key={message}
          role="alert"
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.28, ease: AUTH_EASE }}
          className={cn("overflow-hidden", className)}
        >
          <div
            className={cn(
              "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm",
              variant === "error"
                ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300"
                : "border-[var(--brand-gold)]/30 bg-[var(--brand-gold)]/10 text-foreground"
            )}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p className="leading-relaxed">{message}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
