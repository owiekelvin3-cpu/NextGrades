"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase/client";
import { sanitizeRedirect, fetchProfileRole, resolvePostAuthRedirect } from "@/lib/auth/redirect";
import { useToast } from "@/context/ToastContext";
import { syncPreferencesAfterAuth } from "@/lib/preferences";
import { changeAppLanguage } from "@/components/I18nProvider";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthMobileSheet } from "@/components/auth/AuthMobileSheet";
import {
  AuthSplitCard,
  AuthSplitHeader,
  AuthField,
  AuthPrimaryButton,
  AuthTabSwitcher,
} from "@/components/auth/AuthSplitCard";
import { AuthModeSwitch } from "@/components/auth/AuthModeSwitch";
import { authSurface } from "@/components/auth/auth-ui";
import { useCmsImage } from "@/hooks/useCmsImage";
import { LOGIN_HERO_IMAGE } from "@/lib/marketing-images";
import { cn } from "@/lib/utils";
import { AuthGuestGuard } from "@/components/auth/AuthGuestGuard";

const REMEMBER_EMAIL_KEY = "nextgrades_remember_email";

type AuthTab = "login" | "register";

function LoginContent() {
  const [tab, setTab] = useState<AuthTab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateEmail, setDuplicateEmail] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const toast = useToast();
  const loginHeroImage = useCmsImage("cmsImages.auth.loginHero", LOGIN_HERO_IMAGE);
  const isDark = theme === "dark";
  const s = authSurface(isDark);

  const redirectTo = sanitizeRedirect(searchParams.get("redirect"));
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formValidation, setFormValidation] = useState({ email: "", password: "" });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "email") {
      if (!value) setFormValidation((p) => ({ ...p, email: "" }));
      else if (!validateEmail(value))
        setFormValidation((p) => ({ ...p, email: t("login.invalidEmail", { defaultValue: "Invalid email" }) }));
      else setFormValidation((p) => ({ ...p, email: "" }));
    }
    if (field === "password" && !value) setFormValidation((p) => ({ ...p, password: "" }));
  };

  useEffect(() => {
    if (searchParams.get("mode") === "signup") setTab("register");
    const emailParam = searchParams.get("email");
    const remembered = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (emailParam) setFormData((prev) => ({ ...prev, email: emailParam }));
    else if (remembered) {
      setFormData((prev) => ({ ...prev, email: remembered }));
      setRememberMe(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (searchParams.get("suspended") === "1") {
      setError(
        t("login.accountSuspended", {
          defaultValue: "Your account has been suspended. Contact support@nextgrades.de if you believe this is a mistake.",
        })
      );
    } else if (errorParam === "profile_incomplete") {
      setError(t("login.profileIncomplete", { defaultValue: "Your account profile is incomplete. Please contact support." }));
    } else if (errorParam) setError(decodeURIComponent(errorParam));
  }, [searchParams, t]);

  const navigateAfterAuth = async (userId: string) => {
    await syncPreferencesAfterAuth((lang) => changeAppLanguage(lang));
    const role = await fetchProfileRole(userId);
    if (!role) {
      router.replace("/choose-role");
      router.refresh();
      return;
    }
    router.replace(resolvePostAuthRedirect(role, redirectTo));
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab !== "login") return;

    setLoading(true);
    setError(null);
    setDuplicateEmail(false);

    if (!formData.email || !validateEmail(formData.email)) {
      setError(t("login.enterValidEmail", { defaultValue: "Please enter a valid email address" }));
      setLoading(false);
      return;
    }
    if (!formData.password) {
      setError(t("login.enterPassword", { defaultValue: "Please enter your password" }));
      setLoading(false);
      return;
    }

    try {
      await fetch("/api/auth/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
      });

      const result = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (result.error) throw new Error(result.error.message);

      if (rememberMe) localStorage.setItem(REMEMBER_EMAIL_KEY, formData.email.trim());
      else localStorage.removeItem(REMEMBER_EMAIL_KEY);

      toast.success(t("login.welcomeBack", { defaultValue: "Welcome back!" }));
      await navigateAfterAuth(result.data.user!.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("login.authFailed", { defaultValue: "Authentication failed" });
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const labels = useMemo(
    () => ({
      headline:
        tab === "register" ? t("login.mobileRegisterHeadline") : t("login.mobileLoginHeadline"),
      subtitle:
        tab === "register" ? t("login.mobileRegisterSubtitle") : t("login.mobileLoginSubtitle"),
      loginTab: t("login.signIn"),
      registerTab: t("login.signUpLink"),
      email: t("login.email"),
      password: t("login.password"),
      rememberMe: t("login.rememberMe"),
      forgotPassword: t("login.forgotPassword"),
      loginBtn: t("login.signIn"),
      goToLogin: t("login.goToLogin"),
      termsPrefix: t("login.termsPrefix"),
      terms: t("login.terms"),
      and: t("login.and"),
      privacy: t("login.privacy"),
      welcomeTitle: t("login.welcomeBackTitle"),
      loginSubtitle: t("login.loginSubtitle"),
      heroCaption: t("login.heroCaption"),
    }),
    [t, tab]
  );

  const clearAuthError = () => {
    setError(null);
    setDuplicateEmail(false);
  };

  const handleRegisterError = (message: string | null, dup?: boolean) => {
    setError(message);
    setDuplicateEmail(!!dup);
  };

  const loginFormProps = {
    email: formData.email,
    password: formData.password,
    showPassword,
    rememberMe,
    loading,
    emailError: formValidation.email,
    onEmailChange: (v: string) => handleInputChange("email", v),
    onPasswordChange: (v: string) => handleInputChange("password", v),
    onTogglePassword: () => setShowPassword(!showPassword),
    onRememberChange: setRememberMe,
    onSubmit: handleSubmit,
  };

  const errorBlock = error && (
    <div className={cn("mb-6 rounded-2xl border px-4 py-3 text-sm", s.errorBox)}>
      {error}
      {duplicateEmail && (
        <button
          type="button"
          onClick={() => {
            setTab("login");
            clearAuthError();
          }}
          className={cn("mt-2 block", s.link)}
        >
          {t("login.goToLogin", { defaultValue: "Go to Login" })}
        </button>
      )}
    </div>
  );

  const desktopRegisterForm = (
    <>
      <RegisterForm
        compact
        appearance="sheet"
        hideFooterLink
        hideInlineError
        redirectTo={redirectTo}
        onSwitchToLogin={() => {
          setTab("login");
          clearAuthError();
        }}
        onError={handleRegisterError}
      />
      <AuthModeSwitch mode="register" onSwitch={() => { setTab("login"); clearAuthError(); }} className="mt-6" />
    </>
  );

  const desktopLoginForm = (
    <>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthField
          id="desktop-email"
          label={labels.email}
          type="email"
          value={formData.email}
          onChange={(v) => handleInputChange("email", v)}
          placeholder={t("login.emailPlaceholder")}
          error={formValidation.email}
        />
        <AuthField
          id="desktop-password"
          label={labels.password}
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
            {labels.rememberMe}
          </label>
          <Link href="/forgot-password" className={cn("text-sm", s.link)}>
            {labels.forgotPassword}
          </Link>
        </div>
        <AuthPrimaryButton loading={loading} variant="navy">
          {labels.loginBtn}
        </AuthPrimaryButton>
      </form>
      <AuthModeSwitch mode="login" onSwitch={() => { setTab("register"); clearAuthError(); }} className="mt-6" />
    </>
  );

  return (
    <>
      <div className={cn("marketing-page-root flex min-h-screen flex-col", isDark ? "bg-[#0D1B2A]" : "bg-[#F0F2F5]")}>
        <Navbar />

        <main className="flex-1 pt-site-nav md:pt-20">
          {/* Mobile — bottom sheet */}
          <div className="md:hidden">
            <AuthMobileSheet
              tab={tab}
              onTabChange={(next) => {
                setTab(next);
                clearAuthError();
              }}
              error={error}
              duplicateEmail={duplicateEmail}
              onClearDuplicate={() => {
                setTab("login");
                clearAuthError();
              }}
              loginLabels={labels}
              loginForm={loginFormProps}
              redirectTo={redirectTo}
              onRegisterError={handleRegisterError}
            />
          </div>

          {/* Desktop — split card */}
          <div className="hidden md:block">
            <AuthSplitCard heroImage={loginHeroImage} heroCaption={labels.heroCaption}>
              <AuthSplitHeader title={labels.welcomeTitle} subtitle={labels.loginSubtitle} />

              <AuthTabSwitcher
                tab={tab}
                onTabChange={(next) => {
                  setTab(next);
                  clearAuthError();
                }}
                loginLabel={labels.loginTab}
                registerLabel={labels.registerTab}
              />

              {errorBlock}

              {tab === "register" ? desktopRegisterForm : desktopLoginForm}

              <p className={cn("mt-8 text-center text-xs leading-relaxed", s.body)}>
                {labels.termsPrefix}{" "}
                <Link href="/terms" className={s.link}>
                  {labels.terms}
                </Link>{" "}
                {labels.and}{" "}
                <Link href="/privacy" className={s.link}>
                  {labels.privacy}
                </Link>
              </p>
            </AuthSplitCard>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthGuestGuard>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#F0F2F5] text-[#6B7280] dark:bg-[#0D1B2A] dark:text-gray-400">
            …
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </AuthGuestGuard>
  );
}
