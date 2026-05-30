"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, ArrowRight, Star, Loader2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useToast } from "@/context/ToastContext";
import { buildLoginUrl } from "@/lib/auth/redirect";

function PricingContent() {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();

  const handleGetStarted = async (plan: { id: string }) => {
    setLoading(true);
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push(buildLoginUrl(`/checkout?plan=${plan.id}&billing=${isYearly ? "yearly" : "monthly"}`));
        return;
      }

      router.push(`/checkout?plan=${plan.id}&billing=${isYearly ? "yearly" : "monthly"}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("misc.errorGeneric", { defaultValue: "Something went wrong. Please try again." }));
    } finally {
      setLoading(false);
    }
  };

  type LocalizedPlan = {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    highlighted: boolean;
    features: string[];
  };

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

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge variant="gold" className="mb-6 px-4 py-2 rounded-full">
              💎 {t("pricing.badge")}
            </Badge>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
              {t("pricing.heroTitle")}
            </h1>
            <p className={`text-xl max-w-2xl mx-auto mb-10 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              {t("pricing.heroSubtitle")}
            </p>
            
            <div className="inline-flex items-center gap-3 bg-white dark:bg-[#112240] p-1.5 rounded-full shadow-sm border border-gray-200 dark:border-white/10">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-8 py-3 rounded-full font-medium transition-all ${
                  !isYearly ? "bg-[#0D1B2A] text-white" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {t("pricing.monthly")}
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-8 py-3 rounded-full font-medium transition-all ${
                  isYearly ? "bg-[#D4AF37] text-[#0D1B2A]" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {t("pricing.yearly")} <span className="text-sm ml-2 opacity-90">{t("pricing.yearlyDiscount")}</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Pricing Cards */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={plan.highlighted ? "md:-mt-6 md:-mb-6" : ""}
              >
                <Card
                  className={`p-8 h-full flex flex-col relative overflow-hidden transition-all duration-300 ${
                    plan.highlighted 
                      ? "border-2 border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/20 z-10" 
                      : theme === "dark" ? "border border-white/10" : "border border-gray-200"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 right-0">
                      <Badge variant="gold" className="rounded-tl-none rounded-tr-3xl rounded-bl-3xl px-5 py-2 font-bold text-sm">
                        {t("pricing.mostPopular")}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                      {plan.name}
                    </h3>
                    <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-extrabold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                        €{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
                        /{isYearly ? t("pricing.perYear") : t("pricing.perMonth")}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 mb-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                          <span className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                      variant={plan.highlighted ? "gold" : "dark"}
                      size="xl"
                      className="w-full rounded-full"
                      disabled={loading}
                      onClick={() => handleGetStarted(plan)}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <>
                          {t("pricing.getStarted")} <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Banner */}
        <section className={`py-16 ${theme === "dark" ? "bg-[#112240]" : "bg-[#FAFAFA]"}`}>
          <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row items-center gap-8"
            >
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-6 h-6 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </div>
              <div className="flex-1">
                <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"} mb-2`}>
                  {t("pricingPage.trustedTitle")}
                </h3>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  {t("pricingPage.trustedDesc")}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
              {t("pricing.faqTitle")}
            </h2>
          </motion.div>
          
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
              >
                <Card className={theme === "dark" ? "border border-white/10" : "border border-gray-200"}>
                  <h3 className={`text-xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
                    {faq.question}
                  </h3>
                  <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                    {faq.answer}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className={`p-12 text-center rounded-3xl ${theme === "dark" ? "bg-[#112240] border border-white/10" : "bg-[#0D1B2A]"}`}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t("pricingPage.finalCtaTitle")}
              </h2>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                {t("pricingPage.finalCtaDesc")}
              </p>
              <Link href="/consultation">
                <Button variant="gold" size="xl" className="rounded-full">
                  {t("pricingPage.finalCtaButton")} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  const { theme } = useTheme();
  return (
    <Suspense
      fallback={
        <div
          className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-[#0D1B2A] text-white" : "bg-[#FAFAFA] text-[#0D1B2A]"}`}
        >
          …
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
