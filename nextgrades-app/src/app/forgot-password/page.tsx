"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { CompactFooter } from "@/components/CompactFooter";
import { AuthField, AuthPrimaryButton } from "@/components/auth/AuthSplitCard";
import { authSurface } from "@/components/auth/auth-ui";
import { cn } from "@/lib/utils";
import { AuthGuestGuard } from "@/components/auth/AuthGuestGuard";
import { Button } from "@/components/ui/Button";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const s = authSurface(isDark);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !validateEmail(email)) {
      setError(t("login.enterValidEmail"));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("forgotPasswordPage.sendFailed"));
      }

      setSubmittedEmail(email.trim().toLowerCase());
      setSuccess(true);
      setEmail("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("forgotPasswordPage.sendFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell footer={<CompactFooter />}>
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div
          className={cn(
            "w-full max-w-md rounded-[2rem] border p-8 shadow-xl sm:p-10",
            s.card,
            isDark ? "shadow-black/40" : "shadow-gray-300/30"
          )}
        >
          <div className="mb-8 text-center">
            <div
              className={cn(
                "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
                success ? "bg-green-500/15" : "bg-[#D4AF37]/15"
              )}
            >
              {success ? (
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              ) : (
                <Mail className="h-7 w-7 text-[#D4AF37]" />
              )}
            </div>
            <h1 className={cn("text-2xl font-bold sm:text-3xl", s.heading)}>
              {success ? t("forgotPasswordPage.successTitle") : t("forgotPasswordPage.title")}
            </h1>
            <p className={cn("mt-2 text-sm leading-relaxed", s.body)}>
              {success ? t("forgotPasswordPage.successSubtitle") : t("forgotPasswordPage.subtitle")}
            </p>
          </div>

          {error && (
            <div className={cn("mb-6 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm", s.errorBox)}>
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-6">
              <p className={cn("rounded-2xl border px-4 py-4 text-sm leading-relaxed", s.body)}>
                {t("forgotPasswordPage.successBody", { email: submittedEmail })}
              </p>
              <Button variant="gold" size="md" href="/login" className="w-full">
                {t("forgotPasswordPage.backToLogin")}
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <AuthField
                id="forgot-email"
                label={t("login.email")}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder={t("login.emailPlaceholder")}
              />
              <AuthPrimaryButton loading={loading} variant="gold">
                {t("forgotPasswordPage.submit")}
              </AuthPrimaryButton>
            </form>
          )}

          <p className={cn("mt-8 text-center text-sm", s.body)}>
            <Link href="/login" className={s.link}>
              {t("forgotPasswordPage.backToLogin")}
            </Link>
          </p>
        </div>
      </div>
    </AuthPageShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthGuestGuard>
      <ForgotPasswordContent />
    </AuthGuestGuard>
  );
}
