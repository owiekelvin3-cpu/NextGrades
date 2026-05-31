
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "outline" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant = "gold", size = "md", href, ...props }, ref) => {
    const variants = {
      primary: "bg-white dark:bg-gradient-to-br dark:from-[#1E3A5F] dark:to-[#0D1B2A] text-[#0D1B2A] dark:text-white hover:bg-gray-100 dark:hover:from-[#2A4A70] dark:hover:to-[#112240] transition-all duration-300 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-2xl",
      secondary: "bg-white dark:bg-gradient-to-br dark:from-[#1E3A5F] dark:to-[#0D1B2A] text-[#0D1B2A] dark:text-white hover:bg-gray-50 dark:hover:from-[#2A4A70] dark:hover:to-[#112240] transition-all duration-300 border border-gray-200 dark:border-white/10 shadow-md dark:shadow-2xl",
      gold: "bg-gradient-to-r from-[#D4AF37] to-[#F5A623] text-[#0D1B2A] hover:from-[#F5A623] hover:to-[#D4AF37] transition-all duration-300 font-semibold shadow-lg dark:shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-xl dark:hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]",
      outline: "border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0D1B2A] transition-all duration-300 shadow-sm hover:shadow-md",
      dark: "bg-[#0D1B2A] dark:bg-gradient-to-br dark:from-[#1E3A5F] dark:to-[#0D1B2A] text-white hover:bg-[#1A2F42] dark:hover:from-[#2A4A70] dark:hover:to-[#112240] transition-all duration-300 shadow-md dark:shadow-2xl",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-xl",
      md: "px-6 py-3 text-base rounded-xl",
      lg: "px-8 py-4 text-lg rounded-xl",
      xl: "px-10 py-5 text-xl rounded-xl",
    };

    const classes = cn(
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
      "whitespace-normal text-center leading-snug",
      "focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2",
      "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
      variants[variant],
      sizes[size],
      className
    );

    if (href) {
      const useNativeAnchor =
        href.startsWith("http") || href.startsWith("/api/") || href.startsWith("mailto:");

      if (useNativeAnchor) {
        return (
          <a
            href={href}
            className={classes}
            ref={ref as React.ForwardedRef<HTMLAnchorElement>}
            {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          />
        );
      }

      return (
        <Link
          href={href}
          className={classes}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        />
      );
    }

    return (
      <button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        className={classes}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
