"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PricingPlanCard, type PricingPlanCardPlan } from "@/components/pricing/PricingPlanCard";
import {
  ProgramCompareTable,
  type ProgramCompareHeaders,
  type ProgramCompareRow,
} from "@/components/programs/ProgramCompareTable";
import { MarketingCtaButtons } from "@/components/premium/MarketingCtaButtons";
import { SectionHeader } from "@/components/premium/SectionHeader";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, ChevronDown, Loader2, Star, BookOpen, GraduationCap, FileText, UserRound } from "lucide-react";
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
import { section } from "@/lib/premium/tokens";
import { useMarketingTheme } from "@/lib/marketing-theme";

type PlanAction = "checkout" | "resources" | "consultation";

type PricingStat = { value: string; label: string };

const CHECKOUT_PLANS = new Set(["resource", "group", "premium"]);
const STAT_ICONS = [UserRound, GraduationCap, FileText, Star];

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

function PricingContent() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const mt = useMarketingTheme();
  const heroImage = useCmsImage("cmsImages.pricing.hero", PRICING_HERO_IMAGE);

  const localizedPlans = useLocalizedContent<PricingPlanCardPlan[]>("pricingPage.plans");
  const plans = Array.isArray(localizedPlans) ? localizedPlans : [];

  const faqsRaw = useLocalizedContent<{ question: string; answer: string }[]>("pricingPage.faqs");
  const faqs = Array.isArray(faqsRaw) ? faqsRaw : [];

  const compareRows = useLocalizedContent<ProgramCompareRow[]>("programsPage.compareRows");
  const compareHeadersRaw = useLocalizedContent<ProgramCompareHeaders>("programsPage.compareHeaders");
  const compareHeaders: ProgramCompareHeaders =
    compareHeadersRaw && typeof compareHeadersRaw === "object" && "features" in compareHeadersRaw
      ? compareHeadersRaw
      : {
          features: "Merkmale",
          oneOnOne: "1:1 Premium",
          group: "Lerngruppe",
          library: "Lernbibliothek",
          math: "Mathematik Matura Komplettpaket",
        };
  const safeCompareRows = Array.isArray(compareRows) ? compareRows : [];

  const planActions = useLocalizedContent<Record<string, string>>("pricingPage.planActions");
  const statsRaw = useLocalizedContent<PricingStat[]>("pricingPage.stats");
  const stats = Array.isArray(statsRaw) ? statsRaw : [];
  const ctaTagsRaw = useLocalizedContent<string[]>("pricingPage.finalCtaTags");
  const ctaTags = Array.isArray(ctaTagsRaw) ? ctaTagsRaw : [];

  const handlePlanSelect = async (plan: PricingPlanCardPlan) => {
    const action = planActionType(plan.id);
    if (action === "resources") {
      router.push("/resources/upgrade");
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

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col overflow-x-hidden", mt.page)}>
      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0D1B2A] text-white">
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            <MarketingHeroBlend
              src={heroImage}
              alt=""
              variant="dark-split-right"
              backgroundColor="#0D1B2A"
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 bg-[#0D1B2A] md:hidden"
            aria-hidden
          />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-6 pt-site-nav sm:px-6 md:min-h-[520px] md:pb-12 lg:min-h-[560px] lg:px-8">
            <div className="grid min-w-0 items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <div className="max-w-xl">
                <h1 className="text-[1.75rem] font-bold leading-[1.12] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.25rem]" data-animate="hero-headline" data-animate-delay="0.1">
                  {t("pricingPage.plansTitle")}
                </h1>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-on-navy-muted sm:mt-6 sm:text-base md:text-lg" data-animate="hero-subheadline">
                  {t("pricingPage.plansSubtitle")}
                </p>
                <p className="mt-3 text-sm text-on-navy-subtle" data-animate="hero-subheadline" data-animate-delay="0.2">
                  {t("pricingPage.valueProposition")}
                </p>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 shadow-lg md:hidden" data-animate="hero-image">
                <MarketingImage
                  src={heroImage}
                  alt=""
                  containerClassName="h-full w-full"
                  sizes="100vw"
                  priority
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/50 to-transparent" />
              </div>
              <div className="hidden min-h-[280px] lg:block" aria-hidden />
            </div>
          </div>
        </section>

        {/* Stats */}
        {stats.length > 0 && (
          <section className="-mt-5 px-5 pb-1 sm:-mt-8 sm:px-6 md:-mt-10">
            <div className="mx-auto max-w-4xl">
              <Card className={cn("rounded-2xl p-4 shadow-[var(--card-shadow)] sm:p-6", mt.card)}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 sm:gap-4" data-animate="staggerChildren" data-stagger="0.12" data-stagger-variant="scaleUp">
                  {stats.slice(0, 4).map((stat, index) => {
                    const Icon = STAT_ICONS[index] ?? Star;
                    return (
                      <div
                        key={stat.label}
                        className={cn(
                          "min-w-0 text-center sm:text-left",
                          index % 2 === 0 && "border-r border-[var(--border-default)] pr-4 sm:border-0 sm:pr-0",
                          index < 2 && "pb-1 sm:pb-0"
                        )}
                      >
                        <div className="mb-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-subtle)] sm:mb-2 sm:h-9 sm:w-9">
                          <Icon className="h-3.5 w-3.5 text-[var(--foreground)] sm:h-4 sm:w-4" aria-hidden />
                        </div>
                        <p
                          className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl md:text-3xl"
                          data-counter-value={stat.value}
                        >
                          {stat.value}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-snug text-[var(--text-muted)] sm:text-sm">
                          {stat.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Plans */}
        <section className={cn("py-10 sm:py-14 md:py-16 lg:py-20", mt.sectionAlt)}>
          <div className={section.container}>
            <SectionHeader
              eyebrow={t("pricing.badge")}
              title={t("pricing.choosePlan")}
              subtitle={t("pricingPage.trustedDesc")}
              align="center"
              className="!mb-8 sm:!mb-10 md:!mb-12"
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4" data-animate="staggerChildren" data-stagger="0.15">
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
        {safeCompareRows.length > 0 && (
          <ProgramCompareTable
            title={t("programsPage.compareTitle", { defaultValue: "Programmvergleich" })}
            headers={compareHeaders}
            rows={safeCompareRows}
            partialLabel={t("programsPage.comparePartial", { defaultValue: "Teilweise" })}
            includedLabel={t("programsPage.compareIncluded", { defaultValue: "Inklusive" })}
            excludedLabel={t("programsPage.compareExcluded", { defaultValue: "Nicht enthalten" })}
            scrollHint={`← ${t("marketingNav.scrollHint", { defaultValue: "Scroll horizontally to compare" })} →`}
            className={cn("border-t border-[var(--border-default)]", mt.section)}
          />
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className={cn("border-t border-[var(--border-default)] py-10 sm:py-14 md:py-16", mt.sectionAlt)}>
            <div className={cn(section.container, "max-w-3xl")}>
              <SectionHeader
                eyebrow={t("pricing.faqEyebrow", { defaultValue: "FAQ" })}
                title={t("pricing.faqHeading")}
                align="center"
                className="!mb-6 sm:!mb-8"
              />
              <div className="divide-y divide-[var(--border-default)] rounded-xl border border-[var(--border-default)] bg-[var(--card-background)]">
                {faqs.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={item.question}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left touch-manipulation sm:items-center sm:gap-4 sm:px-6 sm:py-5"
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm font-semibold leading-snug text-[var(--foreground)] sm:text-base">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={cn(
                            "mt-0.5 h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform sm:mt-0",
                            isOpen && "rotate-180"
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-[var(--border-default)] px-4 pb-4 pt-3 sm:px-6 sm:pb-5">
                          <p className="text-sm leading-relaxed text-[var(--text-muted)]">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="border-t border-white/10 bg-[#0D1B2A] py-10 sm:py-12 md:py-14">
          <div className={cn(section.container, "max-w-3xl text-center")}>
            <h2 className="text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl md:text-3xl">
              {t("pricingPage.finalCtaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-on-navy-subtle sm:mt-4 sm:text-base">
              {t("pricingPage.finalCtaDesc")}
            </p>
            {ctaTags.length > 0 && (
              <ul className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6">
                {ctaTags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium text-on-navy-muted sm:px-3 sm:text-xs"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            <MarketingCtaButtons
              className="mt-6 w-full sm:mt-8"
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
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
