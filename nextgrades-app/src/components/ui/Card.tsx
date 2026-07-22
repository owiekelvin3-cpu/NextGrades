
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  /** When false, disables hover lift/shadow (better for data tables and KPI grids). */
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = false, hoverable = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-card-border bg-card-background text-card-foreground",
          "shadow-[var(--card-shadow)] transition-[box-shadow,transform,border-color,background-color] duration-[250ms] ease-out transform-gpu",
          hoverable && "hover:shadow-md hover:-translate-y-0.5",
          glass && "glass backdrop-blur-xl",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card };
