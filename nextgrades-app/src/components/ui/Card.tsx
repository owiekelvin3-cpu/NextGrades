
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-card-border bg-card-background text-card-foreground",
          "shadow-[var(--card-shadow)] transition-[box-shadow,transform,border-color,background-color] duration-[250ms] ease-out transform-gpu",
          "hover:shadow-md hover:-translate-y-0.5",
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
