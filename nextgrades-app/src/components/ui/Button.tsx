
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "outline" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}

/** Apple-style interaction: subtle lift, scale, shadow — 250ms ease-out */
const interactionBase =
  "transform-gpu will-change-transform transition-all duration-[250ms] ease-out " +
  "hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 " +
  "disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:active:scale-100";

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant = "gold", size = "md", href, type = "button", ...props }, ref) => {
    const variants = {
      primary:
        "bg-white text-[#0D1B2A] border border-gray-200/80 shadow-md shadow-black/5 " +
        "hover:shadow-xl hover:shadow-black/10 hover:border-gray-300 " +
        "dark:bg-gradient-to-br dark:from-[#1E3A5F] dark:to-[#0D1B2A] dark:text-white dark:border-white/10 " +
        "dark:shadow-lg dark:shadow-black/30 dark:hover:shadow-2xl dark:hover:from-[#2A4A70] dark:hover:to-[#112240]",
      secondary:
        "bg-[#FAFAFA] text-[#0D1B2A] border border-gray-200/80 shadow-sm shadow-black/5 " +
        "hover:shadow-lg hover:bg-white " +
        "dark:bg-white/5 dark:text-white dark:border-white/15 dark:hover:bg-white/10 dark:hover:shadow-xl",
      gold:
        "bg-gradient-to-r from-[#D4AF37] to-[#F5A623] text-[#0D1B2A] font-semibold " +
        "shadow-lg shadow-[#D4AF37]/25 hover:shadow-xl hover:shadow-[#D4AF37]/35 " +
        "hover:from-[#E0BC42] hover:to-[#FFB84D] border border-[#D4AF37]/20",
      outline:
        "border-2 border-[#D4AF37] text-[#D4AF37] bg-transparent " +
        "shadow-sm hover:bg-[#D4AF37] hover:text-[#0D1B2A] hover:shadow-lg hover:shadow-[#D4AF37]/20",
      dark:
        "bg-[#0D1B2A] text-white shadow-md shadow-black/20 " +
        "hover:bg-[#152535] hover:shadow-xl " +
        "dark:bg-gradient-to-br dark:from-[#1E3A5F] dark:to-[#0D1B2A] dark:hover:from-[#2A4A70] dark:hover:to-[#112240]",
    };

    const sizes = {
      sm: "min-h-10 px-4 py-2 text-sm rounded-xl",
      md: "min-h-12 px-6 py-3 text-base rounded-2xl",
      lg: "min-h-[3.25rem] px-8 py-3.5 text-lg rounded-2xl",
      xl: "min-h-14 px-10 py-4 text-xl rounded-2xl",
    };

    const classes = cn(
      "inline-flex items-center justify-center gap-2 font-medium",
      "whitespace-normal text-center leading-snug",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
      interactionBase,
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
        type={type}
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        className={classes}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
