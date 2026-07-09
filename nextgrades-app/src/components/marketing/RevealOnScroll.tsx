"use client";

import { ReactNode } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "scale";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  as?: "div" | "section";
};

const directionClass: Record<Direction, string> = {
  up: "reveal-up",
  down: "reveal-down",
  left: "reveal-left",
  right: "reveal-right",
  scale: "reveal-scale",
};

/** GPU-friendly scroll reveal - skipped when user prefers reduced motion. */
export function RevealOnScroll({
  children,
  className,
  delay = 0,
  direction = "up",
  as: Tag = "div",
}: Props) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.06 });

  return (
    <Tag
      ref={ref}
      className={cn("reveal", directionClass[direction], isVisible && "reveal-visible", className)}
      style={{ transitionDelay: isVisible ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
