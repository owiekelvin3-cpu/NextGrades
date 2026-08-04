"use client";

import { useEffect, useState } from "react";

type Props = {
  value: number;
  duration?: number;
  format?: (n: number) => string;
};

export function AdminAnimatedNumber({ value, duration = 900, format }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{format ? format(display) : display.toLocaleString("de-DE")}</>;
}
