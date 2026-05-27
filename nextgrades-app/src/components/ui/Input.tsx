import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-deep-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent transition-all duration-300",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
