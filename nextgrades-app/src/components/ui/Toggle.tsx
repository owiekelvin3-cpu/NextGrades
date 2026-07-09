"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Accessible label */
  label?: string;
  size?: "md" | "lg";
};

const sizes = {
  md: { track: "h-8 w-[52px]", thumb: "h-7 w-7", on: 24 },
  lg: { track: "h-9 w-[58px]", thumb: "h-8 w-8", on: 27 },
};

/** iOS-style switch - large touch target, smooth spring animation */
export function Toggle({ checked, onChange, disabled, label, size = "md" }: ToggleProps) {
  const s = sizes[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative shrink-0 rounded-full transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 focus-visible:ring-offset-2",
        s.track,
        checked ? "bg-[#D4AF37]" : "bg-gray-300 dark:bg-gray-600",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer active:scale-95"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={cn(
          "absolute top-0.5 block rounded-full bg-white shadow-md ring-1 ring-black/5",
          s.thumb
        )}
        animate={{ x: checked ? s.on : 2 }}
      />
    </button>
  );
}
