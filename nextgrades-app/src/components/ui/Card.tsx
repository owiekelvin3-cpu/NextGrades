
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
          "rounded-2xl bg-white dark:bg-[#112240] shadow-md dark:shadow-2xl border border-gray-100 dark:border-white/10 transition-all duration-400 hover:shadow-xl dark:hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)]",
          glass && "bg-white/70 dark:bg-[#0D1B2A]/70 backdrop-blur-2xl border-white/30 dark:border-white/15 shadow-2xl",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card };
