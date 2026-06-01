"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ONLINE_IMAGE_FALLBACK } from "@/lib/marketing-images";
import { shouldOptimizeImage } from "@/lib/images/online-assets";
import { isValidImageSrc, resolveImageChain } from "@/lib/images/resolve";

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

/** Marketing image with local-first fallbacks; Next.js optimizes /public assets to AVIF/WebP. */
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
  const chain = [
    isValidImageSrc(src) ? src.trim() : null,
    isValidImageSrc(fallbackSrc) ? fallbackSrc!.trim() : null,
    ONLINE_IMAGE_FALLBACK,
  ].filter(Boolean) as string[];

  const [index, setIndex] = useState(0);
  const activeSrc = chain[Math.min(index, chain.length - 1)] ?? ONLINE_IMAGE_FALLBACK;

  useEffect(() => {
    setIndex(0);
  }, [src, fallbackSrc]);

  const handleError = () => {
    setIndex((i) => (i < chain.length - 1 ? i + 1 : i));
  };

  const optimized = shouldOptimizeImage(activeSrc);

  const imageProps = {
    src: activeSrc,
    alt,
    priority,
    fetchPriority: priority ? ("high" as const) : undefined,
    loading: priority ? undefined : ("lazy" as const),
    sizes,
    quality: priority ? 72 : 68,
    className: cn("object-cover", className),
    onError: handleError,
    unoptimized: !optimized,
  };

  if (width && height) {
    return <Image key={activeSrc} {...imageProps} width={width} height={height} />;
  }

  return (
    <div className={cn("relative overflow-hidden bg-surface-subtle", containerClassName)}>
      <Image key={activeSrc} {...imageProps} fill />
    </div>
  );
}

/** Non-component helper for pages that need a resolved src string. */
export function resolveMarketingSrc(src?: string | null, fallback?: string): string {
  return resolveImageChain(src, fallback, ONLINE_IMAGE_FALLBACK);
}
