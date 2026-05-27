"use client";

import { useEffect, useState } from "react";

interface StatCounterProps {
  target: number;
  suffix?: string;
  label: string;
}

export function StatCounter({ target, suffix = "", label }: StatCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const duration = 2000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target]);

  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-deep-navy to-soft-gold bg-clip-text text-transparent mb-2">
        {count}{suffix}
      </div>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}
