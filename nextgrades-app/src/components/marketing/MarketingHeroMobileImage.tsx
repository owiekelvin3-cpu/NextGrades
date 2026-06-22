"use client";

import { MarketingImage } from "@/components/marketing/MarketingImage";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
};

/** Stacked hero image for phones & tablets — keeps copy readable above the fold. */
export function MarketingHeroMobileImage({ src, alt = "", className, priority }: Props) {
  return (
    <div
      className={cn(
        "relative mt-6 h-52 w-full overflow-hidden rounded-2xl border border-white/10 shadow-lg md:mt-0 md:hidden",
        className
      )}
    >
      <MarketingImage
        src={src}
        alt={alt}
        containerClassName="h-full w-full"
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority={priority}
        className="object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/55 via-transparent to-transparent"
        aria-hidden
      />
    </div>
  );
}
