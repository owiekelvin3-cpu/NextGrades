"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Header row beside close button */
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  panelClassName?: string;
  ariaLabel?: string;
};

/** Full-screen mobile drawer rendered in a portal (above fixed site header). */
export function MobileDrawer({
  open,
  onClose,
  header,
  children,
  footer,
  className,
  panelClassName,
  ariaLabel = "Menu",
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="mobile-drawer-backdrop fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          "mobile-drawer-panel fixed inset-y-0 right-0 z-[90] flex w-full max-w-[100vw] flex-col bg-surface-elevated shadow-2xl sm:max-w-[min(100%,380px)] md:hidden",
          panelClassName,
          className
        )}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex h-[4.5rem] shrink-0 items-center justify-between border-b border-border-default/60 px-5">
          <div className="min-w-0 flex-1">{header}</div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl text-text-muted touch-manipulation"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>

        {footer ? (
          <div
            className="shrink-0 border-t border-border-default/60 px-5 py-5 safe-bottom"
          >
            {footer}
          </div>
        ) : null}
      </div>
    </>,
    document.body
  );
}
