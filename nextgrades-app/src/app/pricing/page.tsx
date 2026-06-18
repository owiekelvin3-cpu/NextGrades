"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PricingPlanCard, type PricingPlanCardPlan } from "@/components/pricing/PricingPlanCard";
import { CTABand } from "@/components/premium/CTABand";
import { MockupStatsBar } from "@/components/mockup/MockupStatsBar";
import {
  ChevronDown,
  Loader2,
  CalendarDays,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Star,
  BookOpen,
  Users,
} from "lucide-react";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useToast } from "@/context/ToastContext";
import { buildLoginUrl } from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";
import { section } from "@/lib/premium/tokens";
import { Badge } from "@/components/ui/Badge";

type CompareRow = {
  label: string;
  library?: string | boolean;
  group?: string | boolean;
  premium?: string | boolean;
  matura?: string | boolean;
  resource?: string | boolean;
};

type PlanAction = "checkout" | "resources" | "consultation";

const CHECKOUT_PLANS = new Set(["resource", "group", "premium"]);
const STAT_ICONS = [GraduationCap, Star, BookOpen, Users];

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

function CompareCell({ value, isDark }: { value: string | boolean | undefined; isDark: boolean }) {
  if (value === true) {
    return <CheckCircle2 className="mx-auto h-5 w-5 text-[#D4AF37]" aria-label="Ja" />;
  }
  if (value === false || value === undefined) {
    return <span className={isDark ? "text-gray-600" : "text-gray-300"}>—</span>;
  }
  return <span className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-600")}>{value}</span>;
}

