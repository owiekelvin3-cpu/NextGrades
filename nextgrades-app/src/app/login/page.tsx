"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { CompactFooter } from "@/components/CompactFooter";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { supabase } from "@/lib/supabase/client";
import { sanitizeRedirect, fetchProfileRole, resolvePostAuthRedirect } from "@/lib/auth/redirect";
import { syncPreferencesAfterAuth } from "@/lib/preferences";
import { changeAppLanguage } from "@/components/I18nProvider";
import { useToast } from "@/context/ToastContext";
import { TurnstileWidget, isTurnstileEnabled } from "@/components/auth/TurnstileWidget";
import {
  AuthSplitCard,
  AuthSplitHeader,
  AuthField,
  AuthPrimaryButton,
} from "@/components/auth/AuthSplitCard";
import {
  AuthMobileShell,
  AuthMobileIllustration,
} from "@/components/auth/AuthMobileShell";
import {
  AuthMobileField,
  AuthMobilePrimaryButton,
} from "@/components/auth/AuthMobileField";
import { authSurface } from "@/components/auth/auth-ui";
import { useMarketingHeroImage } from "@/hooks/useCmsImage";
import { cn } from "@/lib/utils";
import { AuthGuestGuard } from "@/components/auth/AuthGuestGuard";
import { AuthModeSwitch } from "@/components/auth/AuthModeSwitch";
import { isPublicSignupEnabled } from "@/lib/auth/public-signup";
import {
  isAuthUserEmailVerified,
  isClientEmailVerificationRequired,
  isClientLoginOtpRequired,
} from "@/lib/auth/config";
import { isEmailNotConfirmedError, translateAuthError } from "@/lib/auth/auth-errors";
import {
  buildVerifyUrl,
  savePendingVerification,
} from "@/lib/auth/pending-verification-storage";

