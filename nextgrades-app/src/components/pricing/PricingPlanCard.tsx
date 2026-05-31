"use client";

import { CheckCircle2, ArrowRight, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type PricingPlanCardPlan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  highlighted: boolean;
  features: string[];
};

type Props = {
  plan: PricingPlanCardPlan;
  isYearly: boolean;
  isLoading: boolean;
  previousPlanName?: string;
  onSelect: () => void;
  labels: {
    perMonth: string;
    perYear: string;
    billedAnnually: string;
    getStarted: string;
    mostPopular: string;
    includesPrefix: string;
    saveYearly: string;
  };
  isDark?: boolean;
};

const PLAN_BADGE: Record<string, string> = {
  resource: "RESOURCES",
  group: "GROUP",
  premium: "PREMIUM",
};

const TOP_GRADIENT: Record<string, string> = {
  resource:
    "from-[#F8F9FB] via-white to-[#D4AF37]/[0.07] dark:from-[#112240] dark:via-[#0D1B2A] dark:to-[#D4AF37]/10",
  group:
    "from-[#D4AF37]/20 via-[#F5A623]/10 to-white dark:from-[#D4AF37]/25 dark:via-[#112240] dark:to-[#0D1B2A]",
  premium:
    "from-[#0D1B2A]/[0.06] via-[#F5F6F8] to-[#D4AF37]/10 dark:from-[#0D1B2A] dark:via-[#112240] dark:to-[#D4AF37]/15",
};

function incrementalFeatures(features: string[]) {
  const plus = features.filter((f) => !/^everything from/i.test(f));
  return plus.length > 0 ? plus : features;
}

export function PricingPlanCard({
  plan,
  isYearly,
  isLoading,
  previousPlanName,
  onSelect,
  labels,
  isDark = false,
}: Props) {
  const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const badge = PLAN_BADGE[plan.id] ?? plan.name.toUpperCase();
  const gradient = TOP_GRADIENT[plan.id] ?? TOP_GRADIENT.resource;
  const listedFeatures = previousPlanName
    ? incrementalFeatures(plan.features)
    : plan.features;

  return (
    <article
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-3xl border shadow-[0_4px_40px_rgba(13,27,42,0.08)] transition-shadow hover:shadow-[0_8px_48px_rgba(13,27,42,0.12)] dark:shadow-[0_4px_40px_rgba(0,0,0,0.35)]",
        plan.highlighted
          ? "border-[#D4AF37]/50 ring-1 ring-[#D4AF37]/30 md:scale-[1.02] md:z-10"
          : isDark
            ? "border-white/10"
            : "border-gray-200/80"
      )}
    >
      {/* Gradient header — reference card top */}
      <div className={cn("relative flex flex-col px-6 pb-6 pt-6 sm:px-7 sm:pt-7 bg-gradient-to-br", gradient)}>
        {plan.highlighted && (
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#D4AF37]/20 blur-3xl" />
        )}

        <div className="relative mb-5 flex items-start justify-between gap-3">
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
              plan.highlighted
                ? "bg-[#0D1B2A] text-white dark:bg-[#D4AF37] dark:text-[#0D1B2A]"
                : isDark
                  ? "bg-white/10 text-gray-200"
                  : "bg-[#0D1B2A]/8 text-[#0D1B2A]"
            )}
          >
            {badge}
          </span>
          {plan.highlighted && (
            <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0D1B2A]">
              {labels.mostPopular}
            </span>
          )}
        </div>

        <div className="relative mb-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
          <span
            className={cn(
              "text-5xl font-extrabold tracking-tight",
              isDark ? "text-white" : "text-[#0D1B2A]"
            )}
          >
            €{price}
          </span>
          <span className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-500")}>
            /{isYearly ? labels.perYear : labels.perMonth}
            {isYearly && (
              <span className="ml-1 hidden sm:inline">({labels.billedAnnually})</span>
            )}
          </span>
        </div>

        {isYearly && (
          <p className="relative mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] sm:hidden">
            <Zap className="h-3.5 w-3.5" />
            {labels.saveYearly}
          </p>
        )}

        <p className={cn("relative mb-6 text-sm leading-relaxed", isDark ? "text-gray-300" : "text-gray-600")}>
          {plan.description}
        </p>

        <Button
          variant={plan.highlighted ? "gold" : "dark"}
          size="lg"
          className={cn(
            "relative w-full rounded-2xl",
            !plan.highlighted && isDark && "bg-white/10 hover:bg-white/15 border border-white/15"
          )}
          disabled={isLoading}
          onClick={onSelect}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              {labels.getStarted}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* White feature footer — reference card bottom */}
      <div
        className={cn(
          "flex flex-1 flex-col border-t px-6 py-6 sm:px-7",
          isDark ? "border-white/10 bg-[#0D1B2A]/40" : "border-gray-100 bg-white"
        )}
      >
        {previousPlanName ? (
          <p className={cn("mb-4 text-xs font-semibold", isDark ? "text-gray-400" : "text-gray-500")}>
            {labels.includesPrefix.replace("{plan}", previousPlanName)}
          </p>
        ) : (
          <p className={cn("mb-4 text-xs font-semibold", isDark ? "text-gray-400" : "text-gray-500")}>
            {plan.features.length > 0 ? "Includes:" : ""}
          </p>
        )}

        <ul className="space-y-3">
          {listedFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37]" />
              </span>
              <span className={isDark ? "text-gray-300" : "text-gray-700"}>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
