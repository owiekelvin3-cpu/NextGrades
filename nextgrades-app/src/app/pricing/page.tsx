"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PricingPlanCard, type PricingPlanCardPlan } from "@/components/pricing/PricingPlanCard";
import { CTABand } from "@/components/premium/CTABand";
import { FAQSection } from "@/components/premium/FAQSection";
import { SectionHeader } from "@/components/premium/SectionHeader";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useToast } from "@/context/ToastContext";
import { buildLoginUrl } from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";
import { section, type, hero } from "@/lib/premium/tokens";

type CompareRow = {
  label: string;
  library?: string | boolean;
  group?: string | boolean;
  premium?: string | boolean;
  matura?: string | boolean;
};

type PlanAction = "checkout" | "resources" | "consultation";

const CHECKOUT_PLANS = new Set(["resource", "group", "premium"]);

function planActionType(planId: string): PlanAction {
  if (planId === "library" || planId === "resource") return "resources";
  if (planId === "matura") return "consultation";
  if (CHECKOUT_PLANS.has(planId)) return "checkout";
  return "consultation";
}

function checkoutPlanId(planId: string): string {
  if (planId === "library") return "resource";
  return planId;
}

function CompareCell({ value }: { value: string | boolean | undefined }) {
  if (value === true) {
    return <CheckCircle2 className="mx-auto h-5 w-5 text-[#D4AF37]" aria-label="Ja" />;
  }
  if (value === false || value === undefined) {
    return <span className="text-gray-300">—</span>;
  }
  return <span className="text-sm text-gray-600">{value}</span>;
}

function PricingContent() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();

  const localizedPlans = useLocalizedContent<PricingPlanCardPlan[]>("pricingPage.plans");
  const plans = Array.isArray(localizedPlans) ? localizedPlans : [];

  const faqsRaw = useLocalizedContent<{ question: string; answer: string }[]>("pricingPage.faqs");
  const faqs = Array.isArray(faqsRaw) ? faqsRaw : [];

  const compareRows = useLocalizedContent<CompareRow[]>("pricingPage.compareRows");
  const compareHeaders = useLocalizedContent<Record<string, string>>("pricingPage.compareHeaders");
  const planActions = useLocalizedContent<Record<string, string>>("pricingPage.planActions");

  const handlePlanSelect = async (plan: PricingPlanCardPlan) => {
    const action = planActionType(plan.id);
    if (action === "resources") {
      router.push("/resources");
      return;
    }
    if (action === "consultation") {
      router.push("/consultation");
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const stripePlan = checkoutPlanId(plan.id);
      const checkoutUrl = `/checkout?plan=${stripePlan}&billing=monthly`;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push(buildLoginUrl(checkoutUrl));
        return;
      }
      router.push(checkoutUrl);
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("misc.errorGeneric"));
    } finally {
      setLoadingPlan(null);
    }
  };

  const planColumns = plans.map((p) => p.id);

  return (
    <div className="marketing-page-root flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className={cn("relative bg-[#0D1B2A] text-white", hero.section)}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,175,55,0.12),transparent_55%)]" />
          <div className={hero.innerCentered}>
            <p className={`${type.eyebrow} mb-4`}>{t("pricingPage.plansEyebrow")}</p>
            <h1 className={type.h1}>{t("pricingPage.plansTitle")}</h1>
            <p className={`${type.bodyDark} mx-auto mt-5 max-w-2xl`}>
              {t("pricingPage.plansSubtitle", { defaultValue: t("pricing.heroSubtitle") })}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm text-gray-400">
              {t("pricingPage.valueProposition")}
            </p>
          </div>
        </section>

        {/* Plan cards */}
        <section className={section.pyCompact}>
          <div className={section.container}>
            <div
              className={cn(
                "grid gap-5 sm:grid-cols-2 sm:gap-6",
                plans.length >= 4 ? "xl:grid-cols-4" : plans.length === 3 ? "lg:grid-cols-3" : ""
              )}
            >
              {plans.map((plan) => (
                <PricingPlanCard
                  key={plan.id}
                  plan={plan}
                  isLoading={loadingPlan === plan.id}
                  onSelect={() => handlePlanSelect(plan)}
                  popularLabel={t("pricing.mostPopular")}
                  ctaLabel={
                    (planActions && typeof planActions === "object" && planActions[plan.id]) ||
                    t("pricing.getStarted")
                  }
                />
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-gray-500">
              {t("pricingPage.trustedDesc")}
            </p>
          </div>
        </section>

        {/* Comparison table */}
        {Array.isArray(compareRows) && compareRows.length > 0 && (
          <section className={cn(section.pyCompact, "border-t border-gray-200/80 bg-white")}>
            <div className={section.container}>
              <SectionHeader title={t("pricing.compareTitle")} align="center" className="mb-10" />
              <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-default bg-surface-muted">
                      <th className="px-5 py-4 font-semibold text-[#0D1B2A]">
                        {compareHeaders?.features ?? "Merkmale"}
                      </th>
                      {planColumns.map((col) => (
                        <th key={col} className="px-4 py-4 text-center font-semibold text-[#0D1B2A]">
                          {compareHeaders?.[col] ?? col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map((row, i) => (
                      <tr
                        key={row.label}
                        className={cn("border-b border-border-default last:border-0", i % 2 === 1 && "bg-surface-muted/60")}
                      >
                        <td className="px-5 py-3.5 font-medium text-gray-800">{row.label}</td>
                        {planColumns.map((col) => (
                          <td key={col} className="px-4 py-3.5 text-center">
                            <CompareCell value={row[col as keyof CompareRow] as string | boolean | undefined} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <FAQSection
            eyebrow={t("pricing.faqEyebrow", { defaultValue: "FAQ" })}
            title={t("pricing.faqHeading")}
            items={faqs}
            muted
          />
        )}

        <CTABand
          title={t("pricingPage.finalCtaTitle")}
          subtitle={t("pricingPage.finalCtaDesc")}
          button={t("pricingPage.finalCtaButton")}
          secondaryButton={t("home.explorePrograms")}
          secondaryHref="/programs"
        />
      </main>

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
