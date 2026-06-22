"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { useLocalizedContent } from "@/hooks/useLocalizedContent";
import { getDashboardPathForUser } from "@/lib/auth/redirect";
import { CheckCircle2, Loader2 } from "lucide-react";

function SuccessContent() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") || "group";

  const plans = useLocalizedContent<{ id: string; name: string }[]>("pricingPage.plans");
  const planName = plans.find((p) => p.id === planId)?.name ?? planId;

  useEffect(() => {
    const timer = setTimeout(async () => {
      const path = await getDashboardPathForUser();
      router.prefetch(path);
    }, 500);
    return () => clearTimeout(timer);
  }, [router]);

  const goDashboard = async () => {
    const path = await getDashboardPathForUser();
    router.push(`${path}?subscription=success`);
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#0D1B2A]" : "bg-[#FAFAFA]"}`}>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-site-nav">
        <Card className={`p-10 max-w-md w-full text-center`}>
          <div className="w-20 h-20 rounded-full bg-[#22C55E]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#22C55E]" />
          </div>
          <h1 className={`text-2xl font-bold mb-3 text-foreground`}>
            {t("checkout.successTitle", { defaultValue: "Welcome to NextGrades!" })}
          </h1>
          <p className={`mb-2 text-text-muted`}>
            {t("checkout.successDesc", {
              defaultValue: "Your plan is now active:",
            })}{" "}
            <strong className="text-[#D4AF37]">{planName}</strong>
          </p>
          <p className={`text-sm mb-8 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
            {t("checkout.successHint", {
              defaultValue: "You can manage your subscription anytime in settings.",
            })}
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="gold" size="lg" className="w-full" onClick={goDashboard}>
              {t("checkout.goDashboard", { defaultValue: "Go to dashboard" })}
            </Button>
            <Link href="/resources">
              <Button variant="outline" size="lg" className="w-full">
                {t("checkout.browseResources", { defaultValue: "Browse resources" })}
              </Button>
            </Link>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
