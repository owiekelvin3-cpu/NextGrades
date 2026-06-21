
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import Link from "next/link";
import { theme as t } from "@/lib/theme/tokens";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}

const interactionBase =
  "transform-gpu will-change-transform transition-all duration-[250ms] ease-out " +
  "hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 " +
  "disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:active:scale-100";

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant = "gold", size = "md", href, type = "button", ...props }, ref) => {
    const variants = {
      primary:
        "bg-surface-elevated text-foreground border border-border-default shadow-sm " +
        "hover:bg-surface-muted hover:shadow-md " +
        "dark:bg-[var(--button-secondary-background)] dark:text-[var(--button-secondary-foreground)] dark:border-border-default dark:hover:bg-[var(--sidebar-surface)]",
      secondary:
        "bg-surface-muted text-foreground border border-border-default shadow-sm " +
        "hover:bg-surface-elevated hover:shadow-md " +
        "dark:bg-[var(--button-secondary-background)] dark:text-[var(--button-secondary-foreground)] dark:border-border-default dark:hover:bg-[var(--sidebar-surface)]",
      gold:
        "bg-[var(--brand-gold)] text-[var(--brand-navy)] font-semibold border border-[var(--brand-gold)]/25 " +
        "shadow-sm hover:bg-[var(--brand-gold-hover)] hover:shadow-md",
      outline:
        "border border-[var(--brand-gold)] text-[var(--brand-gold)] bg-transparent " +
        "hover:bg-[var(--brand-gold-muted)]",
      ghost:
        "border border-border-default bg-[var(--sidebar-surface)] text-foreground " +
        "hover:border-[var(--border-strong)] hover:bg-surface-subtle",
      dark:
        "bg-[var(--brand-navy)] text-white border border-transparent shadow-sm " +
        "hover:bg-[var(--brand-navy-muted)] hover:shadow-md",
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
      t.focusRing,
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
