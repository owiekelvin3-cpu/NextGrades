"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PricingPlanCard, type PricingPlanCardPlan } from "@/components/pricing/PricingPlanCard";
import { MarketingCtaButtons } from "@/components/premium/MarketingCtaButtons";
import { SectionHeader } from "@/components/premium/SectionHeader";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, ChevronDown, Loader2, Star, Users, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useToast } from "@/context/ToastContext";
import { useCmsImage } from "@/hooks/useCmsImage";
import { buildLoginUrl } from "@/lib/auth/redirect";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import {
  PRICING_HERO_IMAGE,
  PRICING_PLAN_IMAGES,
} from "@/lib/marketing-images";
import { cn } from "@/lib/utils";
import { section, hero } from "@/lib/premium/tokens";

type CompareRow = {
  label: string;
  library?: string | boolean;
  group?: string | boolean;
  premium?: string | boolean;
  matura?: string | boolean;
};

type PlanAction = "checkout" | "resources" | "consultation";

type PricingStat = { value: string; label: string };

const CHECKOUT_PLANS = new Set(["resource", "group", "premium"]);
const STAT_ICONS = [Users, Star, BookOpen, Star];

const PLAN_IMAGE_BY_ID: Record<string, string> = {
  library: PRICING_PLAN_IMAGES[0],
  group: PRICING_PLAN_IMAGES[1],
  premium: PRICING_PLAN_IMAGES[2],
  matura: PRICING_PLAN_IMAGES[3],
};

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
    return <CheckCircle2 className="mx-auto h-4 w-4 text-[#D4AF37]" aria-hidden />;
  }
  if (value === false || value === undefined) {
    return <span className="text-gray-300" aria-hidden>—</span>;
  }
  return <span className="text-sm text-gray-600">{value}</span>;
}

function PricingContent() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const heroImage = useCmsImage("cmsImages.pricing.hero", PRICING_HERO_IMAGE);

  const localizedPlans = useLocalizedContent<PricingPlanCardPlan[]>("pricingPage.plans");
  const plans = Array.isArray(localizedPlans) ? localizedPlans : [];

  const faqsRaw = useLocalizedContent<{ question: string; answer: string }[]>("pricingPage.faqs");
  const faqs = Array.isArray(faqsRaw) ? faqsRaw : [];

  const compareRows = useLocalizedContent<CompareRow[]>("pricingPage.compareRows");
  const compareHeaders = useLocalizedContent<Record<string, string>>("pricingPage.compareHeaders");
  const planActions = useLocalizedContent<Record<string, string>>("pricingPage.planActions");
  const statsRaw = useLocalizedContent<PricingStat[]>("pricingPage.stats");
  const stats = Array.isArray(statsRaw) ? statsRaw : [];
  const ctaTagsRaw = useLocalizedContent<string[]>("pricingPage.finalCtaTags");
  const ctaTags = Array.isArray(ctaTagsRaw) ? ctaTagsRaw : [];

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
    <div className="marketing-page-root flex min-h-screen flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1">
        {/* Hero — aligned with Programme page */}
        <section className={cn("relative bg-[#0D1B2A] text-white", hero.section)}>
          <MarketingHeroBlend
            src={heroImage}
            alt=""
            variant="dark-split-right"
            backgroundColor="#0D1B2A"
            priority
          />
          <div className={hero.inner}>
            <div className="grid min-w-0 items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="max-w-xl">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
                  {t("pricingPage.plansEyebrow")}
                </p>
                <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                  {t("pricingPage.plansTitle")}
                </h1>
                <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-300 sm:text-lg">
                  {t("pricingPage.plansSubtitle")}
                </p>
                <p className="mt-4 text-sm text-gray-400">{t("pricingPage.valueProposition")}</p>
              </div>
              <div className="hidden min-h-[280px] lg:block" aria-hidden />
            </div>
          </div>
        </section>

        {/* Stats strip */}
        {stats.length > 0 && (
          <section className="-mt-8 pb-2 md:-mt-10">
            <div className="mx-auto max-w-4xl px-5 sm:px-6">
              <Card className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(13,27,42,0.06)] sm:p-6">
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
                  {stats.slice(0, 4).map((stat, index) => {
                    const Icon = STAT_ICONS[index] ?? Star;
                    return (
                      <div key={stat.label} className="text-center sm:text-left">
                        <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0D1B2A]/5">
                          <Icon className="h-4 w-4 text-[#0D1B2A]" aria-hidden />
                        </div>
                        <p className="text-2xl font-bold tracking-tight text-[#0D1B2A] sm:text-3xl">
                          {stat.value}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Plans */}
        <section className={cn(section.pyCompact, "pt-12 md:pt-16")}>
          <div className={section.container}>
            <SectionHeader
              eyebrow={t("pricing.badge")}
              title={t("pricing.choosePlan")}
              subtitle={t("pricingPage.trustedDesc")}
              align="center"
              className="mb-10 md:mb-12"
            />
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => (
                <PricingPlanCard
                  key={plan.id}
                  plan={plan}
                  imageSrc={PLAN_IMAGE_BY_ID[plan.id]}
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
          </div>
        </section>

        {/* Comparison */}
        {Array.isArray(compareRows) && compareRows.length > 0 && (
          <section className="border-t border-gray-200/80 bg-white py-16 md:py-20">
            <div className={section.container}>
              <SectionHeader
                title={t("pricing.compareTitle")}
                align="center"
                className="mb-8 md:mb-10"
              />
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#0D1B2A] text-white">
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-300">
                        {compareHeaders?.features ?? "Merkmale"}
                      </th>
                      {planColumns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wide"
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
                          "border-b border-gray-100 last:border-0",
                          i % 2 === 1 && "bg-[#FAF8F5]/80"
                        )}
                      >
                        <td className="px-5 py-3.5 font-medium text-[#0D1B2A]">{row.label}</td>
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

        {/* FAQ — minimal dividers */}
        {faqs.length > 0 && (
          <section className="border-t border-gray-200/80 bg-[#FAF8F5] py-16 md:py-20">
            <div className={cn(section.container, "max-w-3xl")}>
              <SectionHeader
                eyebrow={t("pricing.faqEyebrow", { defaultValue: "FAQ" })}
                title={t("pricing.faqHeading")}
                align="center"
                className="mb-8"
              />
              <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
                {faqs.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={item.question}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                        aria-expanded={isOpen}
                      >
                        <span className="font-semibold text-[#0D1B2A]">{item.question}</span>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 shrink-0 text-gray-400 transition-transform",
                            isOpen && "rotate-180"
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-gray-100 px-5 pb-5 pt-3 sm:px-6">
                          <p className="text-sm leading-relaxed text-gray-600">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA — flat, no decorative blobs */}
        <section className="border-t border-white/10 bg-[#0D1B2A] py-16 md:py-20">
          <div className={cn(section.container, "max-w-3xl text-center")}>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {t("pricingPage.finalCtaTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-400">
              {t("pricingPage.finalCtaDesc")}
            </p>
            {ctaTags.length > 0 && (
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {ctaTags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-gray-300"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            <MarketingCtaButtons
              className="mt-8"
              align="center"
              primaryLabel={t("pricingPage.finalCtaButton")}
              secondaryLabel={t("home.explorePrograms")}
              primaryHref="/consultation"
              secondaryHref="/programs"
            />
          </div>
        </section>
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
