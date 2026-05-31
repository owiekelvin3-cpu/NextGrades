"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

export function ResourcesBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-gray-400 mb-4">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-[#D4AF37] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={cn(i === items.length - 1 && "text-white/90")}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
