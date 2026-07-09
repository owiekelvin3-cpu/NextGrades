"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { MarketingHeroBlend } from "@/components/marketing/MarketingHeroBlend";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronRight, Headphones, Shield, Clock, Lock, BarChart3, Calendar, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { buildCheckoutQuery } from "@/lib/checkout/catalog-context";
import { getResourcesSubjectImage } from "@/lib/resources/images";
import {
  mergeMarketingSubjectsWithCatalog,
  type CatalogSubjectLike,
} from "@/lib/catalog/merge-marketing-subjects";
import { appShell } from "@/lib/theme/shell";
import { Button } from "@/components/ui/Button";
import { hero } from "@/lib/premium/tokens";
import { theme as th } from "@/lib/theme/tokens";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { themeSelectClass } from "@/lib/theme/form-fields";
import { cn } from "@/lib/utils";

type LocalizedPlan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  highlighted: boolean;
  features: string[];
};

type FaqItem = { question: string; answer: string };
type MarketingSubjectItem = { id: string; title: string };
type CatalogClass = { id: string; name: string; level: number };

const MAX_GRADE_LEVEL = 9;

function ResourcesUpgradeExperienceInner() {
  const mt = useMarketingTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject")?.trim() ?? "";

  const [yearly, setYearly] = useState(false);
  const localizedPlans = useLocalizedContent<LocalizedPlan[]>("pricingPage.plans");
  const plans = Array.isArray(localizedPlans) ? localizedPlans : [];
  const marketingSubjectsRaw = useLocalizedContent<MarketingSubjectItem[]>("subjectsPage.items");

  const [catalogSubjects, setCatalogSubjects] = useState<CatalogSubjectLike[]>([]);
  const [catalogClasses, setCatalogClasses] = useState<CatalogClass[]>([]);
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [semester, setSemester] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    void fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.subjects)) setCatalogSubjects(data.subjects);
        if (Array.isArray(data?.classes)) setCatalogClasses(data.classes);
      })
      .catch(() => undefined);
  }, []);

  const subjectOptions = useMemo(() => {
    const marketing = Array.isArray(marketingSubjectsRaw) ? marketingSubjectsRaw : [];
    return mergeMarketingSubjectsWithCatalog(marketing, catalogSubjects);
  }, [marketingSubjectsRaw, catalogSubjects]);

  const gradeOptions = useMemo(() => {
    const fromCatalog = catalogClasses
      .filter((c) => c.level >= 1 && c.level <= MAX_GRADE_LEVEL)
      .sort((a, b) => a.level - b.level);
    if (fromCatalog.length > 0) return fromCatalog;
    return Array.from({ length: MAX_GRADE_LEVEL }, (_, i) => ({
      id: `grade-${i + 1}`,
      name: t("resources.upgrade.gradeOption", { grade: i + 1 }),
      level: i + 1,
    }));
  }, [catalogClasses, t]);

  useEffect(() => {
    if (subjectOptions.length === 0) return;
    const slugs = subjectOptions.map((s) => s.slug || s.id);
    if (subjectParam && slugs.includes(subjectParam)) {
      setSubject(subjectParam);
      return;
    }
    setSubject((current) => (current && slugs.includes(current) ? current : slugs[0]));
  }, [subjectOptions, subjectParam]);

  useEffect(() => {
    if (gradeOptions.length === 0) return;
    setGrade((current) => {
      if (current && gradeOptions.some((g) => String(g.level) === current)) return current;
      return String(gradeOptions[0].level);
    });
  }, [gradeOptions]);

  const steps = useMemo(() => {
    const data = t("resources.upgrade.steps", { returnObjects: true });
    return Array.isArray(data) ? (data as string[]) : [];
  }, [t]);

  const faqs = useMemo(() => {
    const data = t("resources.upgrade.faqs", { returnObjects: true });
    return Array.isArray(data) ? (data as FaqItem[]) : [];
  }, [t]);

  const heroBenefits = [
    { icon: Lock, label: t("resources.upgrade.benefitUnlock") },
    { icon: BarChart3, label: t("resources.upgrade.benefitProgress") },
    { icon: Calendar, label: t("resources.upgrade.benefitPlan") },
    { icon: Headphones, label: t("resources.upgrade.benefitSupport") },
  ];

  const trustItems = [
    { icon: Headphones, title: t("resources.upgrade.trust1Title"), desc: t("resources.upgrade.trust1Desc") },
    { icon: Shield, title: t("resources.upgrade.trust2Title"), desc: t("resources.upgrade.trust2Desc") },
    { icon: Clock, title: t("resources.upgrade.trust3Title"), desc: t("resources.upgrade.trust3Desc") },
  ];

  const selectedSubject = subjectOptions.find((s) => (s.slug || s.id) === subject);
  const subjectLabel =
    selectedSubject?.name ??
    t(`resources.upgrade.subjects.${subject}`, {
      defaultValue: subject,
    });

  const selectedGrade = gradeOptions.find((g) => String(g.level) === grade);
  const gradeLabel = selectedGrade?.name ?? t("resources.upgrade.gradeOption", { grade });

  const heroImage = getResourcesSubjectImage(subject);

  const handleSelect = (planId: string) => {
    const checkoutPlan = planId === "library" ? "library" : planId;
    const q = buildCheckoutQuery({
      plan: checkoutPlan,
      billing: yearly ? "yearly" : "monthly",
      subject,
      grade,
      semester,
      from: "resources",
    });
    router.push(`/checkout?${q}`);
  };

  return (
    <>
      <section className={cn("bg-[#0D1B2A] text-white", hero.section)}>
        <MarketingHeroBlend src={heroImage} alt="" variant="dark-full" priority sizes="100vw" opacity={0.75} />
        <div className={hero.inner}>
          <p className="mb-3 text-sm text-on-navy-subtle">
            {t("resources.upgrade.breadcrumb", { subject: subjectLabel })}
          </p>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
                {t("resources.upgrade.title")}{" "}
                <span className="text-[#D4AF37]">{t("resources.upgrade.titleHighlight")}</span>
              </h1>
              <p className="mb-8 max-w-lg text-on-navy-muted">{t("resources.upgrade.subtitle")}</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {heroBenefits.map(({ icon: Icon, label }) => (
                  <div key={label} className="text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/20">
                      <Icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <p className="text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative z-10 hidden lg:flex lg:min-h-[280px] lg:items-end lg:justify-end">
              <div className="max-w-xs rounded-2xl border border-white/10 bg-[#112240]/90 p-4 shadow-2xl backdrop-blur-sm">
                <Sparkles className="mb-2 h-5 w-5 text-[#D4AF37]" />
                <p className="text-sm font-semibold">{t("resources.upgrade.cardTitle")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${appShell.sectionSubtle} py-10`}>
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    i === 0 ? "bg-[#D4AF37] text-[#0D1B2A]" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`text-sm ${i === 0 ? "font-semibold text-[#0D1B2A]" : "text-gray-500"}`}>{step}</span>
                {i < steps.length - 1 && <ChevronRight className="hidden h-4 w-4 text-gray-300 sm:block" />}
              </div>
            ))}
          </div>

          <div className={cn("mb-10 rounded-2xl border p-6 shadow-sm", mt.card)}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={cn("text-xs font-semibold uppercase", mt.muted)}>{t("resources.upgrade.subjectLabel")}</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={themeSelectClass(subject, "mt-1 py-2.5")}
                  disabled={subjectOptions.length === 0}
                >
                  {subjectOptions.map((s) => {
                    const slug = s.slug || s.id;
                    return (
                      <option key={slug} value={slug}>
                        {s.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className={cn("text-xs font-semibold uppercase", mt.muted)}>{t("resources.upgrade.gradeLabel")}</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className={themeSelectClass(grade, "mt-1 py-2.5")}
                  disabled={gradeOptions.length === 0}
                >
                  {gradeOptions.map((g) => (
                    <option key={g.id} value={String(g.level)}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={cn("text-xs font-semibold uppercase", mt.muted)}>{t("resources.upgrade.semesterLabel")}</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className={themeSelectClass(semester, "mt-1 py-2.5")}
                >
                  <option value="">{t("resources.filters.allSemesters")}</option>
                  <option value="1">{t("resources.upgrade.semesterOption", { semester: 1 })}</option>
                  <option value="2">{t("resources.upgrade.semesterOption", { semester: 2 })}</option>
                </select>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              {semester ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: t("resources.upgrade.accessSummary", {
                      subject: subjectLabel,
                      grade: gradeLabel,
                      semester,
                    }),
                  }}
                />
              ) : (
                <span
                  dangerouslySetInnerHTML={{
                    __html: t("resources.upgrade.accessSummaryAllSemesters", {
                      subject: subjectLabel,
                      grade: gradeLabel,
                      defaultValue: `Du erhältst Zugriff auf alle Inhalte für <strong>${subjectLabel}</strong> – ${gradeLabel}, alle Semester.`,
                    }),
                  }}
                />
              )}
            </p>
          </div>

          <div className="mb-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-[#0D1B2A]">{t("resources.upgrade.chooseAccess")}</h2>
            <div className="inline-flex rounded-full border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setYearly(false)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  !yearly ? "bg-[#D4AF37] text-[#0D1B2A]" : "text-gray-500"
                }`}
              >
                {t("pricing.monthly")}
              </button>
              <button
                type="button"
                onClick={() => setYearly(true)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  yearly ? "bg-[#D4AF37] text-[#0D1B2A]" : "text-gray-500"
                }`}
              >
                {t("pricing.yearly")} <span className="text-xs opacity-90">{t("pricing.yearlyDiscount")}</span>
              </button>
            </div>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                    plan.highlighted ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30" : "border-gray-100"
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#D4AF37] px-3 py-0.5 text-[10px] font-bold uppercase text-[#0D1B2A]">
                      {t("pricing.mostPopular")}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-[#0D1B2A]">{plan.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                  <p className="mt-4 text-3xl font-bold text-[#0D1B2A]">
                    €{price}
                    <span className="text-sm font-normal text-gray-500">
                      {" "}
                      / {yearly ? t("pricing.perYear") : t("pricing.perMonth")}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{t("resources.upgrade.cancelAnytime")}</p>
                  <ul className="mt-6 flex-1 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#D4AF37]" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleSelect(plan.id)}
                    className={cn(
                      th.focusRing,
                      "theme-btn-interaction mt-6 w-full rounded-xl py-3 text-sm font-bold",
                      plan.highlighted ? th.btnGold : th.btnOutline
                    )}
                  >
                    {t("pricing.getStarted")}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mb-12 grid gap-6 text-center sm:grid-cols-3">
            {trustItems.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-gray-100 bg-white p-5">
                <Icon className="mx-auto mb-2 h-6 w-6 text-[#D4AF37]" />
                <p className="text-sm font-bold text-[#0D1B2A]">{title}</p>
                <p className="mt-1 text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold text-[#0D1B2A]">{t("resources.upgrade.faqTitle")}</h2>
          <div className="mb-12 grid gap-3 md:grid-cols-2">
            {faqs.map((faq, i) => (
              <div key={faq.question} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-[#0D1B2A]"
                >
                  {faq.question}
                  <ChevronRight className={`h-4 w-4 shrink-0 transition ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-4 text-sm text-gray-500">{faq.answer}</p>}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-gray-100 px-6 py-8 sm:flex-row">
            <div className="flex items-center gap-3">
              <Headphones className="h-6 w-6 text-[#D4AF37]" />
              <p className="text-sm font-medium text-[#0D1B2A]">{t("resources.upgrade.supportPrompt")}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" href="/contact">
                {t("resources.upgrade.contactCta")}
              </Button>
              <Button variant="gold" size="sm" href="/consultation">
                {t("resources.upgrade.consultationCta")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function ResourcesUpgradeExperience() {
  return (
    <Suspense fallback={null}>
      <ResourcesUpgradeExperienceInner />
    </Suspense>
  );
}
