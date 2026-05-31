"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebar, SIDEBAR_WIDTH } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";

function GripDots() {
  return (
    <span className="flex flex-col gap-[3px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="mx-auto h-[3px] w-[3px] rounded-full bg-current opacity-70" />
      ))}
    </span>
  );
}

/** Edge handle to collapse / expand the dashboard sidebar (desktop only). */
export function SidebarToggle({ className }: { className?: string }) {
  const { collapsed, toggle } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
      aria-expanded={!collapsed}
      title={collapsed ? "Show navigation" : "Hide navigation"}
      className={cn(
        "group fixed top-1/2 z-[60] hidden -translate-y-1/2 flex-col items-center justify-center gap-1 transition-all duration-300 ease-out md:flex",
        "h-[4.5rem] w-[1.375rem] rounded-r-xl border border-l-0 border-[#D4AF37]/30 bg-[#0D1B2A] text-[#D4AF37]",
        "shadow-[4px_0_20px_rgba(0,0,0,0.22)] hover:w-6 hover:border-[#D4AF37]/50 hover:bg-[#132942] hover:text-[#F5A623]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1B2A]",
        className
      )}
      style={{ left: collapsed ? 0 : SIDEBAR_WIDTH - 1 }}
    >
      <GripDots />
      {collapsed ? (
        <ChevronRight className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100" strokeWidth={2.5} />
      ) : (
        <ChevronLeft className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100" strokeWidth={2.5} />
      )}
    </button>
  );
}

/** Compact reveal tab when sidebar is fully hidden — top-left corner fallback */
export function SidebarRevealTab() {
  const { collapsed, expand } = useSidebar();
  if (!collapsed) return null;

  return (
    <button
      type="button"
      onClick={expand}
      aria-label="Show navigation"
      className="fixed left-0 top-[4.5rem] z-[55] hidden items-center gap-1.5 rounded-r-xl border border-l-0 border-[#D4AF37]/30 bg-[#0D1B2A]/95 px-2.5 py-2 text-[#D4AF37] shadow-lg backdrop-blur-sm transition hover:bg-[#132942] md:flex"
    >
      <ChevronRight className="h-4 w-4" />
      <span className="text-[11px] font-semibold">Menu</span>
    </button>
  );
}
