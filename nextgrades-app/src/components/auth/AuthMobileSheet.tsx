"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { authSurface } from "@/components/auth/auth-ui";
import { AuthModeSwitch } from "@/components/auth/AuthModeSwitch";
import { RegisterForm } from "@/components/auth/RegisterForm";

type Tab = "login" | "register";

type LoginFormProps = {
  email: string;
  password: string;
  showPassword: boolean;
  rememberMe: boolean;
  loading: boolean;
  emailError?: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onTogglePassword: () => void;
  onRememberChange: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
};

type Props = {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  error: string | null;
  duplicateEmail: boolean;
  onClearDuplicate: () => void;
  loginLabels: {
    headline: string;
    subtitle: string;
    loginTab: string;
    registerTab: string;
    email: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    loginBtn: string;
    goToLogin: string;
    termsPrefix: string;
    terms: string;
    and: string;
    privacy: string;
  };
  loginForm: LoginFormProps;
  redirectTo?: string | null;
  onRegisterError?: (message: string | null, duplicateEmail?: boolean) => void;
};

export function AuthMobileSheet({
  tab,
  onTabChange,
  error,
  duplicateEmail,
  onClearDuplicate,
  loginLabels,
  loginForm,
  redirectTo,
  onRegisterError,
}: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const s = authSurface(isDark);

  return (
    <div className={cn("relative flex min-h-[calc(100dvh-4.5rem)] flex-col md:min-h-0", s.pageBg)}>
      {/* Navy header with grid texture */}
      <div
        className={cn(
          "relative shrink-0 px-5 pb-28 pt-6",
          isDark ? "bg-[#0D1B2A]" : "bg-[#0D1B2A]"
        )}
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,175,55,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      >
        <Link
          href="/"
          className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/15"
          aria-label={t("login.backToHome")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="max-w-[280px] text-[1.65rem] font-bold leading-tight text-white">
          {loginLabels.headline}
        </h1>
        <p className="mt-2 max-w-[300px] text-sm leading-relaxed text-gray-400">
          {loginLabels.subtitle}
        </p>
      </div>

      {/* Bottom sheet card */}
      <div
        className={cn(
          "-mt-20 flex flex-1 flex-col rounded-t-[2rem] border px-5 pb-8 pt-6 sm:px-6",
          s.card,
          s.cardShadow
        )}
      >
        {/* Tab switcher */}
        <div className={cn("mb-6 grid grid-cols-2 gap-1 rounded-2xl p-1", s.tabTrack)}>
          {(["login", "register"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className={cn(
                "rounded-xl py-2.5 text-sm font-semibold transition-all duration-200",
                tab === key ? s.tabActive : s.tabIdle
              )}
            >
              {key === "login" ? loginLabels.loginTab : loginLabels.registerTab}
            </button>
          ))}
        </div>

        {error && (
          <div className={cn("mb-4 rounded-2xl border px-4 py-3 text-sm", s.errorBox)}>
            {error}
            {duplicateEmail && (
              <button type="button" onClick={onClearDuplicate} className={cn("mt-2 block", s.link)}>
                {loginLabels.goToLogin}
              </button>
            )}
          </div>
        )}

        {tab === "register" ? (
          <>
            <RegisterForm
              compact
              appearance="sheet"
              hideFooterLink
              hideInlineError
              redirectTo={redirectTo}
              onSwitchToLogin={() => onTabChange("login")}
              onError={onRegisterError}
            />
            <AuthModeSwitch mode="register" onSwitch={() => onTabChange("login")} className="mt-5" />
          </>
        ) : (
          <>
            <form className="space-y-4" onSubmit={loginForm.onSubmit}>
              <div className="space-y-1.5">
                <label htmlFor="mobile-email" className={cn("text-sm font-medium", s.label)}>
                  {loginLabels.email}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    id="mobile-email"
                    type="email"
                    autoComplete="email"
                    value={loginForm.email}
                    onChange={(e) => loginForm.onEmailChange(e.target.value)}
                    placeholder={t("login.emailPlaceholder")}
                    className={cn(loginForm.emailError && "border-red-400/50", s.input)}
                  />
                </div>
                {loginForm.emailError && (
                  <p className="text-xs text-red-500">{loginForm.emailError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="mobile-password" className={cn("text-sm font-medium", s.label)}>
                  {loginLabels.password}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    id="mobile-password"
                    type={loginForm.showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={loginForm.password}
                    onChange={(e) => loginForm.onPasswordChange(e.target.value)}
                    placeholder="••••••••"
                    className={cn(s.input, s.inputWithTrail)}
                  />
                  <button
                    type="button"
                    onClick={loginForm.onTogglePassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#D4AF37]"
                    aria-label={loginForm.showPassword ? t("login.hidePassword") : t("login.showPassword")}
                  >
                    {loginForm.showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <label className={cn("flex cursor-pointer items-center gap-2 text-xs sm:text-sm", s.body)}>
                  <input
                    type="checkbox"
                    checked={loginForm.rememberMe}
                    onChange={(e) => loginForm.onRememberChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  {loginLabels.rememberMe}
                </label>
                <Link href="/forgot-password" className={cn("text-xs sm:text-sm", s.link)}>
                  {loginLabels.forgotPassword}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loginForm.loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-4 py-3.5 text-sm font-bold text-[#0D1B2A] transition hover:bg-[#e5c158] disabled:opacity-60"
              >
                {loginForm.loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0D1B2A] border-t-transparent" />
                ) : (
                  loginLabels.loginBtn
                )}
              </button>
            </form>

            <AuthModeSwitch mode="login" onSwitch={() => onTabChange("register")} className="mt-5" />
          </>
        )}

        <p className={cn("mt-6 text-center text-[11px] leading-relaxed", s.body)}>
          {loginLabels.termsPrefix}{" "}
          <Link href="/terms" className={s.link}>
            {loginLabels.terms}
          </Link>{" "}
          {loginLabels.and}{" "}
          <Link href="/privacy" className={s.link}>
            {loginLabels.privacy}
          </Link>
        </p>
      </div>
    </div>
  );
}