function PricingContent() {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const mt = useMarketingTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();

  const localizedPlans = useLocalizedContent<PricingPlanCardPlan[]>("pricingPage.plans");
  const plans = Array.isArray(localizedPlans) ? localizedPlans : [];

  const statsRaw = useLocalizedContent<{ value: string; label: string }[]>("pricingPage.stats");
  const stats = (Array.isArray(statsRaw) ? statsRaw : []).map((s, i) => ({
    number: s.value,
    label: s.label,
    icon: STAT_ICONS[i] ?? GraduationCap,
  }));

  const faqsRaw = useLocalizedContent<{ question: string; answer: string }[]>("pricingPage.faqs");
  const faqs = Array.isArray(faqsRaw) ? faqsRaw : [];

  const compareRows = useLocalizedContent<CompareRow[]>("pricingPage.compareRows");
  const compareHeaders = useLocalizedContent<Record<string, string>>("pricingPage.compareHeaders");
  const planActions = useLocalizedContent<Record<string, string>>("pricingPage.planActions");
  const ctaTags = useLocalizedContent<string[]>("pricingPage.finalCtaTags");

  const hasSubscriptionPlans = plans.some((p) => !p.priceLabel && CHECKOUT_PLANS.has(p.id === "library" ? "resource" : p.id));

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
      const billing = isYearly ? "yearly" : "monthly";
      const checkoutUrl = `/checkout?plan=${stripePlan}&billing=${billing}`;
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
      toast.error(t("misc.errorGeneric", { defaultValue: "Etwas ist schiefgelaufen. Bitte erneut versuchen." }));
    } finally {
      setLoadingPlan(null);
    }
  };

  const cardLabels = {
    perMonth: t("pricing.perMonth"),
    perYear: t("pricing.perYear"),
    billedAnnually: t("pricing.billedAnnually"),
    getStarted: t("pricing.getStarted"),
    mostPopular: t("pricing.mostPopular"),
    includesPrefix: t("pricing.includesPrefix"),
    saveYearly: t("pricing.saveYearly"),
    includesHeading: t("pricing.includesHeading"),
    planBadges: t("pricing.planBadges", { returnObjects: true }) as Record<string, string>,
  };

  const planColumns = plans.map((p) => p.id);

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0D1B2A] pb-14 pt-site-nav text-white md:pb-20 md:pt-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_50%)]" />
          <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className={cn("relative z-10", section.container)}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl text-center"
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37] sm:text-sm">
                {t("pricingPage.plansEyebrow")}
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                {t("pricingPage.plansTitle")}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
                {t("pricingPage.plansSubtitle", { defaultValue: t("pricing.heroSubtitle") })}
              </p>
              <p className="mx-auto mt-4 max-w-xl text-sm font-medium text-[#D4AF37] sm:text-base">
                {t("pricingPage.valueProposition")}
              </p>

              {hasSubscriptionPlans && (
                <div
                  className={cn(
                    "mx-auto mt-10 inline-flex w-full max-w-md rounded-full border p-1.5",
                    "border-white/15 bg-white/5"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setIsYearly(false)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all touch-manipulation",
                      !isYearly ? "bg-white text-[#0D1B2A] shadow-lg" : "text-gray-400 hover:text-white"
                    )}
                  >
                    <CalendarDays className="h-4 w-4 shrink-0 opacity-70" />
                    {t("pricing.monthly")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsYearly(true)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all touch-manipulation",
                      isYearly
                        ? "bg-[#D4AF37] text-[#0D1B2A] shadow-md shadow-[#D4AF37]/25"
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    <Sparkles className="h-4 w-4 shrink-0 opacity-80" />
                    {t("pricing.yearly")}
                    <span
                      className={cn(
                        "hidden rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline",
                        isYearly ? "bg-black/10" : "bg-[#D4AF37]/15 text-[#D4AF37]"
                      )}
                    >
                      {t("pricing.yearlyDiscount")}
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {stats.length > 0 && <MockupStatsBar stats={stats} />}

        {/* Trust strip */}
        <section className={cn("py-10 md:py-12", mt.isDark ? "bg-[#112240]" : "bg-[#FAFBFC]")}>
          <div className={cn(section.container, "text-center")}>
            <h2 className={cn("text-xl font-bold sm:text-2xl", mt.isDark ? "text-white" : "text-[#0D1B2A]")}>
              {t("pricingPage.trustedTitle")}
            </h2>
            <p className={cn("mt-2 text-sm sm:text-base", mt.isDark ? "text-gray-400" : "text-gray-600")}>
              {t("pricingPage.trustedDesc")}
            </p>
          </div>
        </section>

        {/* Plan cards */}
        <section className={cn("pb-16 pt-4 md:pb-24 md:pt-10", mt.isDark ? "bg-[#0D1B2A]" : "bg-white")}>
          <div className={section.container}>
            <div
              className={cn(
                "grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch lg:gap-6",
                plans.length >= 4 ? "xl:grid-cols-4" : plans.length === 3 ? "lg:grid-cols-3" : ""
              )}
            >
              {plans.map((plan, planIndex) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: planIndex * 0.08 }}
                  className="flex min-w-0"
                >
                  <PricingPlanCard
                    plan={plan}
                    isYearly={isYearly}
                    isLoading={loadingPlan === plan.id}
                    previousPlanName={planIndex > 0 ? plans[planIndex - 1]?.name : undefined}
                    onSelect={() => handlePlanSelect(plan)}
                    labels={{
                      ...cardLabels,
                      getStarted:
                        (planActions && typeof planActions === "object" && planActions[plan.id]) ||
                        cardLabels.getStarted,
                    }}
                    isDark={mt.isDark}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        {Array.isArray(compareRows) && compareRows.length > 0 && (
          <section className={cn("py-14 md:py-20", mt.isDark ? "bg-[#112240]/60" : "bg-[#F5F7FA]")}>
            <div className={section.container}>
              <h2
                className={cn(
                  "mb-10 text-center text-2xl font-bold tracking-tight sm:text-3xl",
                  mt.isDark ? "text-white" : "text-[#0D1B2A]"
                )}
              >
                {t("pricing.compareTitle")}
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-xl">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className={mt.isDark ? "bg-[#0D1B2A]" : "bg-white"}>
                      <th className="px-4 py-4 font-semibold sm:px-6">
                        {compareHeaders?.features ?? "Merkmale"}
                      </th>
                      {planColumns.map((col) => (
                        <th
                          key={col}
                          className={cn(
                            "px-3 py-4 text-center font-semibold sm:px-4",
                            mt.isDark ? "text-[#D4AF37]" : "text-[#0D1B2A]"
                          )}
                        >
                          {compareHeaders?.[col] ?? col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map((row, i) => (
                      <tr
                        key={row.label}
                        className={cn(
                          "border-t",
                          mt.isDark ? "border-white/10 bg-[#0D1B2A]/50" : "border-gray-100 bg-white",
                          i % 2 === 1 && (mt.isDark ? "bg-[#112240]/40" : "bg-gray-50/80")
                        )}
                      >
                        <td className={cn("px-4 py-3.5 font-medium sm:px-6", mt.isDark ? "text-gray-200" : "text-gray-800")}>
                          {row.label}
                        </td>
                        {planColumns.map((col) => (
                          <td key={col} className="px-3 py-3.5 text-center sm:px-4">
                            <CompareCell
                              value={row[col as keyof CompareRow] as string | boolean | undefined}
                              isDark={mt.isDark}
                            />
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
        <section className={cn("py-14 md:py-20", mt.isDark ? "bg-[#0D1B2A]" : "bg-white")}>
          <div className="mx-auto max-w-2xl px-5 sm:px-6">
            <h2
              className={cn(
                "mb-10 text-center text-2xl font-bold tracking-tight sm:text-3xl",
                mt.isDark ? "text-white" : "text-[#0D1B2A]"
              )}
            >
              {t("pricing.faqHeading")}
            </h2>
            <div className="space-y-1">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className={cn(
                        "flex min-h-12 w-full items-center justify-between gap-4 py-3 text-left touch-manipulation",
                        !isOpen && "border-b",
                        !isOpen && (mt.isDark ? "border-white/10" : "border-gray-200/80")
                      )}
                    >
                      <span className={cn("text-base font-semibold", mt.isDark ? "text-white" : "text-[#0D1B2A]")}>
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 shrink-0 transition-transform duration-200",
                          mt.isDark ? "text-gray-400" : "text-gray-500",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div
                            className={cn(
                              "mb-3 rounded-2xl px-5 py-4 text-sm leading-relaxed",
                              mt.isDark ? "bg-white/[0.06] text-gray-300" : "bg-gray-100/90 text-gray-600"
                            )}
                          >
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={cn("pb-4", mt.isDark ? "bg-[#0D1B2A]" : "bg-white")}>
          <div className={section.container}>
            {Array.isArray(ctaTags) && ctaTags.length > 0 && (
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                {ctaTags.map((tag) => (
                  <Badge key={tag} variant="gold" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </section>
        <CTABand
          title={t("pricingPage.finalCtaTitle")}
          subtitle={t("pricingPage.finalCtaDesc")}
          button={t("pricingPage.finalCtaButton")}
          secondaryButton={t("pricing.getStarted")}
          secondaryHref="/pricing"
        />
      </main>

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  const mt = useMarketingTheme();
  return (
    <Suspense
      fallback={
        <div className={cn("flex min-h-screen items-center justify-center", mt.page)}>
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
