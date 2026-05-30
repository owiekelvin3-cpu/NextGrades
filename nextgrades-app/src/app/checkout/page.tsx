"use client";

import { Suspense, useEffect, useState } from "react";
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
import { buildLoginUrl } from "@/lib/auth/redirect";
import { Loader2, CreditCard, ShieldCheck, ArrowLeft } from "lucide-react";
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

  const planId = (searchParams.get("plan") || "group") as P;
  const billing = searchParams.get("billing") === "yearly" ? "yearly" : "monthly";

  const plans = useLocalizedContent<
    {
      id: string;
      name: string;
      description: string;
      monthlyPrice: number;
      yearlyPrice: number;
    }[]
  >("pricingPage.plans");

  const plan = plans.find((p) => p.id === planId) ?? plans[1];
  const price = billing === "yearly" ? plan?.yearlyPrice : plan?.monthlyPrice;

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace(buildLoginUrl(`/checkout?plan=${planId}&billing=${billing}`));
        return;
      }
      setUser({ id: session.user.id });
      setChecking(false);
    };
    init();
  }, [router, planId, billing]);

  const tryStripe = async () => {
    if (!user) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: "subscription",
          planId,
          billing,
        }),
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Navbar />
      <main className="flex-1 pt-28 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <Link
            href="/pricing"
            className={`inline-flex items-center gap-2 mb-6 text-sm ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-[#0D1B2A]"}`}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("checkout.backToPricing", { defaultValue: "Back to pricing" })}
          </Link>
          <Card className={`p-8 ${theme === "dark" ? "bg-[#112240]" : "bg-white"}`}>
            <h1 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
              {t("checkout.title", { defaultValue: "Complete your subscription" })}
            </h1>
            <p className={`mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {plan?.name} · {billing === "yearly" ? t("pricing.yearly") : t("pricing.monthly")}
            </p>
            <div className={`text-4xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-[#0D1B2A]"}`}>
              €{price}
              <span className="text-lg font-normal text-gray-500 ml-2">
                /{billing === "yearly" ? t("pricing.perYear") : t("pricing.perMonth")}
              </span>
            </div>
            <ul className={`space-y-2 mb-8 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                {t("checkout.secure", { defaultValue: "Secure checkout" })}
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                {t("checkout.cards", { defaultValue: "Card, PayPal & bank transfer" })}
              </li>
            </ul>
            <Button
              variant="gold"
              size="xl"
              className="w-full"
              disabled={processing}
              onClick={tryStripe}
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t("checkout.payNow", { defaultValue: "Pay now" })
              )}
            </Button>
            <p className={`text-xs text-center mt-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
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
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
