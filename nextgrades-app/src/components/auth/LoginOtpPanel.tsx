"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type LoginOtpPanelProps = {
  onVerified: () => void | Promise<void>;
  onError?: (message: string) => void;
  className?: string;
  variant?: "default" | "inline";
};

export function LoginOtpPanel({
  onVerified,
  onError,
  className,
  variant = "default",
}: LoginOtpPanelProps) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendOk, setResendOk] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");
  const inline = variant === "inline";

  const report = useCallback(
    (msg: string) => {
      setLocalError(msg);
      onError?.(msg);
    },
    [onError]
  );

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setLocalError(null);
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
    const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = async () => {
    setResendLoading(true);
    setLocalError(null);
    try {
      const res = await fetch("/api/auth/login/resend-otp", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("login.resendVerificationFailed"));
      setResendOk(true);
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (err) {
      report(err instanceof Error ? err.message : t("login.resendVerificationFailed"));
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      report(t("login.verificationCodeIncomplete"));
      return;
    }
    setVerifying(true);
    setLocalError(null);
    try {
      const res = await fetch("/api/auth/login/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, rememberDevice }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("login.verificationCodeInvalid"));
      await onVerified();
    } catch (err) {
      report(err instanceof Error ? err.message : t("login.verificationCodeInvalid"));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <p className={cn("text-sm", inline && "opacity-90")}>
        {t("login.loginOtpPrompt", { defaultValue: "Enter the 6-digit login code we sent to your email." })}
      </p>
      <div
        className="flex justify-center gap-2 sm:gap-2.5"
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
            onChange={(e) => handleDigitChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={cn(
              "h-11 w-10 rounded-lg border-2 text-center text-lg font-semibold tabular-nums sm:h-12 sm:w-11",
              "border-[#D4AF37]/40 bg-white text-[#0D1B2A] focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20",
              "dark:border-[#D4AF37]/30 dark:bg-[#0D1B2A]/80 dark:text-white"
            )}
          />
        ))}
      </div>
      {localError && (
        <p className="text-center text-sm text-red-600 dark:text-red-400" role="alert">
          {localError}
        </p>
      )}
      {resendOk && (
        <p className="text-center text-sm text-green-700 dark:text-green-400" role="status">
          {t("login.resendVerificationSent")}
        </p>
      )}
      <label className="flex cursor-pointer items-center justify-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={rememberDevice}
          onChange={(e) => setRememberDevice(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#D4AF37]"
        />
        {t("login.rememberDevice", { defaultValue: "Remember this device for 30 days" })}
      </label>
      <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center", inline ? "" : "pt-1")}>
        <Button
          type="button"
          disabled={verifying || code.length !== 6}
          onClick={() => void handleVerify()}
          className="w-full sm:flex-1"
        >
          {verifying ? "…" : t("login.verifyCodeButton")}
        </Button>
        <button
          type="button"
          disabled={resendLoading}
          onClick={() => void handleResend()}
          className="text-sm font-semibold text-[#B8960C] underline-offset-2 hover:underline disabled:opacity-50"
        >
          {resendLoading ? "…" : t("login.resendVerification")}
        </button>
      </div>
    </div>
  );
}
