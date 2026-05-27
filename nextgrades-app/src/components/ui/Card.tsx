
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
          "rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-300",
          glass && "bg-white/70 backdrop-blur-xl border-white/20 shadow-2xl",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card };
