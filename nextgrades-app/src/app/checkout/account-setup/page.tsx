"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { useToast } from "@/context/ToastContext";
import { useMarketingTheme } from "@/lib/marketing-theme";
import { themeInputClass } from "@/lib/theme/form-fields";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import { COMPANY_SUPPORT_EMAIL } from "@/lib/company";

type SessionInfo = {
  paid: boolean;
  email: string;
  subjectName?: string;
  grade?: string;
  semester?: string;
  planId?: string;
};

function AccountSetupContent() {
  const { t } = useTranslation();
  const toast = useToast();
  const mt = useMarketingTheme();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id")?.trim() ?? "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    parentName: "",
    notes: "",
  });

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    void fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.paid) {
          setSessionInfo(data);
          setForm((prev) => ({
            ...prev,
            email: data.email || prev.email,
          }));
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const inputClass = themeInputClass;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/account-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("checkout.accountSetup.submitError"));
        return;
      }
      setSubmitted(true);
    } catch {
      toast.error(t("checkout.accountSetup.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!sessionId || !sessionInfo?.paid) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Card className={cn("p-8", mt.card)}>
          <h1 className="mb-3 text-xl font-bold text-[var(--foreground)]">
            {t("checkout.accountSetup.invalidSession")}
          </h1>
          <p className="mb-6 text-sm text-[var(--text-muted)]">{t("checkout.accountSetup.invalidSessionDesc")}</p>
          <Button variant="gold" href="/pricing">
            {t("checkout.backToPricing")}
          </Button>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Card className={cn("p-8 text-center", mt.card)}>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#22C55E]/20">
            <CheckCircle2 className="h-10 w-10 text-[#22C55E]" />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-[var(--foreground)]">
            {t("checkout.accountSetup.successTitle")}
          </h1>
          <p className="mb-2 text-[var(--text-muted)]">{t("checkout.accountSetup.successDesc")}</p>
          <p className="mb-8 text-sm text-[var(--text-muted)]">
            {t("checkout.accountSetup.successHint", { email: COMPANY_SUPPORT_EMAIL })}
          </p>
          <Link href="/">
            <Button variant="gold" className="w-full">
              {t("common.home")}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#22C55E]/15">
          <ShieldCheck className="h-7 w-7 text-[#22C55E]" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          {t("checkout.accountSetup.title")}
        </h1>
        <p className="text-sm text-[var(--text-muted)] sm:text-base">{t("checkout.accountSetup.subtitle")}</p>
      </div>

      {(sessionInfo.subjectName || sessionInfo.grade) && (
        <Card className={cn("mb-6 border-[var(--brand-gold)]/30 p-4", mt.card)}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-gold)]">
            {t("checkout.accountSetup.purchaseSummary")}
          </p>
          <p className="mt-1 text-sm text-[var(--foreground)]">
            {[
              sessionInfo.subjectName,
              sessionInfo.grade ? t("checkout.accountSetup.gradeLabel", { grade: sessionInfo.grade }) : null,
              sessionInfo.semester
                ? t("checkout.accountSetup.semesterLabel", { semester: sessionInfo.semester })
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </Card>
      )}

      <Card className={cn("p-6 sm:p-8", mt.card)}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t("contact.firstName")} *
              </label>
              <input
                required
                className={inputClass}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                {t("contact.lastName")} *
              </label>
              <input
                required
                className={inputClass}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              {t("contact.email")} *
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                required
                type="email"
                className={cn(inputClass, "pl-10")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{t("checkout.accountSetup.emailHint")}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              {t("contact.phone")}
            </label>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              {t("checkout.accountSetup.parentName")}
            </label>
            <input
              className={inputClass}
              value={form.parentName}
              onChange={(e) => setForm({ ...form, parentName: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              {t("checkout.accountSetup.notes")}
            </label>
            <textarea
              rows={4}
              className={inputClass}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t("checkout.accountSetup.notesPlaceholder")}
            />
          </div>

          <Button variant="gold" size="lg" className="w-full" disabled={submitting} type="submit">
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("checkout.accountSetup.submit")
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function AccountSetupPage() {
  const mt = useMarketingTheme();

  return (
    <div className={cn("marketing-page-root flex min-h-screen flex-col", mt.page)}>
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
            </div>
          }
        >
          <AccountSetupContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
