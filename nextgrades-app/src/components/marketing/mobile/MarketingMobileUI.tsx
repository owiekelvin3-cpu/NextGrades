import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { mobile } from "@/lib/mobile/tokens";
import { cn } from "@/lib/utils";

export function MarketingPillBadge({
  children,
  className,
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <span
      className={cn(
        mobile.pill,
        dark && "bg-white/10 text-[#D4AF37]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function MarketingDualCTA({
  primary,
  secondary,
  className,
}: {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:gap-4 md:flex md:flex-row", className)}>
      {primary}
      {secondary}
    </div>
  );
}

export function MarketingPillButton({
  href,
  children,
  className,
  variant = "gold",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "gold" | "outline" | "inverse";
}) {
  const styles = {
    gold: "bg-gradient-to-r from-[#D4AF37] to-[#F5A623] text-[#0D1B2A] shadow-lg",
    outline: "border-2 border-gray-200 bg-white text-[#0D1B2A]",
    inverse: "bg-white text-[#0D1B2A] shadow-md",
  };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 font-semibold transition-transform active:scale-[0.98] touch-manipulation",
        mobile.button,
        styles[variant],
        className
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4 shrink-0" />
    </Link>
  );
}

export function MarketingSection({
  children,
  className,
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <section
      className={cn(
        "marketing-mobile-section",
        mobile.sectionY,
        dark ? "bg-[#0D1B2A]" : "bg-white",
        className
      )}
    >
      <div className={cn("mx-auto max-w-7xl", mobile.pageX)}>{children}</div>
    </section>
  );
}
