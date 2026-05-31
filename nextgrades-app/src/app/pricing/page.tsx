"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  ArrowRight,
  Star,
  Loader2,
  ChevronDown,
  BookOpen,
  Users,
  Crown,
  Shield,
  Sparkles,
  GraduationCap,
  Zap,
  TrendingUp,
  Heart,
} from "lucide-react";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useToast } from "@/context/ToastContext";
import { buildLoginUrl } from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";

const PLAN_ICONS: Record<string, typeof BookOpen> = {
  resource: BookOpen,
  group: Users,
  premium: Crown,
};

const STAT_ICONS = [Users, Star, TrendingUp, Heart];

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

  const statsRaw = useLocalizedContent<{ value: string; label: string }[]>("pricingPage.stats");
  const stats = Array.isArray(statsRaw) ? statsRaw : [];

  const ctaTagsRaw = useLocalizedContent<string[]>("pricingPage.finalCtaTags");
  const ctaTags = Array.isArray(ctaTagsRaw) ? ctaTagsRaw : [];

  const cardBase = cn(
    "relative flex w-full flex-col overflow-hidden rounded-2xl border transition-all duration-300",
    mt.isDark
      ? "border-white/10 bg-[#112240]/80 backdrop-blur-sm"
      : "border-gray-100 bg-white/90 backdrop-blur-sm shadow-lg shadow-gray-200/50"
  );

  return (
    <div className={cn("flex min-h-screen flex-col", mt.page)}>
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0D1B2A] pt-28 pb-20 text-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-[#D4AF37]/12 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#4DA3FF]/10 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge variant="gold" className="mb-5 px-4 py-1.5">
                {t("pricing.badge")}
              </Badge>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                {t("pricing.heroTitle")}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-300">{t("pricing.heroSubtitle")}</p>

              <div className="mt-10 inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1.5 shadow-inner backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setIsYearly(false)}
                  className={cn(
                    "rounded-full px-7 py-2.5 text-sm font-semibold transition-all duration-200",
                    !isYearly ? "bg-white text-[#0D1B2A] shadow-lg" : "text-gray-300 hover:text-white"
                  )}
                >
                  {t("pricing.monthly")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsYearly(true)}
                  className={cn(
                    "rounded-full px-7 py-2.5 text-sm font-semibold transition-all duration-200",
                    isYearly ? "bg-[#D4AF37] text-[#0D1B2A] shadow-lg shadow-[#D4AF37]/30" : "text-gray-300 hover:text-white"
                  )}
                >
                  {t("pricing.yearly")}
                  <span className="ml-1.5 rounded-full bg-black/10 px-2 py-0.5 text-xs">{t("pricing.yearlyDiscount")}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Plans */}
        <section className={cn("relative py-16 lg:py-24", mt.sectionAlt)}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">{t("pricingPage.plansEyebrow")}</p>
              <h2 className={cn("mt-3 text-2xl font-bold md:text-3xl", mt.heading)}>{t("pricingPage.plansTitle")}</h2>
            </div>

            <div className="grid items-stretch gap-8 md:grid-cols-3 lg:gap-6">
              {plans.map((plan, planIndex) => {
                const Icon = PLAN_ICONS[plan.id] ?? BookOpen;
                const isHighlighted = plan.highlighted;
                const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                const isLoading = loadingPlan === plan.id;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: planIndex * 0.1 }}
                    className={cn("flex", isHighlighted && "md:-mt-6 md:-mb-6 md:z-10 md:scale-[1.03]")}
                  >
                    <div
                      className={cn(
                        cardBase,
                        "p-7 lg:p-8",
                        isHighlighted &&
                          "border-2 border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/20 ring-1 ring-[#D4AF37]/30"
                      )}
                    >
                      {isHighlighted && (
                        <>
                          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-[#D4AF37]/20 to-transparent opacity-60" />
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                            <Badge variant="gold" className="px-4 py-1 text-xs font-bold shadow-lg">
                              {t("pricing.mostPopular")}
                            </Badge>
                          </div>
                        </>
                      )}

                      <div className="relative mb-6 flex items-start gap-4">
                        <div
                          className={cn(
                            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                            isHighlighted
                              ? "bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 text-[#D4AF37]"
                              : mt.isDark
                                ? "bg-white/10 text-[#D4AF37]"
                                : "bg-[#0D1B2A]/5 text-[#0D1B2A]"
                          )}
                        >
                          <Icon className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className={cn("text-xl font-bold", mt.heading)}>{plan.name}</h3>
                          <p className={cn("mt-1 text-sm", mt.body)}>{plan.description}</p>
                        </div>
                      </div>

                      <div className={cn("relative mb-6 border-b pb-6", mt.isDark ? "border-white/10" : "border-gray-100")}>
                        <div className="flex items-baseline gap-1.5">
                          <span className={cn("text-5xl font-extrabold tracking-tight", mt.heading)}>€{price}</span>
                          <span className={cn("text-sm", mt.muted)}>
                            /{isYearly ? t("pricing.perYear") : t("pricing.perMonth")}
                          </span>
                        </div>
                        {isYearly && (
                          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#22C55E]/10 px-3 py-1 text-xs font-semibold text-[#22C55E]">
                            <Zap className="h-3.5 w-3.5" />
                            {t("pricing.saveYearly", { defaultValue: "Save 2 months vs monthly" })}
                          </p>
                        )}
                      </div>

                      <ul className="relative mb-8 flex-1 space-y-3.5">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                            </span>
                            <span className={mt.body}>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={isHighlighted ? "gold" : "dark"}
                        size="lg"
                        className={cn("relative w-full", !isHighlighted && mt.isDark && "bg-white/10 hover:bg-white/15")}
                        disabled={isLoading}
                        onClick={() => handleGetStarted(plan)}
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            {t("pricing.getStarted")}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust strip */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {[
                { icon: Shield, text: t("pricing.trust1", { defaultValue: "Cancel anytime" }) },
                { icon: Sparkles, text: t("pricing.trust2", { defaultValue: "Free consultation" }) },
                { icon: Star, text: t("pricing.trust3", { defaultValue: "4.9/5 student rating" }) },
              ].map((item) => (
                <div key={item.text} className={cn("flex items-center gap-2.5 text-sm font-medium", mt.body)}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <item.icon className="h-4 w-4 text-[#D4AF37]" />
                  </span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className={cn("py-16 lg:py-20", mt.section)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => {
                const Icon = STAT_ICONS[i] ?? Star;
                return (
                  <div
                    key={stat.label}
                    className={cn(
                      "rounded-2xl border p-8 text-center transition-shadow hover:shadow-lg",
                      mt.isDark ? "border-white/10 bg-[#112240]" : "border-gray-100 bg-white shadow-md"
                    )}
                  >
                    <Icon className="mx-auto mb-3 h-7 w-7 text-[#D4AF37]" />
                    <p className={cn("text-3xl font-extrabold tracking-tight", mt.heading)}>{stat.value}</p>
                    <p className={cn("mt-1 text-sm", mt.muted)}>{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className={cn("py-14", mt.sectionAlt)}>
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center md:flex-row md:text-left sm:px-6">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-7 w-7 fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>
            <div>
              <h3 className={cn("text-xl font-bold", mt.heading)}>{t("pricingPage.trustedTitle")}</h3>
              <p className={cn("mt-1", mt.body)}>{t("pricingPage.trustedDesc")}</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={cn("py-16 lg:py-24", mt.section)}>
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">FAQ</p>
              <h2 className={cn("mt-3 text-3xl font-bold md:text-4xl", mt.heading)}>{t("pricing.faqTitle")}</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className={cn(
                      "overflow-hidden rounded-2xl border transition-colors",
                      mt.isDark ? "border-white/10 bg-[#112240]" : "border-gray-100 bg-white shadow-sm"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className={cn("font-semibold", mt.heading)}>{faq.question}</span>
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/10 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      >
                        <ChevronDown className="h-4 w-4 text-[#D4AF37]" />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p
                            className={cn(
                              "border-t px-6 pb-5 pt-4 text-sm leading-relaxed",
                              mt.body,
                              mt.isDark ? "border-white/10" : "border-gray-100"
                            )}
                          >
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1B2A] via-[#132942] to-[#1a3555] p-8 shadow-2xl sm:p-12">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
              <div className="flex items-center gap-6">
                <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 sm:flex">
                  <GraduationCap className="h-10 w-10 text-[#D4AF37]" />
                </div>
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-white md:text-3xl">{t("pricingPage.finalCtaTitle")}</h2>
                  <p className="mt-2 max-w-lg text-gray-300">{t("pricingPage.finalCtaDesc")}</p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link href="/consultation">
                  <Button variant="gold" size="lg">
                    {t("pricingPage.finalCtaButton")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                    {t("common.contact")}
                  </Button>
                </Link>
              </div>
            </div>
            {ctaTags.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-6 border-t border-white/10 pt-8 lg:justify-start">
                {ctaTags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                    <span className="text-sm font-medium text-white">{tag}</span>
                  </div>
                ))}
              </div>
            )}
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
