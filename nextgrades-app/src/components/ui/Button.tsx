import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "outline" | "ghost" | "dark" | "onDark" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}

const variantClass = {
  gold: "theme-btn-gold",
  primary: "theme-btn-secondary",
  secondary: "theme-btn-secondary",
  outline: "theme-btn-outline",
  ghost: "theme-btn-ghost",
  dark: "theme-btn-dark",
  onDark: "theme-btn-on-dark",
  danger: "theme-btn-danger",
} as const;

const sizes = {
  sm: "min-h-10 px-4 py-2 text-sm rounded-xl",
  md: "min-h-12 px-6 py-3 text-base rounded-2xl",
  lg: "min-h-[3.25rem] px-8 py-3.5 text-lg rounded-2xl",
  xl: "min-h-14 px-10 py-4 text-xl rounded-2xl",
};

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant = "gold", size = "md", href, type = "button", ...props }, ref) => {
    const classes = cn(
      "theme-btn-interaction whitespace-normal",
      variantClass[variant],
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
