"use client";

import { useCallback, useEffect, useRef, useState, Children, isValidElement } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  /** Tailwind grid classes shown from md breakpoint, e.g. "md:grid md:grid-cols-3 md:gap-8" */
  desktopClassName?: string;
  /** Width of each mobile slide */
  slideWidth?: "full" | "wide" | "compact";
  className?: string;
  ariaLabel?: string;
};

const slideWidths = {
  full: "w-[calc(100vw-2.5rem)] max-w-[360px]",
  wide: "w-[82vw] max-w-[320px]",
  compact: "w-[72vw] max-w-[260px]",
};

export function MobileCarousel({
  children,
  desktopClassName = "md:grid md:grid-cols-3 md:gap-8",
  slideWidth = "wide",
  className,
  ariaLabel = "Carousel",
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = Children.toArray(children).filter(isValidElement);

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el || slides.length === 0) return;
    const slideEl = el.querySelector<HTMLElement>("[data-carousel-slide]");
    if (!slideEl) return;
    const slideWidthPx = slideEl.offsetWidth + 16; // gap-4
    const index = Math.round(el.scrollLeft / slideWidthPx);
    setActiveIndex(Math.min(Math.max(index, 0), slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateActiveIndex, { passive: true });
    return () => el.removeEventListener("scroll", updateActiveIndex);
  }, [updateActiveIndex]);

  const scrollTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const slideEl = el.querySelector<HTMLElement>("[data-carousel-slide]");
    if (!slideEl) return;
    const slideWidthPx = slideEl.offsetWidth + 16;
    el.scrollTo({ left: slideWidthPx * index, behavior: "smooth" });
    setActiveIndex(index);
  };

  if (slides.length === 0) return null;

  return (
    <div className={className}>
      {/* Mobile slider */}
      <div className="md:hidden">
        <div
          ref={scrollRef}
          role="region"
          aria-label={ariaLabel}
          aria-roledescription="carousel"
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-none -mx-5 px-5"
        >
          {slides.map((slide, i) => (
            <div
              key={slide.key ?? i}
              data-carousel-slide
              className={cn("snap-center shrink-0", slideWidths[slideWidth])}
            >
              {slide}
            </div>
          ))}
        </div>

        {slides.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 touch-manipulation",
                  activeIndex === i ? "w-6 bg-[#D4AF37]" : "w-2 bg-gray-300 dark:bg-white/25"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop grid */}
      <div className={cn("hidden", desktopClassName)}>{slides}</div>
    </div>
  );
}

/** Single stat / feature card for carousel slides */
export function CarouselCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-3xl border border-border-default/80 bg-surface-elevated p-6 shadow-[0_4px_24px_rgba(13,27,42,0.08)] dark:bg-[#112240] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
        className
      )}
    >
      {children}
    </div>
  );
}
