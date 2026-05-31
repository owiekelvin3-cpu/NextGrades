"use client";

import { useState } from "react";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Headphones, Shield, Clock, Lock, BarChart3, Calendar, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { buildLoginUrl } from "@/lib/auth/redirect";
import { getResourcesSubjectImage, RESOURCES_UPGRADE_HERO } from "@/lib/resources/images";
import { appShell } from "@/lib/theme/shell";

type LocalizedPlan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  highlighted: boolean;
  features: string[];
};

const STEPS = ["Choose class & semester", "Choose access", "Payment", "Get started"];

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes — all plans are cancelable monthly." },
  { q: "What payment methods are accepted?", a: "Credit card, PayPal and bank transfer." },
  { q: "Do I get all subjects?", a: "Premium unlocks all materials for your selected subject and grade." },
  { q: "Is there a free trial?", a: "Free materials are available without a subscription." },
  { q: "How fast do I get access?", a: "Immediately after successful payment." },
  { q: "Can I switch plans?", a: "Yes, upgrade or downgrade anytime from your dashboard." },
];

export function ResourcesUpgradeExperience() {
  const { t } = useTranslation();
  const router = useRouter();
  const [yearly, setYearly] = useState(false);
  const localizedPlans = useLocalizedContent<LocalizedPlan[]>("pricingPage.plans");
  const plans = Array.isArray(localizedPlans) ? localizedPlans : [];
  const [subject, setSubject] = useState("english");
  const [grade, setGrade] = useState("3");
  const [semester, setSemester] = useState("1");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const heroImage = getResourcesSubjectImage(subject);

  const handleSelect = (planId: string) => {
    router.push(buildLoginUrl(`/checkout?plan=${planId}&billing=${yearly ? "yearly" : "monthly"}&from=resources`));
  };

  return (
    <>
      <section className="relative overflow-hidden bg-[#0D1B2A] text-white pt-28 pb-16">
        <div className="absolute inset-0 opacity-20">
          <MarketingImage src={heroImage} alt="" containerClassName="absolute inset-0" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/95 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-400 mb-3">Home › Resources › English › Upgrade</p>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Unlock all content and{" "}
                <span className="text-[#D4AF37]">reach your goals.</span>
              </h1>
              <p className="text-gray-300 mb-8 max-w-lg">
                Get full access to premium learning materials, structured plans and personal support.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Lock, label: "Unlock all" },
                  { icon: BarChart3, label: "Your progress" },
                  { icon: Calendar, label: "Learning plan" },
                  { icon: Headphones, label: "Support" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/20">
                      <Icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <p className="text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden lg:block h-72">
              <MarketingImage src={RESOURCES_UPGRADE_HERO} alt="" containerClassName="absolute inset-0 rounded-2xl" className="object-cover object-right rounded-2xl" />
              <div className="absolute bottom-0 right-0 rounded-2xl bg-[#112240] p-4 shadow-2xl max-w-xs">
                <Sparkles className="h-5 w-5 text-[#D4AF37] mb-2" />
                <p className="text-sm font-semibold">Individual support. Real results.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${appShell.sectionSubtle} py-10`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? "bg-[#D4AF37] text-[#0D1B2A]" : "bg-gray-200 text-gray-500"}`}>
                  {i + 1}
                </span>
                <span className={`text-sm ${i === 0 ? "font-semibold text-[#0D1B2A]" : "text-gray-500"}`}>{step}</span>
                {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-gray-300 hidden sm:block" />}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-10">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
                  <option value="english">English</option>
                  <option value="math">Mathematics</option>
                  <option value="german">German</option>
                  <option value="physics">Physics</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Grade</label>
                <select value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
                  {[1, 2, 3, 4, 5].map((g) => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Semester</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              You get access to all content for <strong>{subject}</strong> – Grade {grade}, Semester {semester}.
            </p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#0D1B2A] mb-4">Choose your access</h2>
            <div className="inline-flex rounded-full border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setYearly(false)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${!yearly ? "bg-[#D4AF37] text-[#0D1B2A]" : "text-gray-500"}`}
              >
                {t("pricing.monthly")}
              </button>
              <button
                type="button"
                onClick={() => setYearly(true)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${yearly ? "bg-[#D4AF37] text-[#0D1B2A]" : "text-gray-500"}`}
              >
                {t("pricing.yearly")} <span className="text-xs opacity-90">{t("pricing.yearlyDiscount")}</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {plans.map((plan) => {
              const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${plan.highlighted ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30" : "border-gray-100"}`}
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
                      {" "}/ {yearly ? t("pricing.perYear") : t("pricing.perMonth")}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Cancel anytime</p>
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
                    className={`mt-6 w-full rounded-xl py-3 text-sm font-bold transition ${plan.highlighted ? "bg-[#D4AF37] text-[#0D1B2A]" : "border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/5"}`}
                  >
                    {t("pricing.getStarted")}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-12 text-center">
            {[
              { icon: Headphones, title: "14-day money-back", desc: "Risk-free trial" },
              { icon: Shield, title: "Secure & reliable", desc: "Encrypted payments" },
              { icon: Clock, title: "Cancel anytime", desc: "No long-term lock-in" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl bg-white p-5 border border-gray-100">
                <Icon className="h-6 w-6 text-[#D4AF37] mx-auto mb-2" />
                <p className="font-bold text-sm text-[#0D1B2A]">{title}</p>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-[#0D1B2A] text-center mb-6">Frequently asked questions</h2>
          <div className="grid md:grid-cols-2 gap-3 mb-12">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-[#0D1B2A]"
                >
                  {faq.q}
                  <ChevronRight className={`h-4 w-4 shrink-0 transition ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-4 text-sm text-gray-500">{faq.a}</p>}
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-gray-100 px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Headphones className="h-6 w-6 text-[#D4AF37]" />
              <p className="text-sm font-medium text-[#0D1B2A]">Still have questions? Our team is happy to help.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/contact" className="rounded-xl border-2 border-[#0D1B2A] px-5 py-2.5 text-sm font-semibold">
                Contact us
              </Link>
              <Link href="/consultation" className="rounded-xl bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-[#0D1B2A]">
                Free consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
