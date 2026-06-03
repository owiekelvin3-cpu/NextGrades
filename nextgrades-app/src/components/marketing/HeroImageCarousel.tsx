"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { HOME_HERO_CAROUSEL_IMAGES } from "@/lib/marketing-images";

const INTERVAL_MS = 2000;

type Props = {
  alt: string;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  priority?: boolean;
};

export function HeroImageCarousel({
  alt,
  className,
  containerClassName = "absolute inset-0",
  sizes = "(max-width: 1024px) 90vw, 560px",
  priority = true,
}: Props) {
  const slides = HOME_HERO_CAROUSEL_IMAGES;
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, slides.length]);

  return (
    <div
      className={cn("relative overflow-hidden bg-surface-subtle", containerClassName)}
      aria-roledescription="carousel"
      aria-label={alt}
    >
      {slides.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === index ? alt : ""}
          fill
          priority={priority && i === 0}
          sizes={sizes}
          quality={75}
          className={cn(
            "object-cover object-center transition-opacity duration-700 ease-in-out",
            i === index ? "opacity-100" : "opacity-0",
            className
          )}
          aria-hidden={i !== index}
        />
      ))}
      <div className="absolute bottom-3 left-1/2 z-[1] flex -translate-x-1/2 gap-1.5" aria-hidden>
        {slides.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-5 bg-[#D4AF37]" : "w-1.5 bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
