"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { useToast } from "@/context/ToastContext";
import { Loader2, CreditCard, ShieldCheck, ArrowLeft } from "lucide-react";
import { toStripePlanId } from "@/lib/checkout/catalog-context";
import type { PlanId as P } from "@/lib/plans/storage";

function CheckoutContent() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [checking, setChecking] = useState(true);

  const planId = (searchParams.get("plan") || "library") as P | "library";
  const billing = searchParams.get("billing") === "yearly" ? "yearly" : "monthly";
  const subjectSlug = searchParams.get("subject")?.trim() ?? "";
  const grade = searchParams.get("grade")?.trim() ?? "";
  const semester = searchParams.get("semester")?.trim() ?? "";

  const plans = useLocalizedContent<
    {
      id: string;
      name: string;
      description: string;
      monthlyPrice: number;
      yearlyPrice: number;
      priceLabel?: string;
    }[]
  >("pricingPage.plans");

  const plan = useMemo(() => {
    const match = plans.find((p) => p.id === planId);
    if (match) return match;
    if (planId === "library" || planId === "resource") {
      return plans.find((p) => p.id === "library" || p.id === "resource");
    }
    return plans.find((p) => p.id === "group") ?? plans[0];
  }, [plans, planId]);

  const price = billing === "yearly" ? plan?.yearlyPrice : plan?.monthlyPrice;
  const stripePlan = toStripePlanId(planId);

  const subjectLabel = subjectSlug
    ? t(`resources.upgrade.subjects.${subjectSlug}`, { defaultValue: subjectSlug })
    : "";

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ? { id: session.user.id } : null);
      setChecking(false);
    };
    void init();
  }, []);

  const startCheckout = async () => {
    setProcessing(true);
    try {
      const payload = {
        productType: "subscription",
        planId: stripePlan,
        billing,
        subjectSlug: subjectSlug || undefined,
        grade: grade || undefined,
        semester: semester || undefined,
      };

      const endpoint = user ? "/api/stripe/checkout-session" : "/api/stripe/guest-checkout-session";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("checkout.failed", { defaultValue: "Checkout failed" }));
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error(t("checkout.failed", { defaultValue: "Checkout failed" }));
    } finally {
      setProcessing(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const cancelHref = subjectSlug
    ? `/resources/upgrade?subject=${encodeURIComponent(subjectSlug)}`
    : "/pricing";

  return (
    <div className={`flex min-h-screen flex-col ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Navbar />
      <main className="flex-1 px-4 pb-16 pt-site-nav">
        <div className="mx-auto max-w-lg">
          <Link
            href={cancelHref}
            className={`mb-6 inline-flex items-center gap-2 text-sm ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-[#0D1B2A]"}`}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("checkout.backToPricing", { defaultValue: "Back to pricing" })}
          </Link>
          <Card className="p-8">
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              {t("checkout.title", { defaultValue: "Complete your subscription" })}
            </h1>
            <p className="mb-1 text-text-muted">
              {plan?.name} · {billing === "yearly" ? t("pricing.yearly") : t("pricing.monthly")}
            </p>
            {subjectSlug && (
              <p className="mb-4 text-sm text-[var(--brand-gold)]">
                {subjectLabel}
                {grade ? ` · ${t("checkout.accountSetup.gradeLabel", { grade })}` : ""}
                {semester ? ` · ${t("checkout.accountSetup.semesterLabel", { semester })}` : ""}
              </p>
            )}
            <div className="mb-6 text-4xl font-bold text-foreground">
              {plan?.priceLabel ?? `€${price ?? "—"}`}
              {!plan?.priceLabel && (
                <span className="ml-2 text-lg font-normal text-gray-500">
                  /{billing === "yearly" ? t("pricing.perYear") : t("pricing.perMonth")}
                </span>
              )}
            </div>
            <ul className={`mb-8 space-y-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
                {t("checkout.secure", { defaultValue: "Secure checkout" })}
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#D4AF37]" />
                {t("checkout.cards", { defaultValue: "Card, PayPal & bank transfer" })}
              </li>
            </ul>
            {!user && (
              <p className="mb-4 rounded-lg border border-[var(--brand-gold)]/30 bg-[var(--brand-gold)]/5 p-3 text-sm text-[var(--text-muted)]">
                {t("checkout.guestHint")}
              </p>
            )}
            <Button variant="gold" size="xl" className="w-full" disabled={processing} onClick={startCheckout}>
              {processing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                t("checkout.payNow", { defaultValue: "Pay now" })
              )}
            </Button>
            {!user && (
              <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
                {t("checkout.haveAccount")}{" "}
                <button
                  type="button"
                  className="font-semibold text-[var(--brand-gold)] underline-offset-2 hover:underline"
                  onClick={() => {
                    const q = searchParams.toString();
                    router.push(`/login?redirect=${encodeURIComponent(`/checkout?${q}`)}`);
                  }}
                >
                  {t("login.signIn")}
                </button>
              </p>
            )}
            <p className={`mt-4 text-center text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
              {t("checkout.secureNote", {
                defaultValue: "Payments are processed securely via Stripe.",
              })}
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
