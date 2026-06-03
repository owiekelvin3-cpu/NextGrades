"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { fetchProfileRole, resolvePostAuthRedirect } from "@/lib/auth/redirect";
import { syncPreferencesAfterAuth } from "@/lib/preferences";
import { changeAppLanguage } from "@/components/I18nProvider";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
import { authSurface } from "@/components/auth/auth-ui";
import { VerificationCodePanel } from "@/components/auth/VerificationCodePanel";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowRight,
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

type RegisterFormProps = {
  defaultRole?: "student" | "teacher";
  redirectTo?: string | null;
  onSwitchToLogin?: () => void;
  compact?: boolean;
  /** Sheet styling for mobile auth bottom card */
  appearance?: "default" | "sheet";
  hideFooterLink?: boolean;
  /** Hide inline errors — parent shows them (login page) */
  hideInlineError?: boolean;
  onError?: (message: string | null, duplicateEmail?: boolean) => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm({
  defaultRole = "student",
  redirectTo,
  onSwitchToLogin,
  compact = false,
  appearance = "default",
  hideFooterLink = false,
  hideInlineError = false,
  onError,
}: RegisterFormProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isSheet = appearance === "sheet";
  const isDark = theme === "dark";
  const s = authSurface(isDark);
  const router = useRouter();
  const [role, setRole] = useState<"student" | "teacher">(defaultRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateEmail, setDuplicateEmail] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const inputClass = cn(
    "w-full py-3 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20",
    isSheet ? "pl-11 pr-4 text-sm" : "pl-12 pr-4",
    isSheet
      ? isDark
        ? "border-transparent bg-[#0D1B2A]/60 text-white placeholder:text-gray-500 focus:border-[#D4AF37]/40"
        : "border-transparent bg-[#F3F4F6] text-[#0D1B2A] placeholder:text-[#9CA3AF] focus:border-[#D4AF37]/50 focus:bg-white"
      : cn(
          "border-2 focus:border-[#D4AF37]",
          isDark
            ? "border-white/10 bg-[#112240]/50 text-white placeholder:text-gray-500 focus:bg-[#1a2e4a]"
            : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
        )
  );

  const goToLogin = useCallback(() => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
      return;
    }
    const params = new URLSearchParams();
    if (redirectTo) params.set("redirect", redirectTo);
    if (email) params.set("email", email);
    router.push(`/login${params.toString() ? `?${params}` : ""}`);
  }, [router, redirectTo, email, onSwitchToLogin]);

  const finishAndRedirect = useCallback(
    async (userId: string) => {
      await syncPreferencesAfterAuth((lang) => changeAppLanguage(lang));
      const role = await fetchProfileRole(userId);
      const path = role ? resolvePostAuthRedirect(role, redirectTo) : "/choose-role";
      router.replace(path);
      router.refresh();
    },
    [router, redirectTo]
  );

  useEffect(() => {
    if (!duplicateEmail) return;
    const timer = setTimeout(goToLogin, 4000);
    return () => clearTimeout(timer);
  }, [duplicateEmail, goToLogin]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      next.fullName = t("login.validationFullName");
    }
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      next.email = t("login.validationEmail");
    }
    if (password.length < 8) {
      next.password = t("login.validationPasswordLength");
    }
    if (password !== confirmPassword) {
      next.confirmPassword = t("login.validationPasswordMatch");
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const reportError = (message: string | null, dup = false) => {
    setError(message);
    setDuplicateEmail(dup);
    onError?.(message, dup);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reportError(null, false);
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
          role,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const raw = await res.text();
      let data: Record<string, unknown> = {};
      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          throw new Error(t("login.invalidServerResponse"));
        }
      } else if (raw.trimStart().startsWith("<!DOCTYPE") || raw.trimStart().startsWith("<html")) {
        throw new Error(
          res.status === 404
            ? t("login.registrationApiUnavailable")
            : t("login.registrationUnexpectedPage")
        );
      } else {
        throw new Error(raw || t("login.registrationFailed"));
      }

      if (res.status === 409 || data.code === "EMAIL_EXISTS") {
        reportError(t("login.emailExists"), true);
        return;
      }

      if (!res.ok) {
        throw new Error(
          (typeof data.error === "string" && data.error) ||
            (typeof data.details === "string" && data.details) ||
            t("login.registrationFailed")
        );
      }

      const verificationRequired = data.verificationRequired === true;

      if (verificationRequired) {
        setVerificationPending(true);
        setSuccessMessage(
          typeof data.message === "string" ? data.message : t("login.verifyEmailMessage")
        );
        setSuccess(true);
        return;
      }

      setVerificationPending(false);

      const signIn = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signIn.error || !signIn.data.user) {
        setSuccessMessage(t("login.accountCreatedSignIn"));
        setSuccess(true);
        return;
      }

      await finishAndRedirect(signIn.data.user.id);
    } catch (err) {
      reportError(err instanceof Error ? err.message : t("login.registrationFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className={cn(
          "rounded-xl border-l-4 p-5 text-sm",
          theme === "dark"
            ? "border-green-500 bg-green-500/10 text-green-300"
            : "border-green-500 bg-green-50 text-green-800"
        )}
        role="status"
      >
        <div className="flex items-start gap-3">
          <FontAwesomeIcon icon={faCheckCircle} className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-3">
            <div>
              <p className="font-semibold">{t("login.accountCreatedTitle")}</p>
              <p className="mt-1 opacity-90">{successMessage}</p>
            </div>
            {verificationPending ? (
              <VerificationCodePanel
                email={email}
                password={password}
                variant="inline"
                onVerified={finishAndRedirect}
                onError={(msg) => reportError(msg)}
              />
            ) : (
              <Link
                href={
                  redirectTo
                    ? `/login?redirect=${encodeURIComponent(redirectTo)}&email=${encodeURIComponent(email)}`
                    : `/login?email=${encodeURIComponent(email)}`
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#0D1B2A] hover:opacity-90"
              >
                {t("login.signInNow")} <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className={cn("space-y-4", !isSheet && "space-y-5")} onSubmit={handleSubmit} noValidate>
      {error && !hideInlineError && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border-l-4 p-4 text-sm",
            theme === "dark"
              ? "border-red-500 bg-red-500/10 text-red-300"
              : "border-red-500 bg-red-50 text-red-700"
          )}
          role="alert"
        >
          <FontAwesomeIcon icon={faExclamationCircle} className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p>{error}</p>
            {duplicateEmail && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={goToLogin}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#0D1B2A] hover:opacity-90"
                >
                  {t("login.goToLogin")} <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
                </button>
                <span className="text-xs opacity-75">{t("login.redirectingSoon")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {isSheet ? (
        <div className={cn("grid grid-cols-2 gap-1 rounded-2xl p-1", s.tabTrack)}>
          {(["student", "teacher"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "rounded-xl py-2 text-xs font-semibold capitalize transition sm:text-sm",
                role === r ? s.tabActive : s.tabIdle
              )}
            >
              {r === "student" ? t("login.student") : t("login.teacher")}
            </button>
          ))}
        </div>
      ) : (
      <div className="space-y-3">
        <label className={cn("text-sm font-semibold", isDark ? "text-gray-300" : "text-gray-700")}>
          {t("login.registeringAs")}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["student", "teacher"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                role === r
                  ? "border-[#D4AF37] bg-[#D4AF37]/10"
                  : isDark
                    ? "border-white/10 bg-[#112240]/50 hover:border-[#D4AF37]/40"
                    : "border-gray-200 bg-white hover:border-[#D4AF37]/40"
              )}
            >
              <p className={cn("text-sm font-bold", isDark ? "text-white" : "text-[#0D1B2A]")}>
                {r === "student" ? t("login.student") : t("login.teacher")}
              </p>
              <p className={cn("mt-1 text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                {r === "student" ? t("login.learnAndGrow") : t("login.teachAndInspire")}
              </p>
            </button>
          ))}
        </div>
      </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="reg-full-name" className={cn("text-sm font-medium", isSheet ? s.label : isDark ? "text-gray-300" : "text-gray-700", !isSheet && "font-semibold")}>
          {isSheet ? t("login.nameLabel") : t("login.fullName")}
        </label>
        <div className="relative">
          <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="reg-full-name"
            type="text"
            autoComplete="name"
            placeholder={t("login.fullNamePlaceholder")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={cn(inputClass, fieldErrors.fullName && "border-red-500")}
            aria-invalid={Boolean(fieldErrors.fullName)}
          />
        </div>
        {fieldErrors.fullName && <p className="text-xs text-red-500">{fieldErrors.fullName}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reg-email" className={cn("text-sm font-medium", isSheet ? s.label : isDark ? "text-gray-300" : "text-gray-700", !isSheet && "font-semibold")}>
          {t("login.email")}
        </label>
        <div className="relative">
          <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder={t("login.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(inputClass, fieldErrors.email && "border-red-500")}
            aria-invalid={Boolean(fieldErrors.email)}
          />
        </div>
        {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reg-password" className={cn("text-sm font-medium", isSheet ? s.label : isDark ? "text-gray-300" : "text-gray-700", !isSheet && "font-semibold")}>
          {t("login.password")}
        </label>
        <div className="relative">
          <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={t("login.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(inputClass, "pr-12", fieldErrors.password && "border-red-500")}
            aria-invalid={Boolean(fieldErrors.password)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37]"
            aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-5 w-5" />
          </button>
        </div>
        {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reg-confirm" className={cn("text-sm font-medium", isSheet ? s.label : isDark ? "text-gray-300" : "text-gray-700", !isSheet && "font-semibold")}>
          {t("login.confirmPassword")}
        </label>
        <div className="relative">
          <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="reg-confirm"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder={t("login.confirmPasswordPlaceholder")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={cn(inputClass, "pr-12", fieldErrors.confirmPassword && "border-red-500")}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37]"
            aria-label={showConfirm ? t("login.hideConfirmPassword") : t("login.showConfirmPassword")}
          >
            <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} className="h-5 w-5" />
          </button>
        </div>
        {fieldErrors.confirmPassword && <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
      </div>

      {isSheet ? (
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#D4AF37] px-4 py-3.5 text-sm font-bold text-[#0D1B2A] transition hover:bg-[#e5c158] disabled:opacity-60 md:bg-[#0D1B2A] md:font-semibold md:text-white md:hover:bg-[#132942]"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            t("login.registerBtn")
          )}
        </button>
      ) : (
      <Button
        type="submit"
        variant="gold"
        size={compact ? "lg" : "xl"}
        className={cn("mt-2 w-full", isSheet ? "!rounded-2xl" : "!rounded-xl")}
        disabled={loading}
      >
        {loading ? t("login.creatingAccount") : t("login.createAccountBtn")}
      </Button>
      )}

      {!hideFooterLink && (
      <p className={cn("text-center text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
        {t("login.haveAccount")}{" "}
        {onSwitchToLogin ? (
          <button type="button" onClick={onSwitchToLogin} className="font-bold text-[#D4AF37] hover:opacity-90">
            {t("login.signIn")}
          </button>
        ) : (
          <Link href="/login" className="font-bold text-[#D4AF37] hover:opacity-90">
            {t("login.signIn")}
          </Link>
        )}
      </p>
      )}
    </form>
  );
}
