"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faEye,
  faEyeSlash,
  faCheckCircle,
  faExclamationCircle,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { bootstrapRecoverySession } from "@/lib/auth/recovery-session";
import { cn } from "@/lib/utils";
import { FontAwesomeSetup } from "@/components/auth/FontAwesomeSetup";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInviteSetup = searchParams.get("setup") === "required";

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await bootstrapRecoverySession(supabase);
      if (cancelled) return;

      if (result.ok) {
        setSessionReady(true);
        setError(null);
      } else {
        setSessionReady(false);
        setError(result.error);
      }
      setSessionLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/\d/.test(pwd)) strength += 15;
    if (/[^a-zA-Z\d]/.test(pwd)) strength += 10;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 33) return "bg-red-500";
    if (strength < 66) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 33) return "Weak";
    if (strength < 66) return "Fair";
    return "Strong";
  };

  const handlePasswordChange = (pwd: string) => {
    setPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate passwords
    if (!password || !confirmPassword) {
      setError("Please enter both passwords");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (!sessionReady) {
      setError("Your reset session expired. Please request a new reset link.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string; code?: string };

      if (!res.ok) {
        if (res.status === 401 || data.code === "session_missing") {
          setSessionReady(false);
        }
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?password_set=1");
        router.refresh();
      }, 2200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FontAwesomeSetup />
    <div className={cn(
      "min-h-screen flex flex-col",
      theme === "dark"
        ? "bg-gradient-to-br from-[#0D1B2A] via-[#112240] to-[#0D1B2A]"
        : "bg-gradient-to-br from-[#FAFAFA] via-white to-[#D4AF37]/10"
    )}>
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-24 px-4">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className={`bg-gradient-to-br ${
            theme === "dark"
              ? "from-[#0D1B2A]/90 to-[#1a2e4a]/90"
              : "from-white/95 to-white/90"
          } backdrop-blur-xl rounded-2xl shadow-2xl border ${
            theme === "dark"
              ? "border-[#D4AF37]/20"
              : "border-[#D4AF37]/10"
          } overflow-hidden transition-all duration-300`}>
            
            <div className="p-8 sm:p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  success
                    ? "bg-green-500/20"
                    : "bg-[#D4AF37]/20"
                }`}>
                  <FontAwesomeIcon
                    icon={success ? faCheckCircle : faLock}
                    className={`w-8 h-8 ${
                      success
                        ? "text-green-500"
                        : "text-[#D4AF37]"
                    }`}
                  />
                </div>
                
                <h1 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
                  theme === "dark"
                    ? "from-white to-[#D4AF37]"
                    : "from-[#0D1B2A] to-[#D4AF37]"
                } bg-clip-text text-transparent`}>
                  {success ? "Password Set!" : isInviteSetup ? "Activate Your Account" : "Create New Password"}
                </h1>
                
                <p className={`text-sm ${
                  theme === "dark"
                    ? "text-gray-300"
                    : "text-gray-600"
                }`}>
                  {success
                    ? "Your password is ready. Sign in to open your dashboard."
                    : isInviteSetup
                      ? "Choose a personal password to finish setting up your NextGrades account."
                      : "Enter a strong password to secure your account"}
                </p>
              </div>

              {/* Error Message */}
              {error && sessionReady && !sessionLoading && (
                <div className={`mb-6 p-4 rounded-xl text-sm border-l-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${
                  theme === "dark"
                    ? "bg-red-500/10 border-red-500 text-red-300"
                    : "bg-red-50 border-red-500 text-red-700"
                }`}>
                  <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Session bootstrap / invalid link */}
              {sessionLoading ? (
                <div className="space-y-4 py-6 text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
                  <p className={cn("text-sm", theme === "dark" ? "text-gray-300" : "text-gray-600")}>
                    Verifying your reset link…
                  </p>
                </div>
              ) : !sessionReady ? (
                <div className="space-y-6 text-center">
                  <p className={cn("text-sm leading-relaxed", theme === "dark" ? "text-gray-300" : "text-gray-600")}>
                    {error || "This reset link is invalid or has expired."}
                  </p>
                  <Button variant="gold" size="md" href="/forgot-password" className="w-full">
                    Request a new reset link
                  </Button>
                  <Link href="/login" className="text-sm font-medium text-[#D4AF37] hover:underline">
                    Back to login
                  </Link>
                </div>
              ) : success ? (
                <div className="space-y-6 text-center animate-in fade-in">
                  <div className={`p-6 rounded-xl border-2 ${
                    theme === "dark"
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-green-200 bg-green-50"
                  }`}>
                    <p className={`text-sm leading-relaxed mb-2 ${
                      theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-600"
                    }`}>
                      Your password has been saved. You will be redirected to sign in shortly.
                    </p>
                    <p className={`text-xs ${
                      theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}>
                      Use your email and new password to access your dashboard.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              ) : (
                /* Reset Form */
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Password Field */}
                  <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                    <label className={`text-sm font-semibold ${
                      theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}>
                      New Password
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faLock}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        className={`w-full pl-12 pr-14 py-3 rounded-xl border-2 transition-all duration-200 ${
                          theme === "dark"
                            ? "border-white/10 bg-[#112240]/50"
                            : "border-gray-200 bg-white"
                        } ${
                          theme === "dark"
                            ? "text-white placeholder:text-gray-500"
                            : "text-[#0D1B2A] placeholder:text-gray-400"
                        } focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:bg-white dark:focus:bg-[#1a2e4a]`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors duration-200"
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                          className="w-5 h-5"
                        />
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500">Strength:</span>
                          <span className={`text-xs font-bold ${
                            passwordStrength < 33 ? "text-red-500" : 
                            passwordStrength < 66 ? "text-yellow-500" : 
                            "text-green-500"
                          }`}>
                            {getPasswordStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <div className={`h-2 rounded-full bg-gray-200 overflow-hidden ${theme === "dark" ? "bg-gray-700" : ""}`}>
                          <div 
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`} 
                            style={{ width: `${passwordStrength}%` }} 
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Use uppercase, lowercase, numbers, and symbols for a stronger password
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                    <label className={`text-sm font-semibold ${
                      theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faLock}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-12 pr-14 py-3 rounded-xl border-2 transition-all duration-200 ${
                          confirmPassword && password !== confirmPassword
                            ? theme === "dark"
                              ? "border-red-500 bg-red-500/5"
                              : "border-red-200 bg-red-50"
                            : theme === "dark"
                            ? "border-white/10 bg-[#112240]/50"
                            : "border-gray-200 bg-white"
                        } ${
                          theme === "dark"
                            ? "text-white placeholder:text-gray-500"
                            : "text-[#0D1B2A] placeholder:text-gray-400"
                        } focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:bg-white dark:focus:bg-[#1a2e4a]`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors duration-200"
                      >
                        <FontAwesomeIcon
                          icon={showConfirmPassword ? faEyeSlash : faEye}
                          className="w-5 h-5"
                        />
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                        Passwords match
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="gold"
                    size="xl"
                    className="w-full !rounded-xl mt-7 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
                    disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        {isInviteSetup ? "Set password" : "Reset Password"}
                        <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Security Info */}
          {!success && sessionReady && !sessionLoading && (
            <div className={`mt-8 p-4 rounded-xl border ${
              theme === "dark"
                ? "border-white/10 bg-white/5"
                : "border-gray-200 bg-gray-50"
            }`}>
              <p className={`text-xs text-center leading-relaxed ${
                theme === "dark"
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}>
                🔒 <strong>Password Requirements:</strong> Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols for maximum security.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}

