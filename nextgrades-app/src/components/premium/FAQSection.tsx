"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { cn } from "@/lib/utils";
import { section } from "@/lib/premium/tokens";

type FAQ = { question: string; answer: string };

type FAQSectionProps = {
  eyebrow?: string;
  title: string;
  items: FAQ[];
  muted?: boolean;
};

export function FAQSection({ eyebrow, title, items, muted }: FAQSectionProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className={cn(section.pyCompact, muted ? "bg-[#FAF8F5]" : "bg-white")}>
      <div className={cn(section.container, "max-w-3xl")}>
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="space-y-3">
          {items.map((item, index) => {
            const isOpen = open === index;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left touch-manipulation"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-[#0D1B2A]">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-[#D4AF37] transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-gray-50 px-6 pb-5 pt-4">
                    <p className="text-sm leading-relaxed text-gray-600">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
