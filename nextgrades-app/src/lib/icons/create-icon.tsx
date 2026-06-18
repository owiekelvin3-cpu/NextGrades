"use client";

import type { CSSProperties } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { cn } from "@/lib/utils";

export type LucideProps = {
  className?: string;
  size?: number | string;
  strokeWidth?: number;
  color?: string;
  fill?: string;
  stroke?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
};

export type LucideIcon = React.ComponentType<LucideProps>;

type IconOptions = { spin?: boolean };

export function createFaIcon(icon: IconDefinition, options?: IconOptions): LucideIcon {
  function FaLucideIcon({ className, size, style, color, fill: _fill, strokeWidth: _sw, stroke: _st, ...rest }: LucideProps) {
    const dimension = typeof size === "number" ? `${size}px` : size;
    return (
      <FontAwesomeIcon
        icon={icon}
        className={cn(options?.spin && "animate-spin", className)}
        style={{
          color,
          ...style,
          ...(dimension
            ? { width: dimension, height: dimension, fontSize: dimension }
            : undefined),
        }}
        aria-hidden={rest["aria-hidden"]}
        aria-label={rest["aria-label"]}
      />
    );
  }

  FaLucideIcon.displayName = `FaIcon(${icon.iconName})`;
  return FaLucideIcon;
}
