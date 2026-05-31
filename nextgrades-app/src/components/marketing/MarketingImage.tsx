"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { isValidImageSrc } from "@/lib/images/resolve";

type MarketingImageProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
};

/** Optimized remote marketing image — uses next/image with automatic fallback. */
export function MarketingImage({
  src,
  alt,
  fallbackSrc,
  className,
  containerClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  width,
  height,
}: MarketingImageProps) {
  const primary = isValidImageSrc(src) ? src.trim() : "";
  const fallback = isValidImageSrc(fallbackSrc) ? fallbackSrc.trim() : "";
  const initial = primary || fallback;

  const [activeSrc, setActiveSrc] = useState(initial);

  useEffect(() => {
    setActiveSrc(primary || fallback);
  }, [primary, fallback]);

  if (!activeSrc) return null;

  const handleError = () => {
    if (fallback && activeSrc !== fallback) {
      setActiveSrc(fallback);
    }
  };

  if (width && height) {
    return (
      <Image
        src={activeSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", className)}
        onError={handleError}
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <Image
        src={activeSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", className)}
        onError={handleError}
      />
    </div>
  );
}
