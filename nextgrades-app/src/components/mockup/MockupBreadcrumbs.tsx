"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = { label: string; href?: string };

type Props = {
  items: BreadcrumbItem[];
  className?: string;
  light?: boolean;
};

export function MockupBreadcrumbs({ items, className, light }: Props) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-4 flex flex-wrap items-center gap-1 text-sm", className)}>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
          {i > 0 && (
            <ChevronRight
              className={cn("h-3.5 w-3.5 shrink-0", light ? "text-white/40" : "text-gray-400")}
            />
          )}
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className={cn(
                "transition hover:text-[#D4AF37]",
                light ? "text-gray-400" : "text-gray-500"
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(light ? "text-gray-300" : "text-gray-600")}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
