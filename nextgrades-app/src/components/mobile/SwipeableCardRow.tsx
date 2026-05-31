"use client";

import { mobile } from "@/lib/mobile/tokens";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  desktopCols?: 2 | 3 | 4 | 5;
};

const colClass = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
} as const;

export function SwipeableCardRow({ children, className, desktopCols = 3 }: Props) {
  return (
    <div className={cn(mobile.swipeRow, colClass[desktopCols], "md:gap-4", className)}>
      {children}
    </div>
  );
}

export function SwipeableCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn(mobile.swipeCard, className)}>{children}</div>;
}
