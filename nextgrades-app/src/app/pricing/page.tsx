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
import { MarketingHeroMobileImage } from "@/components/marketing/MarketingHeroMobileImage";
import { SectionHeader } from "@/components/premium/SectionHeader";
import { Card } from "@/components/ui/Card";
import { ChevronDown, Loader2, Star, GraduationCap, FileText, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useToast } from "@/context/ToastContext";
import { useCmsImages } from "@/hooks/useCmsImage";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import {
  PROGRAMS_PAGE_CARD_IMAGES,
  SHARED_PAGE_HERO_IMAGE,
} from "@/lib/marketing-images";
import { cn } from "@/lib/utils";
import { hero, section } from "@/lib/premium/tokens";
import { useMarketingTheme } from "@/lib/marketing-theme";

type PlanAction = "checkout" | "resources" | "consultation";

type PricingStat = { value: string; label: string };

const CHECKOUT_PLANS = new Set(["resource", "group", "premium"]);
const STAT_ICONS = [UserRound, GraduationCap, FileText, Star];

const PLAN_ORDER = ["premium", "group", "matura", "library"] as const;

/** Same CMS card images as /programs — index matches program card order. */
const PLAN_IMAGE_INDEX: Record<string, number> = {
  premium: 0,
  group: 1,
  matura: 2,
  library: 3,
  resource: 3,
};

const PLAN_TYPE_LABEL: Record<string, string> = {
  premium: "1:1",
  group: "Gruppe",
  matura: "Matura",
  library: "Bibliothek",
  resource: "Bibliothek",
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
  const { getImage, marketingHeroImage: heroImage } = useCmsImages();
  const programCardImages = PROGRAMS_PAGE_CARD_IMAGES.map((url, i) =>
    getImage(`cmsImages.programs.card.${i}`, url)
  );

  const localizedPlans = useLocalizedContent<PricingPlanCardPlan[]>("pricingPage.plans");
  const plans = Array.isArray(localizedPlans)
    ? [...localizedPlans].sort(
        (a, b) => PLAN_ORDER.indexOf(a.id as (typeof PLAN_ORDER)[number]) - PLAN_ORDER.indexOf(b.id as (typeof PLAN_ORDER)[number])
      )
    : [];

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
      router.push("/checkout?plan=library&billing=monthly");
      return;
    }
    if (action === "consultation") {
      router.push("/consultation");
      return;
    }

    setLoadingPlan(plan.id);
    try {
      const stripePlan = checkoutPlanId(plan.id);
      router.push(`/checkout?plan=${stripePlan}&billing=monthly`);
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
        {/* Hero — same image pattern as Programme */}
        <section className={cn("bg-[#0D1B2A] text-white", hero.section)}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.15),transparent_45%)]" />
          <MarketingHeroBlend
            src={heroImage}
            alt=""
            variant="dark-split-right"
            backgroundColor="#0D1B2A"
            fallbackSrc={SHARED_PAGE_HERO_IMAGE}
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          <div className={hero.inner}>
            <div className="grid min-h-0 min-w-0 flex-1 items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="min-w-0 max-w-xl">
                <p
                  className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37] sm:text-sm"
                  data-animate="hero-headline"
                >
                  {t("pricingPage.plansEyebrow")}
                </p>
                <h1
                  className="text-[1.75rem] font-bold leading-[1.12] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.25rem]"
                  data-animate="hero-headline"
                  data-animate-delay="0.1"
                >
                  {t("pricingPage.plansTitle")}
                </h1>
                <p
                  className="mt-4 max-w-lg text-[15px] leading-relaxed text-on-navy-muted sm:mt-6 sm:text-base md:text-lg"
                  data-animate="hero-subheadline"
                >
                  {t("pricingPage.plansSubtitle")}
                </p>
                <p className="mt-3 text-sm text-on-navy-subtle" data-animate="hero-subheadline" data-animate-delay="0.2">
                  {t("pricingPage.valueProposition")}
                </p>
              </div>
              <div data-animate="hero-image">
                <MarketingHeroMobileImage
                  src={heroImage}
                  fallbackSrc={SHARED_PAGE_HERO_IMAGE}
                  alt=""
                  priority
                />
              </div>
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

        {/* Premium-Tarife — aligned with Programme cards */}
        <section className={cn("py-14 md:py-16", mt.sectionAlt)}>
          <div className={section.container}>
            <div className="mb-10 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
                {t("pricing.badge")}
              </p>
              <h2 className="mb-2 text-3xl font-bold text-[var(--foreground)] sm:text-4xl">{t("pricing.choosePlan")}</h2>
              <p className="mx-auto max-w-2xl text-[var(--text-muted)]">{t("pricingPage.trustedDesc")}</p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-4" data-animate="staggerChildren" data-stagger="0.15">
              {plans.map((plan) => {
                const imageIndex = PLAN_IMAGE_INDEX[plan.id] ?? 0;
                return (
                  <PricingPlanCard
                    key={plan.id}
                    plan={plan}
                    imageSrc={programCardImages[imageIndex]}
                    typeLabel={PLAN_TYPE_LABEL[plan.id]}
                    isLoading={loadingPlan === plan.id}
                    onSelect={() => handlePlanSelect(plan)}
                    popularLabel={t("pricing.mostPopular")}
                    ctaLabel={
                      (planActions && typeof planActions === "object" && planActions[plan.id]) ||
                      t("pricing.getStarted")
                    }
                  />
                );
              })}
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
