"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type MarketingCtaButtonsProps = {
  primaryLabel: string;
  secondaryLabel?: string;
  primaryHref?: string;
  secondaryHref?: string;
  align?: "start" | "center";
  className?: string;
};

const buttonClass =
  "min-h-[3.25rem] w-full px-5 text-base font-semibold leading-snug sm:w-auto sm:min-w-[12.5rem] sm:max-w-[20rem] sm:px-7";

/** Paired homepage CTAs — gold primary + ghost secondary on dark backgrounds. */
export function MarketingCtaButtons({
  primaryLabel,
  secondaryLabel,
  primaryHref = "/consultation",
  secondaryHref = "/programs",
  align = "start",
  className,
}: MarketingCtaButtonsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4",
        align === "center" && "items-center sm:justify-center",
        className
      )}
    >
      <Button variant="gold" size="lg" href={primaryHref} className={buttonClass}>
        {primaryLabel}
      </Button>
      {secondaryLabel ? (
        <Button variant="ghost" size="lg" href={secondaryHref} className={buttonClass}>
          <span className="text-center">{secondaryLabel}</span>
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
