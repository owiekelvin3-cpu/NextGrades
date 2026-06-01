"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PricingPlanCard, type PricingPlanCardPlan } from "@/components/pricing/PricingPlanCard";
import { ChevronDown, Loader2, CalendarDays, Sparkles } from "lucide-react";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useToast } from "@/context/ToastContext";
import { buildLoginUrl } from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";

function PricingContent() {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const mt = useMarketingTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();

  const handleGetStarted = async (plan: { id: string }) => {
    setLoadingPlan(plan.id);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push(buildLoginUrl(`/checkout?plan=${plan.id}&billing=${isYearly ? "yearly" : "monthly"}`));
        return;
      }
      router.push(`/checkout?plan=${plan.id}&billing=${isYearly ? "yearly" : "monthly"}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("misc.errorGeneric", { defaultValue: "Something went wrong. Please try again." }));
    } finally {
      setLoadingPlan(null);
    }
  };

  type LocalizedPlan = PricingPlanCardPlan;

  const STRIPE_BY_PLAN: Record<
    string,
    { stripeMonthlyPriceId: string; stripeYearlyPriceId: string; productType: string }
  > = {
    resource: {
      stripeMonthlyPriceId: "price_monthly_resource",
      stripeYearlyPriceId: "price_yearly_resource",
      productType: "subscription",
    },
    group: {
      stripeMonthlyPriceId: "price_monthly_group",
      stripeYearlyPriceId: "price_yearly_group",
      productType: "subscription",
    },
    premium: {
      stripeMonthlyPriceId: "price_monthly_premium",
      stripeYearlyPriceId: "price_yearly_premium",
      productType: "subscription",
    },
  };

  const localizedPlans = useLocalizedContent<LocalizedPlan[]>("pricingPage.plans");
  const plans = (Array.isArray(localizedPlans) ? localizedPlans : []).map((plan) => ({
    ...plan,
    ...STRIPE_BY_PLAN[plan.id],
  }));

  const faqsRaw = useLocalizedContent<{ question: string; answer: string }[]>("pricingPage.faqs");
  const faqs = Array.isArray(faqsRaw) ? faqsRaw : [];

  const cardLabels = {
    perMonth: t("pricing.perMonth"),
    perYear: t("pricing.perYear"),
    billedAnnually: t("pricing.billedAnnually", { defaultValue: "billed annually" }),
    getStarted: t("pricing.getStarted"),
    mostPopular: t("pricing.mostPopular"),
    includesPrefix: t("pricing.includesPrefix", {
      defaultValue: "Includes everything in {plan}, plus:",
    }),
    saveYearly: t("pricing.saveYearly", { defaultValue: "Save 2 months vs monthly" }),
  };

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1">
        {/* Light hero + billing toggle — reference layout */}
        <section
          className={cn(
            "relative overflow-hidden pt-site-nav pb-10 md:pb-14 md:pt-28",
            mt.isDark
              ? "bg-gradient-to-b from-[#0D1B2A] via-[#112240] to-[#0D1B2A]"
              : "bg-gradient-to-b from-[#EEF2F8] via-[#F8FAFC] to-white"
          )}
        >
          {!mt.isDark && (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-[#D4AF37]/8 blur-3xl" />
              <div className="absolute right-1/4 top-20 h-64 w-64 rounded-full bg-[#0D1B2A]/5 blur-3xl" />
            </div>
          )}

          <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1
                className={cn(
                  "text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl",
                  mt.isDark ? "text-white" : "text-[#0D1B2A]"
                )}
              >
                {t("pricing.title", { defaultValue: "Our Pricing" })}
              </h1>
              <p
                className={cn(
                  "mx-auto mt-4 max-w-xl text-base leading-relaxed sm:text-lg",
                  mt.isDark ? "text-gray-300" : "text-gray-600"
                )}
              >
                {t("pricing.heroSubtitle")}
              </p>

              {/* Pill segmented toggle */}
              <div
                className={cn(
                  "mx-auto mt-8 inline-flex w-full max-w-md items-center gap-1 rounded-full p-1.5 shadow-inner",
                  mt.isDark
                    ? "border border-white/10 bg-white/5"
                    : "border border-gray-200/80 bg-white/80 backdrop-blur-sm"
                )}
              >
                <button
                  type="button"
                  onClick={() => setIsYearly(false)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-200 touch-manipulation",
                    !isYearly
                      ? mt.isDark
                        ? "bg-white text-[#0D1B2A] shadow-lg"
                        : "bg-white text-[#0D1B2A] shadow-md"
                      : mt.isDark
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-500 hover:text-[#0D1B2A]"
                  )}
                >
                  <CalendarDays className="h-4 w-4 shrink-0 opacity-70" />
                  {t("pricing.monthly")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsYearly(true)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-200 touch-manipulation",
                    isYearly
                      ? "bg-[#D4AF37] text-[#0D1B2A] shadow-md shadow-[#D4AF37]/25"
                      : mt.isDark
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-500 hover:text-[#0D1B2A]"
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
            </motion.div>
          </div>
        </section>

        {/* Plan cards */}
        <section className={cn("pb-16 pt-4 md:pb-24 md:pt-8", mt.isDark ? "bg-[#0D1B2A]" : "bg-white")}>
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:items-stretch md:gap-5 lg:gap-6">
              {plans.map((plan, planIndex) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: planIndex * 0.08 }}
                  className="flex"
                >
                  <PricingPlanCard
                    plan={plan}
                    isYearly={isYearly}
                    isLoading={loadingPlan === plan.id}
                    previousPlanName={planIndex > 0 ? plans[planIndex - 1]?.name : undefined}
                    onSelect={() => handleGetStarted(plan)}
                    labels={cardLabels}
                    isDark={mt.isDark}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ — reference minimal accordion */}
        <section
          className={cn(
            "py-14 md:py-20",
            mt.isDark ? "bg-[#112240]/50" : "bg-[#FAFBFC]"
          )}
        >
          <div className="mx-auto max-w-2xl px-5 sm:px-6">
            <h2
              className={cn(
                "mb-10 text-center text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl",
                mt.isDark ? "text-white" : "text-[#0D1B2A]"
              )}
            >
              {t("pricing.faqHeading", { defaultValue: "Frequently asked questions." })}
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
                      <span
                        className={cn(
                          "text-base font-semibold",
                          mt.isDark ? "text-white" : "text-[#0D1B2A]"
                        )}
                      >
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
                              mt.isDark
                                ? "bg-white/[0.06] text-gray-300"
                                : "bg-gray-100/90 text-gray-600"
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