const REMEMBER_EMAIL_KEY = "nextgrades_remember_email";

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const toast = useToast();
  const loginHeroImage = useMarketingHeroImage();
  const isDark = theme === "dark";
  const s = authSurface(isDark);
  const showInviteNote = !isPublicSignupEnabled();

  const redirectTo = sanitizeRedirect(searchParams.get("redirect"));
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formValidation, setFormValidation] = useState({ email: "", password: "" });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const goToVerification = (step: "signup" | "login", email: string, password?: string) => {
    savePendingVerification({ step, email, password, redirect: redirectTo });
    router.push(buildVerifyUrl(step, email, redirectTo));
  };

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "email") {
      if (!value) setFormValidation((p) => ({ ...p, email: "" }));
      else if (!validateEmail(value))
        setFormValidation((p) => ({ ...p, email: t("login.invalidEmail") }));
      else setFormValidation((p) => ({ ...p, email: "" }));
    }
    if (field === "password" && !value) setFormValidation((p) => ({ ...p, password: "" }));
  };

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const remembered = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (emailParam) setFormData((prev) => ({ ...prev, email: emailParam }));
    else if (remembered) {
      setFormData((prev) => ({ ...prev, email: remembered }));
      setRememberMe(true);
    }
  }, [searchParams, t]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const emailParam = searchParams.get("email");
    if (errorParam === "email_not_verified" && emailParam) {
      router.replace(buildVerifyUrl("signup", emailParam, redirectTo));
      return;
    }
    if (errorParam === "login_otp_required" && emailParam) {
      savePendingVerification({ step: "login", email: emailParam, redirect: redirectTo });
      router.replace(buildVerifyUrl("login", emailParam, redirectTo));
      return;
    }
    if (searchParams.get("suspended") === "1") {
      setError(t("login.accountSuspended"));
    } else if (errorParam === "profile_incomplete") {
      setError(t("login.profileIncomplete"));
    } else if (errorParam && errorParam !== "email_not_verified" && errorParam !== "login_otp_required") {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams, t, redirectTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.email || !validateEmail(formData.email)) {
      setError(t("login.enterValidEmail"));
      setLoading(false);
      return;
    }
    if (!formData.password) {
      setError(t("login.enterPassword"));
      setLoading(false);
      return;
    }

    if (isTurnstileEnabled() && !turnstileToken) {
      setError(t("login.completeSecurityCheck", { defaultValue: "Bitte schließe die Sicherheitsprüfung ab." }));
      setLoading(false);
      return;
    }

    const normalizedEmail = formData.email.trim().toLowerCase();

    try {
      const result = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: formData.password,
      });

      if (result.error) {
        if (isEmailNotConfirmedError(result.error)) {
          goToVerification("signup", normalizedEmail, formData.password);
          return;
        }
        void fetch("/api/auth/login/failed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, turnstileToken }),
        });
        throw new Error(translateAuthError(result.error.message));
      }

      if (
        isClientEmailVerificationRequired() &&
        result.data.user &&
        !isAuthUserEmailVerified(result.data.user)
      ) {
        goToVerification("signup", normalizedEmail, formData.password);
        return;
      }

      if (rememberMe) localStorage.setItem(REMEMBER_EMAIL_KEY, normalizedEmail);
      else localStorage.removeItem(REMEMBER_EMAIL_KEY);

      if (isClientLoginOtpRequired()) {
        const challenge = await fetch("/api/auth/login/challenge", { method: "POST" });
        const challengeData = await challenge.json().catch(() => ({}));
        if (!challenge.ok) {
          throw new Error(challengeData.error || t("login.authFailed"));
        }
        if (challengeData.mfaRequired) {
          goToVerification("login", normalizedEmail);
          return;
        }
      }

      await syncPreferencesAfterAuth((lang) => changeAppLanguage(lang));
      const role = await fetchProfileRole(result.data.user!.id);
      router.replace(role ? resolvePostAuthRedirect(role, redirectTo) : "/choose-role");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? translateAuthError(err.message) : t("login.authFailed");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const heroBenefits = useMemo(
    () => [
      t("login.heroBenefit1"),
      t("login.heroBenefit2"),
      t("login.heroBenefit3"),
      t("login.heroBenefit4"),
    ],
    [t]
  );

  const heroPanel = (
    <div className="max-w-md">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">{t("login.heroHeadline")}</p>
      <h2 className="mb-3 text-3xl font-bold leading-tight text-white">{t("login.heroTagline")}</h2>
      <p className="mb-6 text-sm leading-relaxed text-gray-200">{t("login.heroDesc")}</p>
      <ul className="space-y-3">
        {heroBenefits.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-white/90">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#D4AF37]" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <AuthMobileShell
        title={t("login.mobileLoginHeadline")}
        subtitle={t("login.mobileLoginSubtitle")}
        illustration={
          <AuthMobileIllustration src={loginHeroImage} alt="" />
        }
      >
        {showInviteNote && (
          <p
            className={cn(
              "mb-4 rounded-xl border px-4 py-3 text-sm leading-relaxed",
              isDark
                ? "border-[var(--brand-gold)]/25 bg-[var(--brand-gold)]/10 text-zinc-300"
                : "border-[var(--brand-gold)]/30 bg-[var(--brand-gold-muted)] text-[#0D1B2A]/80"
            )}
            role="status"
          >
            {t("login.inviteOnlyNote")}
          </p>
        )}

        {error && (
          <div
            className={cn(
              "mb-5 rounded-xl border-l-4 px-4 py-3 text-sm",
              isDark
                ? "border-red-500 bg-red-500/10 text-red-300"
                : "border-red-500 bg-red-50 text-red-700"
            )}
            role="alert"
          >
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <AuthMobileField
            id="login-email-mobile"
            label={t("login.email")}
            type="email"
            value={formData.email}
            onChange={(v) => handleInputChange("email", v)}
            placeholder={t("login.emailPlaceholder")}
            error={formValidation.email}
            autoComplete="email"
          />
          <AuthMobileField
            id="login-password-mobile"
            label={t("login.password")}
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(v) => handleInputChange("password", v)}
            placeholder="••••••••"
            autoComplete="current-password"
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37]"
                aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
          />
          <div className="flex items-center justify-between gap-3 pt-1">
            <label
              className={cn(
                "flex cursor-pointer items-center gap-2 text-sm",
                isDark ? "text-gray-300" : "text-gray-600"
              )}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              {t("login.rememberMe")}
            </label>
            <Link
              href="/forgot-password"
              className={cn("text-sm font-medium text-[#D4AF37] hover:opacity-90")}
            >
              {t("login.forgotPassword")}
            </Link>
          </div>
          <TurnstileWidget
            onToken={setTurnstileToken}
            theme={isDark ? "dark" : "light"}
            className="flex justify-center"
          />
          <AuthMobilePrimaryButton loading={loading}>{t("login.signIn")}</AuthMobilePrimaryButton>
        </form>

        <AuthModeSwitch mode="login" className="mt-6" />

        <p
          className={cn(
            "mt-8 text-center text-xs leading-relaxed",
            isDark ? "text-gray-500" : "text-gray-500"
          )}
        >
          {t("login.termsPrefix")}{" "}
          <Link href="/terms" className="font-medium text-[#D4AF37] hover:opacity-90">
            {t("login.terms")}
          </Link>{" "}
          {t("login.and")}{" "}
          <Link href="/privacy" className="font-medium text-[#D4AF37] hover:opacity-90">
            {t("login.privacy")}
          </Link>
        </p>
      </AuthMobileShell>

      <div className="hidden lg:contents">
        <AuthPageShell footer={<CompactFooter />}>
          <div className="flex flex-1 flex-col justify-center py-4 md:py-8">
            <AuthSplitCard heroImage={loginHeroImage} heroPanel={heroPanel} className="!bg-transparent">
              <AuthSplitHeader title={t("login.welcomeBackTitle")} subtitle={t("login.loginSubtitle")} />

              {showInviteNote && (
                <p
                  className={cn(
                    "mb-5 rounded-2xl border px-4 py-3 text-sm leading-relaxed",
                    isDark
                      ? "border-[var(--brand-gold)]/25 bg-[var(--brand-gold)]/10 text-zinc-300"
                      : "border-[var(--brand-gold)]/30 bg-[var(--brand-gold-muted)] text-[#0D1B2A]/80"
                  )}
                  role="status"
                >
                  {t("login.inviteOnlyNote")}
                </p>
              )}

              {error && (
                <div className={cn("mb-6 rounded-2xl border px-4 py-3 text-sm", s.errorBox)}>
                  <p>{error}</p>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <AuthField
                  id="login-email"
                  label={t("login.email")}
                  type="email"
                  value={formData.email}
                  onChange={(v) => handleInputChange("email", v)}
                  placeholder={t("login.emailPlaceholder")}
                  error={formValidation.email}
                />
                <AuthField
                  id="login-password"
                  label={t("login.password")}
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(v) => handleInputChange("password", v)}
                  placeholder="••••••••"
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={cn("absolute right-4 top-1/2 -translate-y-1/2 hover:text-[#D4AF37]", s.body)}
                      aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                />
                <div className="flex items-center justify-between gap-3 pt-1">
                  <label className={cn("flex cursor-pointer items-center gap-2 text-sm", s.body)}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    {t("login.rememberMe")}
                  </label>
                  <Link href="/forgot-password" className={cn("text-sm", s.link)}>
                    {t("login.forgotPassword")}
                  </Link>
                </div>
                <TurnstileWidget onToken={setTurnstileToken} theme={isDark ? "dark" : "light"} className="flex justify-center" />
                <AuthPrimaryButton loading={loading} variant="gold">
                  {t("login.signIn")}
                </AuthPrimaryButton>
              </form>

              <AuthModeSwitch mode="login" className="mt-6" />

              <p className={cn("mt-8 text-center text-xs leading-relaxed", s.body)}>
                {t("login.termsPrefix")}{" "}
                <Link href="/terms" className={s.link}>
                  {t("login.terms")}
                </Link>{" "}
                {t("login.and")}{" "}
                <Link href="/privacy" className={s.link}>
                  {t("login.privacy")}
                </Link>
              </p>
            </AuthSplitCard>
          </div>
        </AuthPageShell>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthGuestGuard>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
            …
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </AuthGuestGuard>
  );
}
