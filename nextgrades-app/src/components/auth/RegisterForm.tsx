"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
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
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm({
  defaultRole = "student",
  redirectTo,
  onSwitchToLogin,
  compact = false,
}: RegisterFormProps) {
  const { theme } = useTheme();
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const inputClass = cn(
    "w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20",
    theme === "dark"
      ? "border-white/10 bg-[#112240]/50 text-white placeholder:text-gray-500 focus:bg-[#1a2e4a]"
      : "border-gray-200 bg-white text-[#0D1B2A] placeholder:text-gray-400"
  );

  const goToLogin = useCallback(() => {
    const params = new URLSearchParams();
    if (redirectTo) params.set("redirect", redirectTo);
    if (email) params.set("email", email);
    router.push(`/login${params.toString() ? `?${params}` : ""}`);
  }, [router, redirectTo, email]);

  useEffect(() => {
    if (!duplicateEmail) return;
    const timer = setTimeout(goToLogin, 4000);
    return () => clearTimeout(timer);
  }, [duplicateEmail, goToLogin]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) next.fullName = "Enter your full name";
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) next.email = "Enter a valid email";
    if (password.length < 8) next.password = "At least 8 characters";
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDuplicateEmail(false);
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
          throw new Error("Invalid response from server. Please try again.");
        }
      } else if (raw.trimStart().startsWith("<!DOCTYPE") || raw.trimStart().startsWith("<html")) {
        throw new Error(
          res.status === 404
            ? "Registration API is unavailable. Restart the dev server and try again."
            : "Server returned an unexpected page instead of JSON. Restart the dev server and try again."
        );
      } else {
        throw new Error(raw || "Registration failed");
      }

      if (res.status === 409 || data.code === "EMAIL_EXISTS") {
        setError("An account with this email already exists. Please sign in to continue.");
        setDuplicateEmail(true);
        return;
      }

      if (!res.ok) {
        throw new Error(
          (typeof data.error === "string" && data.error) ||
            (typeof data.details === "string" && data.details) ||
            "Registration failed"
        );
      }

      setSuccessMessage(
        typeof data.message === "string" ? data.message : "Account created! You can sign in now."
      );
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
              <p className="font-semibold">Account created</p>
              <p className="mt-1 opacity-90">{successMessage}</p>
            </div>
            <Link
              href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}&email=${encodeURIComponent(email)}` : `/login?email=${encodeURIComponent(email)}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#0D1B2A] hover:opacity-90"
            >
              Sign in now <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {error && (
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
                  Go to Login <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
                </button>
                <span className="text-xs opacity-75">Redirecting in a few seconds…</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className={cn("text-sm font-semibold", theme === "dark" ? "text-gray-300" : "text-gray-700")}>
          I&apos;m registering as
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
                  : theme === "dark"
                    ? "border-white/10 bg-[#112240]/50 hover:border-[#D4AF37]/40"
                    : "border-gray-200 bg-white hover:border-[#D4AF37]/40"
              )}
            >
              <p className={cn("text-sm font-bold capitalize", theme === "dark" ? "text-white" : "text-[#0D1B2A]")}>
                {r}
              </p>
              <p className={cn("mt-1 text-xs", theme === "dark" ? "text-gray-400" : "text-gray-500")}>
                {r === "student" ? "Learn & grow" : "Teach & inspire"}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="reg-full-name" className={cn("text-sm font-semibold", theme === "dark" ? "text-gray-300" : "text-gray-700")}>
          Full Name
        </label>
        <div className="relative">
          <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="reg-full-name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={cn(inputClass, fieldErrors.fullName && "border-red-500")}
            aria-invalid={Boolean(fieldErrors.fullName)}
          />
        </div>
        {fieldErrors.fullName && <p className="text-xs text-red-500">{fieldErrors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="reg-email" className={cn("text-sm font-semibold", theme === "dark" ? "text-gray-300" : "text-gray-700")}>
          Email Address
        </label>
        <div className="relative">
          <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(inputClass, fieldErrors.email && "border-red-500")}
            aria-invalid={Boolean(fieldErrors.email)}
          />
        </div>
        {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="reg-password" className={cn("text-sm font-semibold", theme === "dark" ? "text-gray-300" : "text-gray-700")}>
          Password
        </label>
        <div className="relative">
          <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(inputClass, "pr-12", fieldErrors.password && "border-red-500")}
            aria-invalid={Boolean(fieldErrors.password)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-5 w-5" />
          </button>
        </div>
        {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="reg-confirm" className={cn("text-sm font-semibold", theme === "dark" ? "text-gray-300" : "text-gray-700")}>
          Confirm Password
        </label>
        <div className="relative">
          <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="reg-confirm"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={cn(inputClass, "pr-12", fieldErrors.confirmPassword && "border-red-500")}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37]"
            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
          >
            <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} className="h-5 w-5" />
          </button>
        </div>
        {fieldErrors.confirmPassword && <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>}
      </div>

      <Button
        type="submit"
        variant="gold"
        size={compact ? "lg" : "xl"}
        className="mt-2 w-full !rounded-xl"
        disabled={loading}
      >
        {loading ? "Creating account…" : "Create Account"}
      </Button>

      <p className={cn("text-center text-sm", theme === "dark" ? "text-gray-400" : "text-gray-600")}>
        Already have an account?{" "}
        {onSwitchToLogin ? (
          <button type="button" onClick={onSwitchToLogin} className="font-bold text-[#D4AF37] hover:opacity-90">
            Sign in
          </button>
        ) : (
          <Link href="/login" className="font-bold text-[#D4AF37] hover:opacity-90">
            Sign in
          </Link>
        )}
      </p>
    </form>
  );
}
