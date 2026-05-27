
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "outline" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "gold", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-white text-[#0D1B2A] hover:bg-gray-100 transition-all border border-gray-200",
      secondary: "bg-white text-[#0D1B2A] hover:bg-gray-50 transition-all border border-gray-200",
      gold: "bg-[#D4AF37] text-[#0D1B2A] hover:bg-[#F5A623] transition-all font-semibold",
      outline: "border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0D1B2A] transition-all",
      dark: "bg-[#0D1B2A] text-white hover:bg-[#1A2F42] transition-all",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-lg",
      md: "px-6 py-3 text-base rounded-lg",
      lg: "px-8 py-4 text-lg rounded-lg",
      xl: "px-10 py-5 text-xl rounded-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
