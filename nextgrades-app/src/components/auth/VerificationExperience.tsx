"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ShieldCheck, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { useResendCooldown } from "@/hooks/useResendCooldown";
import type { VerificationStep } from "@/lib/auth/pending-verification-storage";
import type { AppRole } from "@/lib/auth/roles";

type VerificationExperienceProps = {
  step: VerificationStep;
  email: string;
  password?: string;
  redirectTo?: string | null;
  onVerified: (userId: string, role?: AppRole | null) => void | Promise<void>;
  onChangeEmail?: () => void;
  autoSendCode?: boolean;
  /** Flat layout inside AuthMobileShell — no outer card */
  embedded?: boolean;
};

export function VerificationExperience({
  step,
  email,
  password,
  redirectTo,
  onVerified,
  onChangeEmail,
  autoSendCode = true,
  embedded = false,
}: VerificationExperienceProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";
  const isLogin = step === "login";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendOk, setResendOk] = useState(false);
  const [success, setSuccess] = useState(false);
  const [initialSendDone, setInitialSendDone] = useState(!autoSendCode);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const { secondsLeft, canResend, startCooldown } = useResendCooldown(60);

  const code = digits.join("");
  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => `${a}${"•".repeat(Math.min(b.length, 6))}${c}`);

  const reportError = useCallback((msg: string) => {
    setError(msg);
    setResendOk(false);
  }, []);

  const sendLoginCode = useCallback(async () => {
    const res = await fetch("/api/auth/login/challenge", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || t("verify.sendFailed"));
    return data;
  }, [t]);

  const sendSignupCode = useCallback(async () => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || t("verify.sendFailed"));
    return data;
  }, [email, t]);

  useEffect(() => {
    if (!autoSendCode || initialSendDone) return;
    let cancelled = false;

    (async () => {
      try {
        if (isLogin) await sendLoginCode();
        else await sendSignupCode();
        if (!cancelled) {
          startCooldown(60);
          setInitialSendDone(true);
        }
      } catch (err) {
        if (!cancelled) {
          reportError(err instanceof Error ? err.message : t("verify.sendFailed"));
          setInitialSendDone(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [autoSendCode, initialSendDone, isLogin, sendLoginCode, sendSignupCode, startCooldown, reportError, t]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setError(null);
    setResendOk(false);
    if (cleaned && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setDigits(pasted.split("").concat(Array(6).fill("")).slice(0, 6));
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = async () => {
    if (!canResend || resendLoading) return;
    setResendLoading(true);
    setError(null);
    try {
      if (isLogin) await sendLoginCode();
      else await sendSignupCode();
      setResendOk(true);
      setDigits(["", "", "", "", "", ""]);
      startCooldown(60);
      inputsRef.current[0]?.focus();
    } catch (err) {
      reportError(err instanceof Error ? err.message : t("verify.resendFailed"));
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6 || verifying) return;
    setVerifying(true);
    setError(null);

    try {
      if (isLogin) {
        const res = await fetch("/api/auth/login/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, rememberDevice }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || t("verify.invalidCode"));

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error(t("verify.sessionExpired"));

        setSuccess(true);
        await onVerified(user.id);
        return;
      }

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("verify.invalidCode"));

      let userId = typeof data.userId === "string" ? data.userId : null;
      const verifiedRole = typeof data.role === "string" ? (data.role as AppRole) : null;

      if (password) {
        const signIn = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (signIn.error || !signIn.data.user) {
          throw new Error(signIn.error?.message || t("login.authFailed"));
        }
        userId = signIn.data.user.id;
        await fetch("/api/auth/signup-session-ready", { method: "POST" });
      }

      if (!userId) throw new Error(t("verify.sessionExpired"));

      setSuccess(true);
      await onVerified(userId, verifiedRole);
    } catch (err) {
      reportError(err instanceof Error ? err.message : t("verify.invalidCode"));
    } finally {
      setVerifying(false);
    }
  };

  const handleChangeEmail = () => {
    if (onChangeEmail) {
      onChangeEmail();
      return;
    }
    router.push("/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative w-full overflow-hidden",
        embedded
          ? "p-0"
          : cn(
              "max-w-[440px] rounded-3xl border p-8 shadow-2xl sm:p-10",
              isDark
                ? "border-white/10 bg-[#112240]/90 shadow-black/40 backdrop-blur-xl"
                : "border-gray-200/80 bg-white/95 shadow-[0_32px_64px_-12px_rgba(13,27,42,0.12)] backdrop-blur-sm"
            )
      )}
    >
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15"
            >
              <CheckCircle2 className="h-10 w-10 text-emerald-500" strokeWidth={2} />
            </motion.div>
            <h2 className={cn("text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-[#0D1B2A]")}>
              {t("verify.successTitle")}
            </h2>
            <p className={cn("mt-2 text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
              {t("verify.successSubtitle")}
            </p>
            <Loader2 className="mt-6 h-5 w-5 animate-spin text-[#D4AF37]" />
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 ring-1 ring-[#D4AF37]/30">
                {isLogin ? (
                  <ShieldCheck className="h-7 w-7 text-[#D4AF37]" strokeWidth={1.75} />
                ) : (
                  <Mail className="h-7 w-7 text-[#D4AF37]" strokeWidth={1.75} />
                )}
              </div>
              <h1 className={cn("text-2xl font-bold tracking-tight sm:text-[1.65rem]", isDark ? "text-white" : "text-[#0D1B2A]")}>
                {isLogin ? t("verify.loginTitle") : t("verify.signupTitle")}
              </h1>
              <p className={cn("mt-2 max-w-[320px] text-sm leading-relaxed", isDark ? "text-gray-400" : "text-gray-600")}>
                {isLogin ? t("verify.loginSubtitle") : t("verify.signupSubtitle")}
              </p>
              <p className={cn("mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium", isDark ? "bg-white/5 text-[#D4AF37]" : "bg-[#0D1B2A]/5 text-[#0D1B2A]")}>
                <Mail className="h-3.5 w-3.5 opacity-70" />
                {maskedEmail}
              </p>
            </div>

            {!initialSendDone && (
              <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />
                {t("verify.sendingCode")}
              </div>
            )}

            <div
              className="mb-6 flex justify-center gap-2.5 sm:gap-3"
              onPaste={handlePaste}
              role="group"
              aria-label={t("login.verificationCodeLabel")}
            >
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={d}
                  disabled={verifying || !initialSendDone}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={cn(
                    "h-12 w-11 rounded-xl border-2 text-center text-xl font-semibold tabular-nums transition-all duration-200 sm:h-14 sm:w-12",
                    "focus:border-[#D4AF37] focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/15",
                    isDark
                      ? "border-white/15 bg-[#0D1B2A]/60 text-white"
                      : "border-gray-200 bg-gray-50/80 text-[#0D1B2A]",
                    error && "border-red-400/60 shake"
                  )}
                  aria-label={`${t("login.verificationCodeDigit")} ${i + 1}`}
                />
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {resendOk && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 text-center text-sm text-emerald-600 dark:text-emerald-400"
                  role="status"
                >
                  {t("verify.resendSuccess")}
                </motion.p>
              )}
            </AnimatePresence>

            {isLogin && (
              <label className="mb-6 flex cursor-pointer items-center justify-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                  {t("login.rememberDevice", { defaultValue: "Remember this device for 30 days" })}
                </span>
              </label>
            )}

            <button
              type="button"
              disabled={verifying || code.length !== 6 || !initialSendDone}
              onClick={() => void handleVerify()}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-semibold transition-all duration-200",
                "bg-[#0D1B2A] text-white hover:bg-[#1a3354] disabled:cursor-not-allowed disabled:opacity-50",
                "focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/25",
                "dark:bg-[#D4AF37] dark:text-[#0D1B2A] dark:hover:bg-[#c9a030]"
              )}
            >
              {verifying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("verify.verifying")}
                </>
              ) : (
                t("verify.verifyButton")
              )}
            </button>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                disabled={!canResend || resendLoading}
                onClick={() => void handleResend()}
                className={cn(
                  "text-sm font-semibold transition-colors",
                  canResend
                    ? "text-[#B8960C] hover:text-[#D4AF37] hover:underline"
                    : "cursor-not-allowed text-gray-400"
                )}
              >
                {resendLoading ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t("verify.resending")}
                  </span>
                ) : canResend ? (
                  t("verify.resendCode")
                ) : (
                  t("verify.resendIn", { seconds: secondsLeft })
                )}
              </button>
              <button
                type="button"
                onClick={handleChangeEmail}
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-[#D4AF37]",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t("verify.changeEmail")}
              </button>
            </div>

            {redirectTo && (
              <p className={cn("mt-6 text-center text-xs", isDark ? "text-gray-500" : "text-gray-400")}>
                {t("verify.redirectHint")}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
